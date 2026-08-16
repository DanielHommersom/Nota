export type ExpenseStatus = "open" | "paid";

/**
 * A purchase invoice / cost that comes in from someone else — the
 * "Inkomend" counterpart to the Invoices the app sends out. Read-only for
 * now (no add/edit flow): there's no OCR-a-receipt or manual-entry UI yet,
 * this is just enough of a model to back the dashboard card and its list.
 */
export type Expense = {
  id: string;
  supplierName: string;
  description: string;
  amountCents: number;
  /** When the bill/receipt came in. */
  receivedAt: string;
  dueDate: string;
  status: ExpenseStatus;
};
