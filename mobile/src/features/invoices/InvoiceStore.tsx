import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MOCK_INVOICES } from "./mock-data";
import { calculateDueDate } from "./paymentTerms";
import { goOnline, isOnline, subscribe } from "@/lib/networkSimulator";
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
  deleteInvoice: (id: string) => void;
  getInvoice: (id: string) => Invoice | undefined;
  /**
   * The mock stand-in for the backend's atomic, row-level-locked per-company
   * counter (CHECKLIST.md 1a: "invoice-number counter with row-level
   * locking"). Every caller awaits the same promise chain, so two sends
   * that land "simultaneously" client-side still can't walk away with the
   * same number — the same guarantee the real DB constraint will give,
   * just simulated in memory instead of with a Postgres row lock.
   */
  allocateInvoiceNumber: () => Promise<string>;
};

const InvoiceStoreContext = createContext<InvoiceStoreValue | null>(null);

function highestExistingNumber(invoices: Invoice[]): number {
  let max = 0;
  for (const inv of invoices) {
    const match = inv.invoiceNumber ? /(\d+)$/.exec(inv.invoiceNumber) : null;
    if (match) max = Math.max(max, Number(match[1]));
  }
  return max;
}

export function InvoiceStoreProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const counterRef = useRef(highestExistingNumber(MOCK_INVOICES) + 1);
  const lockRef = useRef<Promise<void>>(Promise.resolve());

  const addInvoice = useCallback((invoice: Invoice) => {
    setInvoices((prev) => [invoice, ...prev]);
  }, []);

  const updateInvoice = useCallback((id: string, patch: Partial<Invoice>) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...patch } : inv)));
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  }, []);

  const getInvoice = useCallback((id: string) => invoices.find((inv) => inv.id === id), [invoices]);

  const allocateInvoiceNumber = useCallback((): Promise<string> => {
    const year = new Date().getFullYear();
    const allocation = lockRef.current.then(() => {
      const n = counterRef.current;
      counterRef.current += 1;
      return `${year}-${String(n).padStart(3, "0")}`;
    });
    // Chain the lock forward regardless of outcome so a failed allocation
    // can never wedge every later caller behind it.
    lockRef.current = allocation.then(
      () => undefined,
      () => undefined,
    );
    return allocation;
  }, []);

  // Outbox processor: whenever connectivity comes back (real on web, or the
  // "offline" dev test hook's auto-recovery — see lib/networkSimulator.ts),
  // walk every locally-queued invoice and actually send it, one at a time,
  // exactly like a real background sync worker would. This is what makes
  // "queued" different from "failed" in practice: nobody has to reopen the
  // app or tap retry for a queued invoice to go out.
  // Tracks invoice ids currently mid-send so overlapping effect re-runs
  // (state updates from processQueue itself change `invoices`, which would
  // otherwise re-trigger this same effect) never allocate two numbers for
  // one invoice.
  const processingIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function processQueue() {
      const queued = invoices.filter((inv) => inv.status === "queued" && !processingIdsRef.current.has(inv.id));
      for (const inv of queued) {
        processingIdsRef.current.add(inv.id);
        // Small stagger so a burst of queued invoices doesn't all flip to
        // "sent" in the same animation frame — reads as a real send, not a
        // bulk-update glitch.
        await new Promise((resolve) => setTimeout(resolve, 500));
        const invoiceNumber = await allocateInvoiceNumber();
        const sentAt = new Date().toISOString();
        updateInvoice(inv.id, {
          status: "sent",
          invoiceNumber,
          sentAt,
          dueDate: calculateDueDate(sentAt),
          paidAt: null,
        });
        processingIdsRef.current.delete(inv.id);
      }
    }

    const unsubscribe = subscribe((online) => {
      if (online) void processQueue();
    });
    if (isOnline()) void processQueue();
    return unsubscribe;
    // Intentionally re-subscribing whenever `invoices` changes so a
    // newly-queued invoice added while already online (e.g. the "offline"
    // test hook auto-recovers before the user even leaves the screen) is
    // still picked up without waiting for another online transition.
  }, [invoices, allocateInvoiceNumber, updateInvoice]);

  const value = useMemo(
    () => ({ invoices, addInvoice, updateInvoice, deleteInvoice, getInvoice, allocateInvoiceNumber }),
    [invoices, addInvoice, updateInvoice, deleteInvoice, getInvoice, allocateInvoiceNumber],
  );

  return <InvoiceStoreContext.Provider value={value}>{children}</InvoiceStoreContext.Provider>;
}

export function useInvoiceStore(): InvoiceStoreValue {
  const ctx = useContext(InvoiceStoreContext);
  if (!ctx) throw new Error("useInvoiceStore must be used within InvoiceStoreProvider");
  return ctx;
}

/** Re-exported so screens can manually flip the dev network simulator back online without importing the lib directly. */
export { goOnline };
