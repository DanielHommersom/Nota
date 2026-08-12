# Nota — Frontend Checklist (Mobile App)

Everything below is UI/screen work in `mobile/`. For backend, accounts, and the
platform roadmap, see `CHECKLIST.md`. This list is more honest than that one about
where the current build simplified or skipped things during implementation —
worth reading even if you think you already know what's built.

---

## 0. What's already built

**Auth gate** — app launch checks for a session (mock, AsyncStorage-backed) and
redirects accordingly: no session → signup/login screen (`app/auth/index.tsx`,
defaults to signup, never auto-lands on login); has a session → the app. A fresh
signup is explicitly navigated to company onboarding as its next step, but the gate
itself doesn't yet re-enforce "has a company" on every later launch — a user who
signs up, backs out of onboarding, and reopens the app later lands straight on the
invoice list with no company profile. Real enforcement needs company data to check
against, which is next screen's own scope (see "Company / account settings" below),
not this gate's. Flagging it here so it isn't mistaken for already handled. Invoice
list (home, with empty state) · invoice create
(manual entry, **multiple line items** with add/remove, inline validation, live
VAT/total with per-rate breakdown for mixed-rate invoices, send states incl.
failed/offline banners, spinner→checkmark send animation, success screen) · invoice
detail (read-only, lists all line items) · company onboarding (incl. plain-language
KOR toggle) and new-customer stubs. Design tokens, accessibility baseline (44px
targets, VoiceOver labels, contrast-fixed muted gray), Lucide icons, native system
font — all locked from `/plan-design-review`.

`AsyncActionButton` (renamed from `SendButton`) and `StatusBanner` are now shared
across both the invoice-send and auth flows — the "same animation language" the auth
build asked for is a real shared component, not a copy.

All of it runs on local mock state. No screen below is wired to a real backend yet.

---

## 1. Honest gaps vs. the original MVP scope

The walking-skeleton scope reduction (from `/plan-eng-review` Step 0) deferred some of
these on purpose. One was **not** a reviewed decision — I simplified it silently while
building and should have flagged it at the time. Calling both kinds out explicitly:

- [x] **Multiple line items per invoice.** ~~The schema is `invoice_items` (plural)...~~
      Fixed — add/remove line items now works (`useFieldArray`), with a per-VAT-rate
      total breakdown for invoices that mix rates across lines. Along the way, found
      and fixed two real bugs (not just missing UI): a live-total value that silently
      went stale due to `watch()`+`useMemo` (caught only by real keystroke testing in
      a live browser — `tsc`/`eslint`/bundle export all stayed green through it), and
      a React Compiler purity violation from calling `handleSubmit(onSubmit)` inline
      in JSX. See the commit for both — worth reading if this pattern shows up
      elsewhere in the app later.
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
- [ ] Enforce "has completed company onboarding" on every app launch, not just
      right after signup — see the auth-gate gap noted in section 0. Needs real
      company data to check against, so this waits on the settings screen above.

### Invoices
- [x] **Add/remove line items** — done, see gap #1 above.
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
- [x] **Signup/login flow** — `app/auth/index.tsx`. Email + password (not magic link —
      decided against it specifically for this audience: a job-site user with marginal
      signal shouldn't have to leave the app and wait on mail delivery just to sign
      in). Single screen, mode toggle between signup and login, live validation,
      password strength meter, show/hide toggle, distinct offline vs. failed error
      banners (email-taken gets a one-tap switch to login; invalid-credentials gets no
      pointless retry button since the fix is editing input, not retrying). Still
      against the mock `authService` in `src/features/auth/` — real Supabase swap is
      the T1/T4 backend work, not a frontend gap anymore.
- [x] **Session persistence** — AsyncStorage-backed (`authStorage.ts`), survives app
      restart. Matches Supabase's own recommended RN storage adapter, so the eventual
      swap keeps the same persistence behavior, not just the same method shapes.
- [ ] **Log out.** `authService.signOut()` exists but nothing in the UI calls it yet —
      no settings/account screen exists to put the button on (see "Company / account
      settings" above).
- [ ] Password reset flow — explicitly out of scope for the signup/login build,
      not yet started.

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
