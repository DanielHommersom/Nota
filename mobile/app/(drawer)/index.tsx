import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { HeaderButton } from "expo-router/react-navigation";
import { FileText, Inbox, Plus } from "lucide-react-native";
import { Button, useTheme } from "react-native-paper";

import { StatCard } from "@/features/dashboard/StatCard";
import { useInvoiceStore } from "@/features/invoices/InvoiceStore";
import { summarizeReceivables } from "@/features/invoices/receivables";
import { useExpenses } from "@/features/expenses/useExpenses";
import { summarizeExpenses } from "@/features/expenses/summary";
import { formatEuroCents } from "@/lib/currency";

/**
 * Landing page after login (see app/_layout.tsx's AuthGate — "/" already
 * meant "authenticated + onboarded", so repurposing this route as the
 * dashboard needed no redirect changes; the old Facturen list moved to
 * /invoices instead). Two at-a-glance cards — Facturen, Inkomend — plus the
 * same one-tap "nieuwe factuur" entry point the drawer and the old
 * Facturen header already offered, so landing here doesn't cost the
 * "30 seconden" flow any extra taps.
 *
 * The "Bank" card (saldo via a PSD2/open-banking connection) was pulled
 * back out — that needs a real backend and reconciliation logic that
 * doesn't exist yet, so it stayed mock-only and was removed rather than
 * shipped as a fake number. See src/features/bank/ removal.
 */
export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { invoices } = useInvoiceStore();
  const { data: expenses } = useExpenses();

  const receivables = useMemo(() => summarizeReceivables(invoices), [invoices]);
  const expenseSummary = useMemo(() => summarizeExpenses(expenses), [expenses]);

  return (
    <View className="flex-1 bg-bg">
      <Drawer.Screen
        options={{
          title: "Dashboard",
          headerRight: () => (
            <HeaderButton onPress={() => router.push("/invoice/new")} accessibilityLabel="Nieuwe factuur">
              <Plus color={theme.colors.primary} size={22} />
            </HeaderButton>
          ),
        }}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}>
        <StatCard
          icon={FileText}
          label="Facturen"
          primaryValue={formatEuroCents(receivables.teOntvangenCents)}
          rows={[
            {
              label: "Te ontvangen",
              value: `${receivables.teOntvangenCount} ${receivables.teOntvangenCount === 1 ? "factuur" : "facturen"}`,
            },
            {
              label: "Te herinneren",
              value: `${receivables.teHerinnerenCount}`,
              valueClassName: receivables.teHerinnerenCount > 0 ? "text-warn" : "text-ink",
            },
          ]}
          onPress={() => router.push("/invoices")}
          accessibilityLabel={`Facturen, ${formatEuroCents(receivables.teOntvangenCents)} te ontvangen`}
        />

        <StatCard
          icon={Inbox}
          iconColor={theme.colors.error}
          iconBgClassName="bg-warn-soft"
          label="Inkomend"
          primaryValue={formatEuroCents(expenseSummary.openCents)}
          rows={[
            {
              label: "Openstaand",
              value: `${expenseSummary.openCount} ${expenseSummary.openCount === 1 ? "factuur" : "facturen"}`,
            },
          ]}
          onPress={() => router.push("/expenses")}
          accessibilityLabel={`Inkomende facturen, ${formatEuroCents(expenseSummary.openCents)} openstaand`}
        />

        <Button
          mode="contained"
          onPress={() => router.push("/invoice/new")}
          accessibilityLabel="Nieuwe factuur"
          icon={({ size, color }) => <Plus color={color} size={size} />}
          contentStyle={{ height: 48 }}
          style={{ marginTop: 8, borderRadius: 14 }}
        >
          Nieuwe factuur
        </Button>
      </ScrollView>
    </View>
  );
}
