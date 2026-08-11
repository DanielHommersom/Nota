import { z } from "zod";
import { VAT_RATES } from "@/lib/vat";

/**
 * Required fields + inline validation locked in /plan-design-review
 * Pass 2 (Issue 3): the Send button stays disabled until this passes,
 * rather than a silent no-op tap that invites repeated taps.
 */
export const invoiceItemFormSchema = z.object({
  description: z
    .string({ error: "Vul een omschrijving in" })
    .trim()
    .min(1, "Vul een omschrijving in"),
  quantity: z.number().positive("Aantal moet groter dan 0 zijn"),
  unitPriceCents: z
    .number({ error: "Vul een bedrag in" })
    .int()
    .positive("Vul een geldig bedrag in"),
  vatRate: z.union([z.literal(0), z.literal(9), z.literal(21)]).refine((v) => VAT_RATES.includes(v)),
});

export const invoiceFormSchema = z.object({
  customerId: z.string({ error: "Kies een klant" }).min(1, "Kies een klant"),
  // An invoice always has at least one line item — mirrors the InvoiceItems
  // table being one-to-many, not a single flat description/price pair.
  items: z.array(invoiceItemFormSchema).min(1, "Voeg minimaal één regel toe"),
});

export type InvoiceItemFormValues = z.infer<typeof invoiceItemFormSchema>;
export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
