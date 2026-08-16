import { clearStoredSession, loadStoredSession, storeSession } from "./authStorage";
import type { AuthActionResult, AuthUser, PasswordResetRequestResult, PasswordResetResult } from "./types";

/**
 * Mock auth layer — no real backend exists yet (Supabase project isn't
 * created, see CHECKLIST.md). Method names and the `{ data, error }` return
 * shape deliberately match `supabase.auth.signUp` / `signInWithPassword` /
 * `getSession` / `signOut`, so swapping to the real client later is a
 * one-file change, not a call-site rewrite.
 *
 * Test hooks, since there's no real backend to fail against yet (same
 * convention as the invoice-send mock — typing "fail" in a description):
 * - email containing "offline" -> simulated network/offline error
 * - email containing "taken"   -> simulated "email already in use" error
 * - (sign in only) password "wrongpassword" -> simulated invalid credentials
 */

const MOCK_NETWORK_DELAY_MS = 900;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mockUserFor(email: string): AuthUser {
  return { id: `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`, email };
}

type Credentials = { email: string; password: string };

// `password` is kept in the destructured signature to match Supabase's
// signUp(email, password) even though the mock never persists it anywhere.
export async function signUp({ email, password }: Credentials): Promise<AuthActionResult> {
  await delay(MOCK_NETWORK_DELAY_MS);

  if (email.toLowerCase().includes("offline")) {
    return {
      data: { user: null, session: null },
      error: { code: "network_error", message: "Geen verbinding. Controleer je internet en probeer het opnieuw." },
    };
  }
  if (email.toLowerCase().includes("taken")) {
    return {
      data: { user: null, session: null },
      error: { code: "email_taken", message: "Dit e-mailadres is al in gebruik. Probeer in te loggen." },
    };
  }

  const user = mockUserFor(email);
  const session = { user, accessToken: `mock_${user.id}` };
  await storeSession(session);
  return { data: { user, session }, error: null };
}

export async function signInWithPassword({ email, password }: Credentials): Promise<AuthActionResult> {
  await delay(MOCK_NETWORK_DELAY_MS);

  if (email.toLowerCase().includes("offline")) {
    return {
      data: { user: null, session: null },
      error: { code: "network_error", message: "Geen verbinding. Controleer je internet en probeer het opnieuw." },
    };
  }
  if (password === "wrongpassword") {
    return {
      data: { user: null, session: null },
      error: { code: "invalid_credentials", message: "E-mailadres of wachtwoord onjuist." },
    };
  }

  const user = mockUserFor(email);
  const session = { user, accessToken: `mock_${user.id}` };
  await storeSession(session);
  return { data: { user, session }, error: null };
}

export async function getSession() {
  return { data: { session: await loadStoredSession() } };
}

export async function signOut(): Promise<{ error: null }> {
  await clearStoredSession();
  return { error: null };
}

/**
 * Real Supabase equivalent: `supabase.auth.resetPasswordForEmail`. Always
 * reports success for a valid-looking address (except the "offline" test
 * hook) — deliberately not revealing whether the address has an account,
 * which is also correct security practice for a real implementation, not
 * just a mock-layer shortcut.
 */
export async function requestPasswordReset({ email }: { email: string }): Promise<PasswordResetRequestResult> {
  await delay(MOCK_NETWORK_DELAY_MS);

  if (email.toLowerCase().includes("offline")) {
    return {
      data: { sent: false },
      error: { code: "network_error", message: "Geen verbinding. Controleer je internet en probeer het opnieuw." },
    };
  }

  return { data: { sent: true }, error: null };
}

/** Real Supabase equivalent: `supabase.auth.updateUser({ password })` after following the emailed reset link. */
export async function resetPassword({ password }: { password: string }): Promise<PasswordResetResult> {
  await delay(MOCK_NETWORK_DELAY_MS);

  if (password.toLowerCase().includes("offline")) {
    return {
      data: { success: false },
      error: { code: "network_error", message: "Geen verbinding. Controleer je internet en probeer het opnieuw." },
    };
  }

  return { data: { success: true }, error: null };
}
