import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Card, CardRow } from "@/components/ui/Card";
import { useInvoiceStore } from "@/features/invoices/InvoiceStore";
import { formatEuroCents } from "@/lib/currency";
import { formatRelativeTime } from "@/lib/time";

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
        <CardRow>
          <Text className="text-[15px] text-ink">Omschrijving</Text>
          <Text className="text-[15px] font-medium text-ink">{invoice.description}</Text>
        </CardRow>
        <CardRow>
          <Text className="text-[15px] text-ink">BTW</Text>
          <Text className="text-[15px] font-medium text-ink">{invoice.vatRate}%</Text>
        </CardRow>
        <CardRow isLast>
          <Text className="text-[15px] text-ink">Status</Text>
          <Text className="text-[15px] font-medium text-success">
            {invoice.status === "sent" ? "Verstuurd" : invoice.status}
            {invoice.sentAt ? ` · ${formatRelativeTime(invoice.sentAt)}` : ""}
          </Text>
        </CardRow>
      </Card>
    </ScrollView>
  );
}
