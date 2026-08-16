import { z } from "zod";

/**
 * Business fields (KVK/BTW) are optional at the schema level even when
 * `isBusiness` is true — a zzp'er adding a client "on the fly" mid-job
 * shouldn't be blocked from sending an invoice because they don't have a
 * KVK-nummer memorized. Matches the original stub's copy: "Voor
 * particuliere klanten (B2C) zijn KVK- en BTW-nummer niet verplicht op de
 * factuur" — true for B2B too in the sense that Nota won't hard-block it.
 */
export const customerFormSchema = z.object({
  name: z.string({ error: "Vul een naam in" }).trim().min(1, "Vul een naam in"),
  email: z.union([z.email({ error: "Vul een geldig e-mailadres in" }), z.literal("")]).optional(),
  isBusiness: z.boolean(),
  kvkNummer: z.string().optional(),
  btwNummer: z.string().optional(),
  address: z.string().optional(),
  postcode: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
