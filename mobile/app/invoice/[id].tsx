import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Card, CardRow } from "@/components/ui/Card";
import { useInvoiceStore } from "@/features/invoices/InvoiceStore";
import { formatEuroCents } from "@/lib/currency";
import { formatRelativeTime } from "@/lib/time";
import { calculateItemTotal, calculateInvoiceTotals } from "@/lib/vat";

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { invoices } = useInvoiceStore();
  const invoice = invoices.find((inv) => inv.id === id);

  if (!invoice) {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-6">
        <Text className="text-[15px] text-muted">Factuur niet gevonden.</Text>
      </View>
    );
  }

  const totals = calculateInvoiceTotals(invoice.items);
  const vatBreakdown = Object.entries(totals.vatByRate) as [string, number][];

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ padding: 16 }}>
      <Text className="mb-1 text-[13px] text-muted">Factuur {invoice.invoiceNumber ?? "(concept)"}</Text>
      <Text className="mb-5 text-[26px] font-bold tracking-tight text-ink">
        {formatEuroCents(invoice.totalCents)}
      </Text>

      <Card>
        <CardRow>
          <Text className="text-[15px] text-ink">Klant</Text>
          <Text className="text-[15px] font-medium text-ink">{invoice.customer.name}</Text>
        </CardRow>
        <CardRow isLast>
          <Text className="text-[15px] text-ink">Status</Text>
          <Text className="text-[15px] font-medium text-success">
            {invoice.status === "sent" ? "Verstuurd" : invoice.status}
            {invoice.sentAt ? ` · ${formatRelativeTime(invoice.sentAt)}` : ""}
          </Text>
        </CardRow>
      </Card>

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
