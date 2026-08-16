import type { Expense } from "./types";

/** Feeds the dashboard's "Inkomend" card — mirrors invoices/receivables.ts. */
export function summarizeExpenses(expenses: Expense[]) {
  const open = expenses.filter((e) => e.status === "open");
  return {
    openCents: open.reduce((sum, e) => sum + e.amountCents, 0),
    openCount: open.length,
  };
}
