import type { VatRate } from "@/lib/vat";
import type { Customer } from "@/features/customers/types";

export type { Customer };

/**
 * "queued" is distinct from "failed" (Frontend Checklist §Invoices,
 * FRONTEND-CHECKLIST.md item 20): a failed send needs the user to act
 * (retry tap); a queued invoice is being handled by the system — saved
 * locally and auto-sent the moment connectivity returns, no user action
 * required. Conflating the two risks the user waiting indefinitely on
 * something that already gave up, or re-tapping something already queued.
 */
export type InvoiceStatus = "draft" | "queued" | "sending" | "sent" | "failed";

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
  /**
   * Allocated only once a send actually succeeds — draft and queued
   * invoices are always null here. Mirrors the backend rule locked in
   * CHECKLIST.md 1a: "the invoice number is only allocated once ... send
   * succeeds, never on a bare attempt", with the mock allocator in
   * InvoiceStore standing in for the real per-company atomic counter +
   * row-level lock until that DB work lands.
   */
  invoiceNumber: string | null;
  customer: Customer;
  items: InvoiceItem[];
  totalCents: number;
  status: InvoiceStatus;
  sentAt: string | null;
  /**
   * Set alongside `sentAt` (sentAt + the standard payment term — see
   * paymentTerms.ts). Null until actually sent — a draft or queued
   * invoice has no due date yet. Drives the dashboard's "te herinneren"
   * count (unpaid + past this date).
   */
  dueDate: string | null;
  /** Null = unpaid. Set by the "markeer als betaald" toggle on the invoice detail screen. */
  paidAt: string | null;
  /** Last local edit — lets the drafts list show "bewerkt 3 min geleden". */
  updatedAt: string;
};
