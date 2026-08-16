import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { MOCK_CUSTOMERS } from "./mock-data";
import type { Customer } from "./types";

/**
 * In-memory store for the front-end baseline only — same pattern and same
 * caveats as InvoiceStore (no persistence, no network yet). Split out of
 * the invoice feature so the "Klanten" screen, the invoice-create picker,
 * and the "on the fly" quick-add flow all read/write the *same* live list
 * instead of each holding their own disconnected mock array.
 */
type CustomerStoreValue = {
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomer: (id: string) => Customer | undefined;
};

const CustomerStoreContext = createContext<CustomerStoreValue | null>(null);

export function CustomerStoreProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);

  const addCustomer = useCallback((customer: Customer) => {
    setCustomers((prev) => [customer, ...prev]);
  }, []);

  const updateCustomer = useCallback((id: string, patch: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getCustomer = useCallback((id: string) => customers.find((c) => c.id === id), [customers]);

  const value = useMemo(
    () => ({ customers, addCustomer, updateCustomer, deleteCustomer, getCustomer }),
    [customers, addCustomer, updateCustomer, deleteCustomer, getCustomer],
  );

  return <CustomerStoreContext.Provider value={value}>{children}</CustomerStoreContext.Provider>;
}

export function useCustomerStore(): CustomerStoreValue {
  const ctx = useContext(CustomerStoreContext);
  if (!ctx) throw new Error("useCustomerStore must be used within CustomerStoreProvider");
  return ctx;
}
