import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { MOCK_INVOICES } from "./mock-data";
import type { Invoice } from "./types";

/**
 * In-memory store for the front-end baseline only. No persistence, no
 * network — replaced by Supabase-backed state once T1-T3 (schema,
 * compliance module, send API route) land. Kept as a thin Context so
 * screens don't prop-drill, without pulling in a state library for a
 * single array.
 */
type InvoiceStoreValue = {
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, patch: Partial<Invoice>) => void;
};

const InvoiceStoreContext = createContext<InvoiceStoreValue | null>(null);

export function InvoiceStoreProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);

  const addInvoice = useCallback((invoice: Invoice) => {
    setInvoices((prev) => [invoice, ...prev]);
  }, []);

  const updateInvoice = useCallback((id: string, patch: Partial<Invoice>) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...patch } : inv)));
  }, []);

  const value = useMemo(() => ({ invoices, addInvoice, updateInvoice }), [invoices, addInvoice, updateInvoice]);

  return <InvoiceStoreContext.Provider value={value}>{children}</InvoiceStoreContext.Provider>;
}

export function useInvoiceStore(): InvoiceStoreValue {
  const ctx = useContext(InvoiceStoreContext);
  if (!ctx) throw new Error("useInvoiceStore must be used within InvoiceStoreProvider");
  return ctx;
}
