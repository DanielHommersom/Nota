import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CompanyProfile } from "./types";

/**
 * Mirrors features/auth/authStorage.ts — same AsyncStorage-backed pattern,
 * for the same reason: FRONTEND-CHECKLIST.md explicitly flagged
 * CompanyProfileContext as "not AsyncStorage-backed like auth", which meant
 * a signed-up user's company data didn't survive an app restart, and the
 * auth gate couldn't reliably enforce "has completed onboarding" without
 * something durable to check. This closes both gaps at the mock-storage
 * layer — still local-only, still replaced by a real Supabase query once
 * T1 lands, but now behaves like the real thing in the meantime.
 */
const COMPANY_PROFILE_KEY = "nota.company.profile";

export async function loadStoredCompanyProfile(): Promise<CompanyProfile | null> {
  const raw = await AsyncStorage.getItem(COMPANY_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CompanyProfile;
  } catch {
    return null;
  }
}

export async function storeCompanyProfile(profile: CompanyProfile): Promise<void> {
  await AsyncStorage.setItem(COMPANY_PROFILE_KEY, JSON.stringify(profile));
}

export async function clearStoredCompanyProfile(): Promise<void> {
  await AsyncStorage.removeItem(COMPANY_PROFILE_KEY);
}
