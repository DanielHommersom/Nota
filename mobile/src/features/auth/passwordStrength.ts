export type PasswordStrength = "empty" | "weak" | "medium" | "strong";

/**
 * Pure, UI-independent so it's trivially testable and reusable (e.g. if a
 * password-reset flow needs the same meter later). Length is weighted more
 * than variety — an 8-char password with mixed case only reads "weak" here,
 * since on a job site a long, memorable phrase beats a short "clever" one.
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) return "empty";
  if (password.length < 8) return "weak";

  let variety = 0;
  if (/[a-z]/.test(password)) variety += 1;
  if (/[A-Z]/.test(password)) variety += 1;
  if (/[0-9]/.test(password)) variety += 1;
  if (/[^a-zA-Z0-9]/.test(password)) variety += 1;

  if (password.length >= 12 && variety >= 3) return "strong";
  if (password.length >= 8 && variety >= 2) return "medium";
  return "weak";
}
