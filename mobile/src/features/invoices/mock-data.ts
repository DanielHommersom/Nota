import { MOCK_CUSTOMERS } from "@/features/customers/mock-data";
import { calculateDueDate } from "./paymentTerms";
import type { Invoice } from "./types";

/**
 * Local mock data for the front-end baseline. No backend is wired up yet —
 * T1-T3 (DB schema, compliance module, send API route) are separate,
 * tracked implementation tasks from /plan-eng-review.
 *
 * Customer mock data now lives in features/customers/mock-data.ts (see
 * that file's comment) — re-exported here so existing imports of
 * `MOCK_CUSTOMERS` from this file keep working.
 */
export { MOCK_CUSTOMERS };

const now = new Date();
const inv1SentAt = new Date(now.getTime() - 1000 * 60 * 22).toISOString();
const inv2SentAt = new Date(now.getTime() - 1000 * 60 * 60 * 26).toISOString();
// Sent well past the standard 30-day term — the seed data for the
// dashboard's "te herinneren" count (item 5c in the dashboard brief).
const inv4SentAt = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 40).toISOString();

export const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv_1",
    invoiceNumber: "2026-014",
    customer: MOCK_CUSTOMERS[0],
    items: [{ id: "item_1a", description: "Stucwerk woonkamer", quantity: 1, unitPriceCents: 45000, vatRate: 21 }],
    totalCents: 54450,
    status: "sent",
    sentAt: inv1SentAt,
    dueDate: calculateDueDate(inv1SentAt),
    paidAt: null,
    remindedAt: null,
    updatedAt: inv1SentAt,
  },
  {
    id: "inv_2",
    invoiceNumber: "2026-013",
    customer: MOCK_CUSTOMERS[1],
    // Two-line example on purpose — demonstrates a real multi-item invoice
    // (materials + labor on the same job), not just the single-line case.
    items: [
      { id: "item_2a", description: "Verf en materiaal", quantity: 1, unitPriceCents: 25000, vatRate: 21 },
      { id: "item_2b", description: "Arbeid gevel schilderen", quantity: 1, unitPriceCents: 64000, vatRate: 21 },
    ],
    totalCents: 107690,
    status: "sent",
    sentAt: inv2SentAt,
    dueDate: calculateDueDate(inv2SentAt),
    // Already paid — seed data showing a paid invoice drops out of "te
    // ontvangen" even though it's still "sent" and has a due date.
    paidAt: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(),
    remindedAt: null,
    updatedAt: inv2SentAt,
  },
  {
    id: "inv_3",
    invoiceNumber: null,
    customer: MOCK_CUSTOMERS[0],
    items: [{ id: "item_3a", description: "Buitenschilderwerk kozijnen", quantity: 1, unitPriceCents: 89000, vatRate: 21 }],
    totalCents: 107690,
    status: "draft",
    sentAt: null,
    dueDate: null,
    paidAt: null,
    remindedAt: null,
    updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "inv_4",
    invoiceNumber: "2026-006",
    customer: MOCK_CUSTOMERS[1],
    items: [{ id: "item_4a", description: "Kozijnen plaatsen achtergevel", quantity: 1, unitPriceCents: 168000, vatRate: 21 }],
    totalCents: 203280,
    status: "sent",
    sentAt: inv4SentAt,
    dueDate: calculateDueDate(inv4SentAt),
    paidAt: null,
    remindedAt: null,
    updatedAt: inv4SentAt,
  },
];
