import { z } from "zod";

/**
 * Shared between the one-time onboarding form and the later "edit company
 * profile" settings screen (FRONTEND-CHECKLIST.md: "there's no way back in
 * to fix a typo in your KVK-nummer later" — this schema now backs both).
 * Address fields are required: they're printed on every invoice and are a
 * legal requirement for a valid Dutch factuur, not optional metadata.
 */
export const companyProfileFormSchema = z.object({
  name: z.string({ error: "Vul een bedrijfsnaam in" }).trim().min(1, "Vul een bedrijfsnaam in"),
  kvkNummer: z
    .string({ error: "Vul je KVK-nummer in" })
    .trim()
    .min(8, "KVK-nummer moet 8 cijfers zijn")
    .max(8, "KVK-nummer moet 8 cijfers zijn"),
  btwNummer: z.string().trim().optional(),
  korExempt: z.boolean(),
  address: z.object({
    street: z.string({ error: "Vul een straatnaam in" }).trim().min(1, "Vul een straatnaam in"),
    houseNumber: z.string({ error: "Vul een huisnummer in" }).trim().min(1, "Vul een huisnummer in"),
    postcode: z
      .string({ error: "Vul een postcode in" })
      .trim()
      .min(6, "Vul een geldige postcode in (bijv. 1234 AB)"),
    city: z.string({ error: "Vul een plaats in" }).trim().min(1, "Vul een plaats in"),
  }),
});

export type CompanyProfileFormValues = z.infer<typeof companyProfileFormSchema>;
