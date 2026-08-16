import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Bell, CheckCircle2, Circle, Eye, Send, Share2 } from "lucide-react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { Card, CardRow } from "@/components/ui/Card";
import { useInvoiceStore } from "@/features/invoices/InvoiceStore";
import { useCompanyProfile } from "@/features/company/CompanyProfileContext";
import { useBranding } from "@/features/branding/BrandingContext";
import { isInvoiceOverdue } from "@/features/invoices/receivables";
import { formatEuroCents } from "@/lib/currency";
import { formatDate, formatRelativeTime } from "@/lib/time";
import { calculateItemTotal, calculateInvoiceTotals } from "@/lib/vat";
import { buildInvoiceHtml } from "@/lib/invoiceHtml";
import { shareInvoicePdf, viewInvoicePdf } from "@/lib/pdf";

export default function InvoiceDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { invoices, updateInvoice, sendReminder } = useInvoiceStore();
  const { data: company } = useCompanyProfile();
  const { branding } = useBranding();
  const invoice = invoices.find((inv) => inv.id === id);

  const [pdfBusy, setPdfBusy] = useState<"view" | "share" | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [reminding, setReminding] = useState(false);
  const [justReminded, setJustReminded] = useState(false);

  if (!invoice) {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-6">
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Factuur niet gevonden.
        </Text>
      </View>
    );
  }

  const STATUS_COPY: Record<string, { label: string; color: string }> = {
    sent: { label: "Verstuurd", color: theme.colors.tertiary },
    queued: { label: "In wachtrij", color: theme.colors.primary },
    failed: { label: "Mislukt", color: theme.colors.error },
    draft: { label: "Concept", color: theme.colors.onSurfaceVariant },
    sending: { label: "Bezig met verzenden", color: theme.colors.primary },
  };

  // Re-bound so TS's narrowing (and closures below) don't lose the
  // "definitely not undefined" guarantee the guard above already proved.
  const inv = invoice;
  const totals = calculateInvoiceTotals(inv.items);
  const vatBreakdown = Object.entries(totals.vatByRate) as [string, number][];
  const statusCopy = STATUS_COPY[inv.status] ?? { label: inv.status, color: theme.colors.onSurface };
  const canDeliver = inv.status === "sent" || inv.status === "failed" || inv.status === "queued";
  const isPaid = inv.paidAt !== null;
  const isOverdue = isInvoiceOverdue(inv);

  function handleTogglePaid() {
    updateInvoice(inv.id, { paidAt: isPaid ? null : new Date().toISOString() });
  }

  async function handleSendReminder() {
    setReminding(true);
    await sendReminder(inv.id);
    setReminding(false);
    setJustReminded(true);
    setTimeout(() => setJustReminded(false), 2500);
  }

  async function handleViewPdf() {
    setPdfBusy("view");
    try {
      const html = buildInvoiceHtml(inv, company, branding);
      await viewInvoicePdf(html);
    } catch {
      Alert.alert("PDF weergeven mislukt", "Probeer het opnieuw.");
    } finally {
      setPdfBusy(null);
    }
  }

  async function handleSharePdf() {
    setPdfBusy("share");
    try {
      const html = buildInvoiceHtml(inv, company, branding);
      await shareInvoicePdf(html, `Factuur ${inv.invoiceNumber ?? inv.id}.pdf`);
    } catch {
      Alert.alert("Delen mislukt", "Probeer het opnieuw.");
    } finally {
      setPdfBusy(null);
    }
  }

  async function handleResend() {
    setResending(true);
    // Mock — real resend hits the send API route again (T3). Locally this
    // just re-stamps sentAt so the "opnieuw verstuurd" moment is visible.
    await new Promise((resolve) => setTimeout(resolve, 700));
    updateInvoice(inv.id, { sentAt: new Date().toISOString() });
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 2500);
  }

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
        Factuur {invoice.invoiceNumber ?? "(concept)"}
      </Text>
      <Text variant="headlineMedium" style={{ fontWeight: "700", color: theme.colors.onSurface, marginBottom: 20 }}>
        {formatEuroCents(invoice.totalCents)}
      </Text>

      <Card>
        <CardRow>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
            Klant
          </Text>
          <Text variant="bodyMedium" style={{ fontWeight: "500", color: theme.colors.onSurface }}>
            {invoice.customer.name}
          </Text>
        </CardRow>
        <CardRow isLast={inv.status !== "sent"}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
            Status
          </Text>
          <Text variant="bodyMedium" style={{ fontWeight: "500", color: statusCopy.color }}>
            {statusCopy.label}
            {invoice.sentAt ? ` · ${formatRelativeTime(invoice.sentAt)}` : ""}
          </Text>
        </CardRow>
        {inv.status === "sent" ? (
          <CardRow>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Vervaldatum
            </Text>
            <Text variant="bodyMedium" style={{ fontWeight: "500", color: isOverdue ? theme.colors.error : theme.colors.onSurface }}>
              {inv.dueDate ? formatDate(inv.dueDate) : "—"}
              {isOverdue ? " · te laat" : ""}
            </Text>
          </CardRow>
        ) : null}
        {inv.status === "sent" ? (
          <CardRow isLast={!inv.remindedAt}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Betaald
            </Text>
            <Pressable
              onPress={handleTogglePaid}
              accessibilityRole="button"
              accessibilityLabel={isPaid ? "Markeer als onbetaald" : "Markeer als betaald"}
              hitSlop={8}
              className="min-h-11 flex-row items-center gap-1.5"
            >
              {isPaid ? <CheckCircle2 color={theme.colors.tertiary} size={16} /> : <Circle color={theme.colors.onSurfaceVariant} size={16} />}
              <Text variant="bodyMedium" style={{ fontWeight: "500", color: isPaid ? theme.colors.tertiary : theme.colors.onSurfaceVariant }}>
                {isPaid ? "Ja" : "Nee"}
              </Text>
            </Pressable>
          </CardRow>
        ) : null}
        {inv.status === "sent" && inv.remindedAt ? (
          <CardRow isLast>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Laatste herinnering
            </Text>
            <Text variant="bodyMedium" style={{ fontWeight: "500", color: theme.colors.onSurfaceVariant }}>
              {formatRelativeTime(inv.remindedAt)}
            </Text>
          </CardRow>
        ) : null}
      </Card>

      {isOverdue ? (
        <Button
          mode="contained-tonal"
          onPress={handleSendReminder}
          disabled={reminding}
          loading={reminding}
          accessibilityLabel={`Stuur betalingsherinnering naar ${inv.customer.name}`}
          icon={reminding ? undefined : ({ size, color }) => <Bell color={color} size={size} />}
          buttonColor={theme.colors.errorContainer}
          textColor={theme.colors.error}
          style={{ marginTop: 12, borderRadius: 14 }}
          contentStyle={{ height: 48 }}
        >
          {justReminded ? "Herinnering verstuurd ✓" : "Stuur betalingsherinnering"}
        </Button>
      ) : null}

      <View className="mt-4 flex-row gap-3">
        <Button
          mode="outlined"
          onPress={handleViewPdf}
          disabled={pdfBusy !== null}
          loading={pdfBusy === "view"}
          accessibilityLabel="PDF bekijken"
          icon={pdfBusy === "view" ? undefined : ({ size, color }) => <Eye color={color} size={size} />}
          style={{ flex: 1, borderRadius: 14, borderColor: theme.colors.outline }}
          contentStyle={{ height: 44 }}
          labelStyle={{ fontSize: 13 }}
        >
          PDF bekijken
        </Button>
        <Button
          mode="contained-tonal"
          onPress={handleSharePdf}
          disabled={pdfBusy !== null}
          loading={pdfBusy === "share"}
          accessibilityLabel="PDF downloaden of delen"
          icon={pdfBusy === "share" ? undefined : ({ size, color }) => <Share2 color={color} size={size} />}
          buttonColor={theme.colors.primaryContainer}
          textColor={theme.colors.primary}
          style={{ flex: 1, borderRadius: 14 }}
          contentStyle={{ height: 44 }}
          labelStyle={{ fontSize: 13 }}
        >
          Downloaden / delen
        </Button>
      </View>

      {canDeliver ? (
        <Button
          mode="outlined"
          onPress={handleResend}
          disabled={resending}
          loading={resending}
          accessibilityLabel="Factuur opnieuw versturen"
          icon={resending ? undefined : ({ size }) => <Send color={resent ? theme.colors.tertiary : theme.colors.onSurfaceVariant} size={size * 0.85} />}
          textColor={resent ? theme.colors.tertiary : theme.colors.onSurfaceVariant}
          style={{ marginTop: 12, borderRadius: 14, borderStyle: "dashed", borderColor: theme.colors.outline }}
        >
          {resent ? "Opnieuw verzonden ✓" : "Opnieuw versturen naar de klant"}
        </Button>
      ) : null}

      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4, marginTop: 20, marginBottom: 8 }}>
        {invoice.items.length > 1 ? "Regels" : "Omschrijving"}
      </Text>
      <Card>
        {invoice.items.map((item, index) => {
          const itemTotal = calculateItemTotal(item);
          return (
            <CardRow key={item.id} isLast={index === invoice.items.length - 1}>
              <View className="flex-1 pr-3">
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  {item.description}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                  {item.quantity} × {formatEuroCents(item.unitPriceCents)} · {item.vatRate}% BTW
                </Text>
              </View>
              <Text variant="bodyMedium" style={{ fontWeight: "500", color: theme.colors.onSurface }}>
                {formatEuroCents(itemTotal.totalCents)}
              </Text>
            </CardRow>
          );
        })}
      </Card>

      <Card className="mt-5 px-4 py-4">
        <View className="flex-row justify-between">
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Subtotaal
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {formatEuroCents(totals.subtotalCents)}
          </Text>
        </View>
        {vatBreakdown.map(([rate, cents]) => (
          <View key={rate} className="mt-1 flex-row justify-between">
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              BTW ({rate}%)
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {formatEuroCents(cents)}
            </Text>
          </View>
        ))}
        <View className="mt-2 flex-row justify-between border-t border-border pt-2">
          <Text variant="bodyMedium" style={{ fontWeight: "600", color: theme.colors.onSurface }}>
            Totaal
          </Text>
          <Text variant="bodyMedium" style={{ fontWeight: "600", color: theme.colors.onSurface }}>
            {formatEuroCents(totals.totalCents)}
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}
