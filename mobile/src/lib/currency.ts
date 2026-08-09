/**
 * Amounts are always handled in integer cents to avoid floating-point
 * rounding bugs on invoice totals — a compliance-sensitive value, not just
 * a display value.
 */
export function formatEuroCents(cents: number): string {
  const euros = cents / 100;
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(euros);
}

/** Parses a Dutch-formatted amount input ("450", "450,00", "450.00") into cents. */
export function parseEuroInputToCents(input: string): number | null {
  const normalized = input.trim().replace(/\./g, "").replace(",", ".");
  if (normalized === "") return null;
  const value = Number(normalized);
  if (Number.isNaN(value) || value < 0) return null;
  return Math.round(value * 100);
}
