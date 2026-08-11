import type { VatRate } from "@/lib/vat";

/** Mirrors the Customers table from the design doc (B2C vs B2B field branching). */
export type Customer = {
  id: string;
  name: string;
  isBusiness: boolean;
  kvkNummer?: string;
  btwNummer?: string;
};

export type InvoiceStatus = "draft" | "sending" | "sent" | "failed";

/** Mirrors a single row in the InvoiceItems table. */
export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  vatRate: VatRate;
};

/**
 * Mirrors Invoices + InvoiceItems (one-to-many — an invoice always has at
 * least one line item, and can have more, e.g. materials + labor on the
 * same job). `totalCents` is the sum across all items.
 */
export type Invoice = {
  id: string;
  invoiceNumber: string | null; // allocated server-side only once sent
  customer: Customer;
  items: InvoiceItem[];
  totalCents: number;
  status: InvoiceStatus;
  sentAt: string | null;
};
