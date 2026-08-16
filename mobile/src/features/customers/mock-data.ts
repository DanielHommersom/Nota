import type { Customer } from "./types";

/**
 * Local mock data for the front-end baseline. No backend is wired up yet —
 * T1-T3 (DB schema, compliance module, send API route) are separate,
 * tracked implementation tasks from /plan-eng-review.
 */
export const MOCK_CUSTOMERS: Customer[] = [
  { id: "cust_melvin", name: "Melvin de Boer", isBusiness: false, city: "Rotterdam" },
  {
    id: "cust_casper",
    name: "Casper Jansen (boekhouder)",
    isBusiness: true,
    kvkNummer: "12345678",
    btwNummer: "NL123456789B01",
    email: "casper@jansenadministratie.nl",
    address: "Hoofdstraat 44",
    postcode: "3011 AB",
    city: "Rotterdam",
  },
];
