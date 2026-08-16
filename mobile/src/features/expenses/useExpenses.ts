import { MOCK_EXPENSES } from "./mock-data";
import type { Expense } from "./types";

/**
 * Mock — no purchase-invoice/expense backend yet (there's no ingestion
 * flow — email forwarding, receipt scan, manual entry — decided on yet
 * either). Same `{ data, isLoading }` shape as the other feature hooks.
 */
export function useExpenses(): { data: Expense[]; isLoading: boolean } {
  return { data: MOCK_EXPENSES, isLoading: false };
}
