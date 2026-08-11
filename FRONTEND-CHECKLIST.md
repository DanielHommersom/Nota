# Nota — Frontend Checklist (Mobile App)

Everything below is UI/screen work in `mobile/`. For backend, accounts, and the
platform roadmap, see `CHECKLIST.md`. This list is more honest than that one about
where the current build simplified or skipped things during implementation —
worth reading even if you think you already know what's built.

---

## 0. What's already built

Invoice list (home, with empty state) · invoice create (manual entry, one line item,
inline validation, live VAT/total, send states incl. failed/offline banners, spinner→
checkmark send animation, success screen) · invoice detail (read-only) · stub screens
for sign-in, company onboarding (incl. plain-language KOR toggle), and new-customer.
Design tokens, accessibility baseline (44px targets, VoiceOver labels, contrast-fixed
muted gray), Lucide icons, native system font — all locked from `/plan-design-review`.

All of it runs on local mock state. No screen below is wired to a real backend yet.

---

## 1. Honest gaps vs. the original MVP scope

The walking-skeleton scope reduction (from `/plan-eng-review` Step 0) deferred some of
these on purpose. One was **not** a reviewed decision — I simplified it silently while
building and should have flagged it at the time. Calling both kinds out explicitly:

- [ ] **Multiple line items per invoice.** The schema is `invoice_items` (plural) —
      multiple items per invoice was the intent — but the actual screen I built only
      supports **one** description/qty/price row. Real jobs sometimes have more than
      one line (materials + labor, e.g.). This wasn't a reviewed scope cut, it's a gap
      I introduced during implementation. Worth a real decision: add multi-line-item
      support now, or explicitly defer it with the same rigor the other cuts got.
- [ ] **Dashboard.** Named in the original project brief's MVP list, but cut during
      the eng review's Step 0 scope reduction (walking skeleton = auth, company,
      customers, invoices only). Not built — deferred on purpose, unlike the item above.
- [ ] **Betaalstatus (payment status) beyond "sent."** The brief's MVP scope implies
      tracking paid/unpaid/overdue, not just delivery status. Current build only has
      `sent`/`failed`/`draft` — nothing about whether the customer actually *paid*.
      This needs the `Payments` table (already deferred in `CHECKLIST.md` 1b) before
      there's any real data to show, so the UI gap follows from that, not a separate cut.
- [ ] **Abonnement (subscription management).** No paywall, no plan screen — nothing
      stops a user from creating unlimited invoices right now. Blocked on the
      Phase 1 IAP/RevenueCat setup in `CHECKLIST.md`, but the UI itself isn't built.

---

## 2. Screens still needed for MVP

### Customers
- [ ] A real **customer list/management screen.** Right now customers only exist
      inside the invoice-create picker sheet and a bare "new customer" form — there's
      no "Klanten" screen to see, edit, or archive existing customers on its own.
- [ ] Edit customer.
- [ ] Delete/archive customer.

### Company / account settings
- [ ] A **settings screen** to view/edit company info after the one-time onboarding.
      Right now onboarding is a one-way door — there's no way back in to fix a typo
      in your KVK-nummer later.
- [ ] Log out.
- [ ] Toggle KOR status after the fact (currently only set once, at onboarding).

### Invoices
- [ ] **Add/remove line items** (see gap #1 above, if the decision is to build it now).
- [ ] Edit a draft before sending — right now the only path is fill form → send,
      no save-as-draft-and-come-back-later.
- [ ] **View/share the actual generated PDF.** The app never shows or links to the
      real PDF once T3 (server-side render) exists — right now "success" just shows
      a summary card, not the document itself.
- [ ] Payment status UI (paid/unpaid/overdue badges, mark-as-paid action) — depends
      on the `Payments` table landing first.
- [ ] Dashboard screen (revenue this month, outstanding amount, recent activity).

### Subscription
- [ ] Paywall screen — triggers at the 3-invoice lifetime free cap.
- [ ] Apple IAP purchase flow UI (RevenueCat SDK paywall component or custom screen).
- [ ] "Manage subscription" screen (current plan, trial status, cancel).

### Auth
- [ ] Real sign-in flow wired to Supabase Auth (the current screen is a static stub —
      decide magic-link vs. email+password, then build the actual flow, not just the
      email field).
- [ ] Session persistence — stay logged in across app restarts.
- [ ] Log out.

---

## 3. Wiring work (screen exists, needs to talk to a real backend)

Each of these currently works against `InvoiceStoreProvider`'s in-memory mock array —
none of it survives an app restart or is real:

- [ ] Loading states for actual network calls (list fetch, send request) — currently
      instant because mock data has no latency.
- [ ] Real error states for actual network failures — currently only reachable via
      the "type 'fail' in the description" test hook, not a real failure path.
- [ ] Replace `MOCK_CUSTOMERS` / `MOCK_INVOICES` with real Supabase queries once T1
      (schema) and T3 (send route) exist.

---

## 4. Polish backlog (already tracked in TODOS.md, repeated here for frontend visibility)

- [ ] Local draft autosave (survive app crash/kill mid-form-fill).
- [ ] Customer search/filter (fine until someone has 10+ clients).
- [ ] Tablet-optimized layout — deliberately out of scope, phone-first thesis.
- [ ] Real app icon + splash screen (currently Expo's placeholder assets).
- [ ] A real device-based accessibility pass — the VoiceOver labels and contrast
      values are locked in code, but nobody has actually run VoiceOver/TalkBack
      against the built screens yet. "Specified" isn't the same as "verified."
- [ ] Consistency pass once `DESIGN.md` exists (`/design-consultation`) — right now
      every screen was styled against decisions made ad hoc during one design review,
      not a real system.

---

## 5. Later phases (do not build yet — see CHECKLIST.md roadmap)

- [ ] **Phase 2 (Web):** Next.js dashboard — full UI rebuild for browser, not a port.
- [ ] **Phase 3 (Android):** Same Expo codebase; expect minor layout adjustments
      (back-button behavior, Material vs. iOS-style navigation chrome) but not a
      rewrite.

## 6. Post-MVP roadmap frontend work (V2-V7, far out — don't build yet)

- [ ] V2 — payment link display, reminder settings screen.
- [ ] V3 — quote (offerte) creation/list screens, likely mirroring the invoice flow.
- [ ] V4 — AI natural-language input screen, feeding into the same confirm/edit form
      already built for manual entry (the form itself is reusable; only the input
      method is new).
- [ ] V5 — receipt (bonnetje) capture/scan screen.
- [ ] V6 — BTW overview/reporting screen.
- [ ] V7 — bank connection linking screens.
