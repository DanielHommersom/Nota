import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { CompanyProfile } from "./types";

/**
 * In-memory mock store — no backend wired yet (T1, /plan-eng-review).
 * `useCompanyProfile()` returns a `{ data, isLoading }` shape on purpose,
 * matching what a real TanStack Query-backed hook will look like once this
 * reads from Supabase — consuming code (the drawer header, the future
 * settings screen) doesn't need to change when that swap happens.
 *
 * Starts `null` (no company yet) rather than pre-seeded — the onboarding
 * screen is what populates this, and a signed-up user who never finished
 * onboarding should see that reflected, not fake data.
 */
type CompanyProfileContextValue = {
  data: CompanyProfile | null;
  isLoading: boolean;
  setCompanyProfile: (profile: CompanyProfile) => void;
};

const CompanyProfileContext = createContext<CompanyProfileContextValue | null>(null);

export function CompanyProfileProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CompanyProfile | null>(null);

  const setCompanyProfile = useCallback((profile: CompanyProfile) => {
    setData(profile);
  }, []);

  const value = useMemo(() => ({ data, isLoading: false, setCompanyProfile }), [data, setCompanyProfile]);

  return <CompanyProfileContext.Provider value={value}>{children}</CompanyProfileContext.Provider>;
}

export function useCompanyProfile(): CompanyProfileContextValue {
  const ctx = useContext(CompanyProfileContext);
  if (!ctx) throw new Error("useCompanyProfile must be used within CompanyProfileProvider");
  return ctx;
}
