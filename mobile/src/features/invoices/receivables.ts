import type { Invoice } from "./types";

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
  const now = Date.now();
  const overdue = unpaidSent.filter((inv) => inv.dueDate !== null && new Date(inv.dueDate).getTime() < now);

  return {
    teOntvangenCents: unpaidSent.reduce((sum, inv) => sum + inv.totalCents, 0),
    teOntvangenCount: unpaidSent.length,
    teHerinnerenCount: overdue.length,
  };
}
