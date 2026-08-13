export type SubscriptionPlan = "free" | "pro";

export type SubscriptionStatus = {
  plan: SubscriptionPlan;
  /** Lifetime count, not monthly — matches the design doc's free-tier rule. */
  invoicesUsed: number;
  /** null = unlimited (pro). */
  invoicesLimit: number | null;
};
