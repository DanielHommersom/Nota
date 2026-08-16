import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loadStoredCompanyProfile, storeCompanyProfile } from "./companyProfileStorage";
import type { CompanyProfile } from "./types";

/**
 * `useCompanyProfile()` returns a `{ data, isLoading }` shape on purpose,
 * matching what a real TanStack Query-backed hook will look like once this
 * reads from Supabase — consuming code (the drawer header, the settings
 * screen, the auth-gate onboarding check) doesn't need to change when that
 * swap happens.
 *
 * Starts `null` (no company yet) rather than pre-seeded — the onboarding
 * screen is what populates this, and a signed-up user who never finished
 * onboarding should see that reflected, not fake data. Now AsyncStorage-
 * backed (see companyProfileStorage.ts) so it survives an app restart, the
 * same way auth session does — closes a gap flagged in
 * FRONTEND-CHECKLIST.md §3.
 */
type CompanyProfileContextValue = {
  data: CompanyProfile | null;
  isLoading: boolean;
  setCompanyProfile: (profile: CompanyProfile) => void;
  clearCompanyProfile: () => void;
};

const CompanyProfileContext = createContext<CompanyProfileContextValue | null>(null);

export function CompanyProfileProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadStoredCompanyProfile().then((stored) => {
      if (!cancelled) {
        setData(stored);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setCompanyProfile = useCallback((profile: CompanyProfile) => {
    setData(profile);
    void storeCompanyProfile(profile);
  }, []);

  const clearCompanyProfile = useCallback(() => {
    setData(null);
  }, []);

  const value = useMemo(
    () => ({ data, isLoading, setCompanyProfile, clearCompanyProfile }),
    [data, isLoading, setCompanyProfile, clearCompanyProfile],
  );

  return <CompanyProfileContext.Provider value={value}>{children}</CompanyProfileContext.Provider>;
}

export function useCompanyProfile(): CompanyProfileContextValue {
  const ctx = useContext(CompanyProfileContext);
  if (!ctx) throw new Error("useCompanyProfile must be used within CompanyProfileProvider");
  return ctx;
}
