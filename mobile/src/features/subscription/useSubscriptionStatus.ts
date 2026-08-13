import { useInvoiceStore } from "@/features/invoices/InvoiceStore";
import type { SubscriptionStatus } from "./types";

/** Lifetime cap, not monthly — locked in the design doc's Constraints. */
const FREE_TIER_INVOICE_LIMIT = 3;

/**
 * Mock — no real Payments/Subscriptions table yet (deferred out of the
 * walking-skeleton MVP per /plan-eng-review). Returns the same
 * `{ data, isLoading }` shape a future TanStack Query hook backed by
 * RevenueCat/Stripe entitlement data would return, so the drawer doesn't
 * need to change when that lands — only this file does.
 *
 * `invoicesUsed` is derived from the real (mock) invoice store rather than
 * hardcoded, so the badge reflects actual usage instead of a fixed number.
 * Everyone is on the free plan for now — there's no purchase flow yet to
 * ever move someone to "pro".
 */
export function useSubscriptionStatus(): { data: SubscriptionStatus; isLoading: boolean } {
  const { invoices } = useInvoiceStore();

  return {
    data: {
      plan: "free",
      invoicesUsed: invoices.length,
      invoicesLimit: FREE_TIER_INVOICE_LIMIT,
    },
    isLoading: false,
  };
}
