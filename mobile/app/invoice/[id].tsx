import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { CheckCircle2, Circle, Eye, Send, Share2 } from "lucide-react-native";
import { Card, CardRow } from "@/components/ui/Card";
import { useInvoiceStore } from "@/features/invoices/InvoiceStore";
import { useCompanyProfile } from "@/features/company/CompanyProfileContext";
import { useBranding } from "@/features/branding/BrandingContext";
import { formatEuroCents } from "@/lib/currency";
import { formatDate, formatRelativeTime, isPastDue } from "@/lib/time";
import { calculateItemTotal, calculateInvoiceTotals } from "@/lib/vat";
import { buildInvoiceHtml } from "@/lib/invoiceHtml";
import { shareInvoicePdf, viewInvoicePdf } from "@/lib/pdf";

const STATUS_COPY: Record<string, { label: string; className: string }> = {
  sent: { label: "Verstuurd", className: "text-success" },
  queued: { label: "In wachtrij", className: "text-accent" },
  failed: { label: "Mislukt", className: "text-warn" },
  draft: { label: "Concept", className: "text-muted" },
  sending: { label: "Bezig met verzenden", className: "text-accent" },
};

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { invoices, updateInvoice } = useInvoiceStore();
  const { data: company } = useCompanyProfile();
  const { branding } = useBranding();
  const invoice = invoices.find((inv) => inv.id === id);

  const [pdfBusy, setPdfBusy] = useState<"view" | "share" | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  if (!invoice) {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-6">
        <Text className="text-[15px] text-muted">Factuur niet gevonden.</Text>
      </View>
    );
  }

  // Re-bound so TS's narrowing (and closures below) don't lose the
  // "definitely not undefined" guarantee the guard above already proved.
  const inv = invoice;
  const totals = calculateInvoiceTotals(inv.items);
  const vatBreakdown = Object.entries(totals.vatByRate) as [string, number][];
  const statusCopy = STATUS_COPY[inv.status] ?? { label: inv.status, className: "text-ink" };
  const canDeliver = inv.status === "sent" || inv.status === "failed" || inv.status === "queued";
  const isPaid = inv.paidAt !== null;
  const isOverdue = inv.status === "sent" && !isPaid && inv.dueDate !== null && isPastDue(inv.dueDate);

  function handleTogglePaid() {
    updateInvoice(inv.id, { paidAt: isPaid ? null : new Date().toISOString() });
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
      <Text className="mb-1 text-[13px] text-muted">Factuur {invoice.invoiceNumber ?? "(concept)"}</Text>
      <Text className="mb-5 text-[26px] font-bold tracking-tight text-ink">
        {formatEuroCents(invoice.totalCents)}
      </Text>

      <Card>
        <CardRow>
          <Text className="text-[15px] text-ink">Klant</Text>
          <Text className="text-[15px] font-medium text-ink">{invoice.customer.name}</Text>
        </CardRow>
        <CardRow isLast={inv.status !== "sent"}>
          <Text className="text-[15px] text-ink">Status</Text>
          <Text className={`text-[15px] font-medium ${statusCopy.className}`}>
            {statusCopy.label}
            {invoice.sentAt ? ` · ${formatRelativeTime(invoice.sentAt)}` : ""}
          </Text>
        </CardRow>
        {inv.status === "sent" ? (
          <CardRow>
            <Text className="text-[15px] text-ink">Vervaldatum</Text>
            <Text className={`text-[15px] font-medium ${isOverdue ? "text-warn" : "text-ink"}`}>
              {inv.dueDate ? formatDate(inv.dueDate) : "—"}
              {isOverdue ? " · te laat" : ""}
            </Text>
          </CardRow>
        ) : null}
        {inv.status === "sent" ? (
          <CardRow isLast>
            <Text className="text-[15px] text-ink">Betaald</Text>
            <Pressable
              onPress={handleTogglePaid}
              accessibilityRole="button"
              accessibilityLabel={isPaid ? "Markeer als onbetaald" : "Markeer als betaald"}
              hitSlop={8}
              className="min-h-11 flex-row items-center gap-1.5"
            >
              {isPaid ? <CheckCircle2 color="#16a34a" size={16} /> : <Circle color="#6b6b70" size={16} />}
              <Text className={`text-[15px] font-medium ${isPaid ? "text-success" : "text-muted"}`}>
                {isPaid ? "Ja" : "Nee"}
              </Text>
            </Pressable>
          </CardRow>
        ) : null}
      </Card>

      <View className="mt-4 flex-row gap-3">
        <Pressable
          onPress={handleViewPdf}
          disabled={pdfBusy !== null}
          accessibilityRole="button"
          accessibilityLabel="PDF bekijken"
          className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-control border border-border bg-card"
        >
          {pdfBusy === "view" ? <ActivityIndicator size="small" color="#2563eb" /> : <Eye color="#2563eb" size={16} />}
          <Text className="text-[14px] font-semibold text-accent">PDF bekijken</Text>
        </Pressable>
        <Pressable
          onPress={handleSharePdf}
          disabled={pdfBusy !== null}
          accessibilityRole="button"
          accessibilityLabel="PDF downloaden of delen"
          className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-control bg-accent-soft"
        >
          {pdfBusy === "share" ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : (
            <Share2 color="#2563eb" size={16} />
          )}
          <Text className="text-[14px] font-semibold text-accent">Downloaden / delen</Text>
        </Pressable>
      </View>

      {canDeliver ? (
        <Pressable
          onPress={handleResend}
          disabled={resending}
          accessibilityRole="button"
          accessibilityLabel="Factuur opnieuw versturen"
          className="mt-3 h-11 flex-row items-center justify-center gap-2 rounded-control border border-dashed border-border"
        >
          {resending ? (
            <ActivityIndicator size="small" color="#6b6b70" />
          ) : (
            <Send color={resent ? "#16a34a" : "#6b6b70"} size={15} />
          )}
          <Text className={`text-[13px] font-medium ${resent ? "text-success" : "text-muted"}`}>
            {resent ? "Opnieuw verzonden ✓" : "Opnieuw versturen naar de klant"}
          </Text>
        </Pressable>
      ) : null}

      <Text className="mb-2 ml-1 mt-5 text-[12px] font-semibold uppercase tracking-wide text-muted">
        {invoice.items.length > 1 ? "Regels" : "Omschrijving"}
      </Text>
      <Card>
        {invoice.items.map((item, index) => {
          const itemTotal = calculateItemTotal(item);
          return (
            <CardRow key={item.id} isLast={index === invoice.items.length - 1}>
              <View className="flex-1 pr-3">
                <Text className="text-[15px] text-ink">{item.description}</Text>
                <Text className="mt-0.5 text-[12px] text-muted">
                  {item.quantity} × {formatEuroCents(item.unitPriceCents)} · {item.vatRate}% BTW
                </Text>
              </View>
              <Text className="text-[15px] font-medium text-ink">{formatEuroCents(itemTotal.totalCents)}</Text>
            </CardRow>
          );
        })}
      </Card>

      <Card className="mt-5 px-4 py-4">
        <View className="flex-row justify-between">
          <Text className="text-[13px] text-muted">Subtotaal</Text>
          <Text className="text-[13px] text-muted">{formatEuroCents(totals.subtotalCents)}</Text>
        </View>
        {vatBreakdown.map(([rate, cents]) => (
          <View key={rate} className="mt-1 flex-row justify-between">
            <Text className="text-[13px] text-muted">BTW ({rate}%)</Text>
            <Text className="text-[13px] text-muted">{formatEuroCents(cents)}</Text>
          </View>
        ))}
        <View className="mt-2 flex-row justify-between border-t border-border pt-2">
          <Text className="text-[15px] font-semibold text-ink">Totaal</Text>
          <Text className="text-[15px] font-semibold text-ink">{formatEuroCents(totals.totalCents)}</Text>
        </View>
      </Card>
    </ScrollView>
  );
}
