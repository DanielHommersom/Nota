import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_BRANDING, type Branding } from "./types";

/**
 * In-memory mock store, same pattern as CustomerStore/InvoiceStore —
 * branding wasn't part of the original walking-skeleton MVP scope
 * (FRONTEND-CHECKLIST.md never mentions it), so it gets no special
 * persistence treatment beyond what those already have.
 */
type BrandingContextValue = {
  branding: Branding;
  setBranding: (branding: Branding) => void;
  updateBranding: (patch: Partial<Branding>) => void;
};

const BrandingContext = createContext<BrandingContextValue | null>(null);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);

  const updateBranding = useCallback((patch: Partial<Branding>) => {
    setBranding((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo(() => ({ branding, setBranding, updateBranding }), [branding, updateBranding]);

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding(): BrandingContextValue {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error("useBranding must be used within BrandingProvider");
  return ctx;
}
