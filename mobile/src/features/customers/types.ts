/**
 * Moved here from features/invoices (its original home) now that customers
 * are a real, independently-managed feature (list, edit, delete — see
 * FRONTEND-CHECKLIST.md §Customers) rather than existing only inside the
 * invoice-create picker. `features/invoices/types.ts` re-exports this type
 * so existing invoice call sites don't need to change their imports.
 */
export type Customer = {
  id: string;
  name: string;
  email?: string;
  isBusiness: boolean;
  kvkNummer?: string;
  btwNummer?: string;
  /** Straat + huisnummer, e.g. "Kerkstraat 12". Optional — not every klant needs a postal address on file. */
  address?: string;
  postcode?: string;
  city?: string;
  notes?: string;
};
