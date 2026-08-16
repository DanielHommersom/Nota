import type { Expense } from "./types";

const now = new Date();

function daysAgo(days: number): string {
  return new Date(now.getTime() - 1000 * 60 * 60 * 24 * days).toISOString();
}

export const MOCK_EXPENSES: Expense[] = [
  {
    id: "exp_1",
    supplierName: "Bouwmaterialen Van Dijk",
    description: "Verf, plamuur en gereedschap",
    amountCents: 18675,
    receivedAt: daysAgo(4),
    dueDate: daysAgo(-10),
    status: "open",
  },
  {
    id: "exp_2",
    supplierName: "Interpolis Zakelijk",
    description: "Bedrijfsaansprakelijkheidsverzekering",
    amountCents: 8950,
    // Received well before its (already-passed) due date — the seed data
    // for an overdue incoming bill on the dashboard.
    receivedAt: daysAgo(35),
    dueDate: daysAgo(5),
    status: "open",
  },
  {
    id: "exp_3",
    supplierName: "KPN Zakelijk",
    description: "Mobiel abonnement",
    amountCents: 4499,
    receivedAt: daysAgo(20),
    dueDate: daysAgo(6),
    status: "paid",
  },
];
