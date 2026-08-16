import type { Invoice } from "./types";

/**
 * Single source of truth for "is this one of the ones worth chasing today" —
 * sent, unpaid, and past its due date. Used both by the dashboard count
 * below and by the UI that now actually acts on that count (the "Stuur
 * herinnering" button on the invoice detail screen, and the matching quick
 * action on an overdue row in the Facturen list) — previously that logic
 * only existed inlined once, in invoice/[id].tsx's own `isOverdue`, which
 * would have silently diverged from this file's definition the moment
 * either one changed.
 */
export function isInvoiceOverdue(invoice: Invoice): boolean {
  return (
    invoice.status === "sent" && !invoice.paidAt && invoice.dueDate !== null && new Date(invoice.dueDate).getTime() < Date.now()
  );
}

/**
 * Feeds the dashboard's "Facturen" card. "Te ontvangen" is every sent
 * invoice nobody has marked paid yet; "te herinneren" narrows that down to
 * the ones already past their due date — the subset actually worth
 * chasing today. A plain function (not a hook) since it's pure
 * derivation — callers wrap it in useMemo themselves, same as
 * expenses/summary.ts.
 */
export function summarizeReceivables(invoices: Invoice[]) {
  const unpaidSent = invoices.filter((inv) => inv.status === "sent" && !inv.paidAt);
  const overdue = invoices.filter(isInvoiceOverdue);

  return {
    teOntvangenCents: unpaidSent.reduce((sum, inv) => sum + inv.totalCents, 0),
    teOntvangenCount: unpaidSent.length,
    teHerinnerenCount: overdue.length,
  };
}
