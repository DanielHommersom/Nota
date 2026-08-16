import { FlatList, Text, View } from "react-native";
import { Inbox } from "lucide-react-native";
import { useExpenses } from "@/features/expenses/useExpenses";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatEuroCents } from "@/lib/currency";
import { isPastDue } from "@/lib/time";
import type { Expense } from "@/features/expenses/types";

const STATUS_LABEL: Record<Expense["status"], string> = {
  open: "Openstaand",
  paid: "Betaald",
};

function ExpenseRow({ expense }: { expense: Expense }) {
  const overdue = expense.status === "open" && isPastDue(expense.dueDate);
  const statusClassName = overdue ? "text-warn" : expense.status === "paid" ? "text-success" : "text-muted";

  return (
    <View
      className="flex-row items-center justify-between border-b border-border px-4 py-3.5"
      accessible
      accessibilityLabel={`${expense.supplierName}, ${formatEuroCents(expense.amountCents)}, ${overdue ? "te laat, " : ""}${STATUS_LABEL[expense.status]}`}
    >
      <View className="flex-1 pr-3">
        <Text className="text-[15px] font-medium text-ink" numberOfLines={1}>
          {expense.supplierName}
        </Text>
        <Text className="mt-0.5 text-[12px] text-muted" numberOfLines={1}>
          {expense.description}
        </Text>
        <Text className={`mt-0.5 text-[12px] ${statusClassName}`}>
          {overdue ? "Te laat · " : ""}
          {STATUS_LABEL[expense.status]}
        </Text>
      </View>
      <Text className="text-[15px] font-semibold text-ink">{formatEuroCents(expense.amountCents)}</Text>
    </View>
  );
}

/**
 * Read-only for now — there's no ingestion flow yet (email forwarding,
 * receipt scan, manual entry) so there's nothing to add/edit from here.
 * Reached only from the dashboard's "Inkomend" card, not from the drawer.
 */
export default function ExpensesScreen() {
  const { data: expenses } = useExpenses();

  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Nog geen inkomende facturen"
        subtitle="Kosten en inkoopfacturen die binnenkomen verschijnen hier zodra je ze toevoegt."
      />
    );
  }

  return (
    <View className="flex-1 bg-bg">
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 8 }}
        renderItem={({ item }) => <ExpenseRow expense={item} />}
      />
    </View>
  );
}
