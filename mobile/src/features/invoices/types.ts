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

/** Mirrors Invoices + InvoiceItems (single line item for the MVP walking skeleton). */
export type Invoice = {
  id: string;
  invoiceNumber: string | null; // allocated server-side only once sent
  customer: Customer;
  description: string;
  quantity: number;
  unitPriceCents: number;
  vatRate: VatRate;
  totalCents: number;
  status: InvoiceStatus;
  sentAt: string | null;
};
