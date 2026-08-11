/**
 * Client-side mirror of Dutch VAT rules for the live total preview only.
 * The server-side `lib/invoice-compliance` module (Next.js API route,
 * see /plan-eng-review Architecture Decisions) is the authoritative source
 * at send time — this local copy exists purely so the form can show a
 * running total as the user types, not to make the final compliance call.
 */
export const VAT_RATES = [0, 9, 21] as const;
export type VatRate = (typeof VAT_RATES)[number];

export const DEFAULT_VAT_RATE: VatRate = 21;

export type LineItemAmounts = { unitPriceCents: number; quantity: number; vatRate: VatRate };

export function calculateItemTotal(item: LineItemAmounts): {
  subtotalCents: number;
  vatCents: number;
  totalCents: number;
} {
  const subtotalCents = Math.round(item.unitPriceCents * item.quantity);
  const vatCents = Math.round(subtotalCents * (item.vatRate / 100));
  return { subtotalCents, vatCents, totalCents: subtotalCents + vatCents };
}

/**
 * Sums totals across every line item on an invoice. Dutch invoices can
 * legitimately mix VAT rates across lines (e.g. materials at 21%, a 9%
 * item), so this also breaks VAT down per rate for display — a single
 * "X% VAT" line is only correct when every item shares one rate.
 */
export function calculateInvoiceTotals(items: LineItemAmounts[]): {
  subtotalCents: number;
  vatCents: number;
  totalCents: number;
  vatByRate: Partial<Record<VatRate, number>>;
} {
  let subtotalCents = 0;
  let vatCents = 0;
  const vatByRate: Partial<Record<VatRate, number>> = {};

  for (const item of items) {
    const itemTotal = calculateItemTotal(item);
    subtotalCents += itemTotal.subtotalCents;
    vatCents += itemTotal.vatCents;
    vatByRate[item.vatRate] = (vatByRate[item.vatRate] ?? 0) + itemTotal.vatCents;
  }

  return { subtotalCents, vatCents, totalCents: subtotalCents + vatCents, vatByRate };
}

/**
 * KOR (kleineondernemersregeling): a VAT-exempt seller must show this
 * disclaimer instead of a VAT line — a bare 0% line is not legally
 * sufficient. Locked in /plan-eng-review Architecture Decisions (Issue 4).
 */
export const KOR_DISCLAIMER_NL =
  "Op grond van artikel 25 Wet OB is op deze factuur geen btw in rekening gebracht (kleineondernemersregeling).";
