import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthSession } from "./types";

/**
 * AsyncStorage is what Supabase's own React Native docs recommend as the
 * session storage adapter — using it here (rather than in-memory-only
 * state) means the eventual swap to a real Supabase client keeps the same
 * persistence behavior, not just the same method shapes.
 */
const SESSION_KEY = "nota.auth.session";

export async function loadStoredSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export async function storeSession(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearStoredSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
