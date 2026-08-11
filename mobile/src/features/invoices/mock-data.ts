import type { Customer, Invoice } from "./types";

/**
 * Local mock data for the front-end baseline. No backend is wired up yet —
 * T1-T3 (DB schema, compliance module, send API route) are separate,
 * tracked implementation tasks from /plan-eng-review.
 */
export const MOCK_CUSTOMERS: Customer[] = [
  { id: "cust_melvin", name: "Melvin de Boer", isBusiness: false },
  { id: "cust_casper", name: "Casper Jansen (boekhouder)", isBusiness: true, kvkNummer: "12345678", btwNummer: "NL123456789B01" },
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv_1",
    invoiceNumber: "2026-014",
    customer: MOCK_CUSTOMERS[0],
    items: [
      { id: "item_1a", description: "Stucwerk woonkamer", quantity: 1, unitPriceCents: 45000, vatRate: 21 },
    ],
    totalCents: 54450,
    status: "sent",
    sentAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
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
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
];
