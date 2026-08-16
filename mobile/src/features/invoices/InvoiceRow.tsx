import { useState } from "react";
import { Pressable, View } from "react-native";
import { Bell, Check } from "lucide-react-native";
import { List, Text, useTheme } from "react-native-paper";
import { formatEuroCents } from "@/lib/currency";
import { formatRelativeTime } from "@/lib/time";
import { isInvoiceOverdue } from "./receivables";
import type { Invoice } from "./types";

const STATUS_LABEL: Record<Invoice["status"], string> = {
  draft: "Concept",
  queued: "In wachtrij",
  sending: "Bezig met verzenden",
  sent: "Verstuurd",
  failed: "Mislukt",
};

/**
 * One row in the Facturen list, now Paper's <List.Item> — title +
 * description + a trailing element is exactly its shape. `onSendReminder`
 * is optional so callers that don't need the quick action (none currently,
 * but keeps this component usable standalone) don't have to pass a no-op.
 */
export function InvoiceRow({
  invoice,
  onPress,
  onSendReminder,
}: {
  invoice: Invoice;
  onPress: () => void;
  onSendReminder?: (id: string) => Promise<void>;
}) {
  const theme = useTheme();
  const [reminding, setReminding] = useState(false);
  const [justReminded, setJustReminded] = useState(false);
  const overdue = isInvoiceOverdue(invoice);

  const statusColor: Record<Invoice["status"], string> = {
    draft: theme.colors.onSurfaceVariant,
    queued: theme.colors.primary,
    sending: theme.colors.primary,
    sent: theme.colors.tertiary,
    failed: theme.colors.error,
  };

  async function handleReminderPress() {
    if (!onSendReminder || reminding) return;
    setReminding(true);
    await onSendReminder(invoice.id);
    setReminding(false);
    setJustReminded(true);
    setTimeout(() => setJustReminded(false), 2500);
  }

  return (
    <List.Item
      title={invoice.customer.name}
      titleStyle={{ fontSize: 15, fontWeight: "500", color: theme.colors.onSurface }}
      titleNumberOfLines={1}
      description={
        `${STATUS_LABEL[invoice.status]}${invoice.sentAt ? ` · ${formatRelativeTime(invoice.sentAt)}` : ""}` +
        (overdue ? " · Te laat" : "")
      }
      descriptionStyle={{ fontSize: 12, color: overdue ? theme.colors.error : statusColor[invoice.status] }}
      onPress={onPress}
      accessibilityLabel={`Factuur aan ${invoice.customer.name}, ${formatEuroCents(invoice.totalCents)}, ${STATUS_LABEL[invoice.status]}${overdue ? ", te laat" : ""}`}
      style={{ paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.outlineVariant }}
      right={() => (
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
            {formatEuroCents(invoice.totalCents)}
          </Text>
          {overdue && onSendReminder ? (
            // A separate Pressable inside List.Item's `right` slot — RN's
            // touch responder system lets this inner element claim its own
            // tap without also firing the row's own `onPress` (same nested-
            // touch-target pattern PasswordInput's show/hide icon already
            // relies on), so tapping "Herinneren" never also opens the
            // invoice. Exists so chasing several overdue invoices doesn't
            // require drilling into each one individually just to nudge
            // the customer — the detail screen still has the full-size
            // version of this same action for when you're already there.
            <Pressable
              onPress={handleReminderPress}
              disabled={reminding}
              accessibilityRole="button"
              accessibilityLabel={`Stuur betalingsherinnering naar ${invoice.customer.name}`}
              hitSlop={8}
              className="min-h-11 flex-row items-center gap-1"
            >
              {justReminded ? (
                <Check color={theme.colors.tertiary} size={13} />
              ) : (
                <Bell color={theme.colors.error} size={13} />
              )}
              <Text
                variant="labelSmall"
                style={{ color: justReminded ? theme.colors.tertiary : theme.colors.error, fontWeight: "600" }}
              >
                {reminding ? "Versturen…" : justReminded ? "Verstuurd" : "Herinneren"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      )}
    />
  );
}
