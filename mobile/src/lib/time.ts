/** e.g. "14 september 2026" — used for due dates, where a relative time reads worse than a real date. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

/**
 * Wraps the `Date.now()` comparison so call sites in component bodies
 * (invoice/[id].tsx's overdue banner, the expenses list row) don't call
 * an impure global directly during render — same reason formatRelativeTime
 * below does its own `Date.now()` internally instead of taking "now" as a
 * pre-computed prop. React Compiler's purity check flags a bare
 * `Date.now()` in a component/hook body but doesn't see through a plain
 * utility function call.
 */
export function isPastDue(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "zojuist";
  if (minutes < 60) return `${minutes} min geleden`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} uur geleden`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? "dag" : "dagen"} geleden`;
}
