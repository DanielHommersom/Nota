/**
 * Shapes mirror the future Supabase Auth client (`supabase.auth.signUp`,
 * `signInWithPassword`) deliberately, so the mock authService in this
 * folder can be swapped for the real client later without touching any
 * call site — only this file and authService.ts change.
 */
export type AuthUser = {
  id: string;
  email: string;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
};

export type AuthErrorCode =
  | "email_taken"
  | "invalid_credentials"
  | "weak_password"
  | "network_error"
  | "unknown";

export type AuthError = {
  code: AuthErrorCode;
  message: string;
};

/** Matches Supabase's `{ data, error }` response envelope. */
export type AuthActionResult = {
  data: { user: AuthUser | null; session: AuthSession | null };
  error: AuthError | null;
};

export type PasswordResetRequestResult = {
  data: { sent: boolean };
  error: AuthError | null;
};

export type PasswordResetResult = {
  data: { success: boolean };
  error: AuthError | null;
};
