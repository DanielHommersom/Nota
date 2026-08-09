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

export function calculateTotalCents(unitPriceCents: number, quantity: number, vatRate: VatRate): {
  subtotalCents: number;
  vatCents: number;
  totalCents: number;
} {
  const subtotalCents = Math.round(unitPriceCents * quantity);
  const vatCents = Math.round(subtotalCents * (vatRate / 100));
  return { subtotalCents, vatCents, totalCents: subtotalCents + vatCents };
}

/**
 * KOR (kleineondernemersregeling): a VAT-exempt seller must show this
 * disclaimer instead of a VAT line — a bare 0% line is not legally
 * sufficient. Locked in /plan-eng-review Architecture Decisions (Issue 4).
 */
export const KOR_DISCLAIMER_NL =
  "Op grond van artikel 25 Wet OB is op deze factuur geen btw in rekening gebracht (kleineondernemersregeling).";
