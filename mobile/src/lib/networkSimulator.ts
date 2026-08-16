/**
 * Frontend-only connectivity signal. There's no real network layer to
 * fail against yet (no backend — see CHECKLIST.md), so "offline" here
 * means one of two things:
 *
 * 1. On web, the browser's real `navigator.onLine` + `online`/`offline`
 *    events (genuinely useful there — Expo's web target is real).
 * 2. Everywhere, a manual simulated state, triggered by the same kind of
 *    dev test hook already used elsewhere in this app (typing "fail" in an
 *    invoice line triggers a failed send in `invoice/new.tsx`; an email
 *    containing "offline" triggers a network error in `authService.ts`).
 *    Typing "offline" in an invoice line description calls `goOffline()`
 *    below, which auto-recovers after a few seconds — standing in for
 *    "connection came back" so the queued-invoice auto-send path
 *    (FRONTEND-CHECKLIST.md item 20) is actually reachable and watchable
 *    without needing a real flaky connection or a native NetInfo dependency.
 *
 * Swap target once real connectivity detection is needed on native:
 * `@react-native-community/netinfo`, subscribed the same way this module
 * is — call sites (InvoiceStore, invoice/new.tsx) only touch `isOnline()`
 * and `subscribe()`, not this file's internals.
 */
import { Platform } from "react-native";

type Listener = (online: boolean) => void;

let online = true;
const listeners = new Set<Listener>();
let autoRecoverTimer: ReturnType<typeof setTimeout> | null = null;

function setOnline(next: boolean) {
  if (online === next) return;
  online = next;
  listeners.forEach((listener) => listener(online));
}

export function isOnline(): boolean {
  return online;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Simulated offline, auto-recovers after `recoverAfterMs` — see file header. */
export function goOffline(recoverAfterMs = 5000): void {
  setOnline(false);
  if (autoRecoverTimer) clearTimeout(autoRecoverTimer);
  autoRecoverTimer = setTimeout(() => setOnline(true), recoverAfterMs);
}

export function goOnline(): void {
  if (autoRecoverTimer) {
    clearTimeout(autoRecoverTimer);
    autoRecoverTimer = null;
  }
  setOnline(true);
}

if (Platform.OS === "web" && typeof window !== "undefined") {
  online = window.navigator.onLine;
  window.addEventListener("online", () => setOnline(true));
  window.addEventListener("offline", () => setOnline(false));
}
