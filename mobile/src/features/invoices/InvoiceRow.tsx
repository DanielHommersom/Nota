import { Pressable, Text, View } from "react-native";
import { formatEuroCents } from "@/lib/currency";
import { formatRelativeTime } from "@/lib/time";
import type { Invoice } from "./types";

const STATUS_LABEL: Record<Invoice["status"], string> = {
  draft: "Concept",
  queued: "In wachtrij",
  sending: "Bezig met verzenden",
  sent: "Verstuurd",
  failed: "Mislukt",
};

const STATUS_COLOR: Record<Invoice["status"], string> = {
  draft: "text-muted",
  queued: "text-accent",
  sending: "text-accent",
  sent: "text-success",
  failed: "text-warn",
};

export function InvoiceRow({ invoice, onPress }: { invoice: Invoice; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Factuur aan ${invoice.customer.name}, ${formatEuroCents(invoice.totalCents)}, ${STATUS_LABEL[invoice.status]}`}
      className="flex-row items-center justify-between px-4 py-3.5 border-b border-border active:bg-bg"
    >
      <View className="flex-1 pr-3">
        <Text className="text-[15px] font-medium text-ink" numberOfLines={1}>
          {invoice.customer.name}
        </Text>
        <Text className={`mt-0.5 text-[12px] ${STATUS_COLOR[invoice.status]}`}>
          {STATUS_LABEL[invoice.status]}
          {invoice.sentAt ? ` · ${formatRelativeTime(invoice.sentAt)}` : ""}
        </Text>
      </View>
      <Text className="text-[15px] font-semibold text-ink">{formatEuroCents(invoice.totalCents)}</Text>
    </Pressable>
  );
}
