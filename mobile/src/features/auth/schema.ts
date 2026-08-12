import { z } from "zod";

/**
 * One schema for both signup and login. The mock authService (not this
 * schema) is what distinguishes "too short to be a real password" from
 * "wrong password for this account" — see its test hooks. Keeping a single
 * schema avoids swapping the react-hook-form resolver when the user toggles
 * mode, which would otherwise force a form remount.
 */
export const authFormSchema = z.object({
  email: z.email({ error: "Vul een geldig e-mailadres in" }),
  password: z.string({ error: "Vul een wachtwoord in" }).min(8, "Minimaal 8 tekens"),
});

export type AuthFormValues = z.infer<typeof authFormSchema>;
