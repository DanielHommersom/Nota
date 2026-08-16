/**
 * Standard NL payment term, applied to every invoice for now — there's no
 * per-customer or per-invoice term setting yet. Used to stamp `dueDate`
 * the moment an invoice's status flips to "sent" (see InvoiceStore's
 * outbox processor and invoice/new.tsx's direct-send path).
 */
export const DEFAULT_PAYMENT_TERM_DAYS = 30;

/** `sentAtIso` + the standard payment term, as an ISO string. */
export function calculateDueDate(sentAtIso: string): string {
  const due = new Date(sentAtIso);
  due.setDate(due.getDate() + DEFAULT_PAYMENT_TERM_DAYS);
  return due.toISOString();
}
