# Nota — Path to Launch Checklist

Two lists: what still needs to be **built**, and what you need to **go set up yourself**
(accounts, subscriptions, registrations) that nobody can do for you. Sourced from the
approved design doc, the eng/design review implementation tasks (T1-T17), and the
original project brief's roadmap (V2-V7).

---

## 0. Where things stand right now

Built and committed: the mobile app's front-end baseline (Expo Router, NativeWind,
Reanimated) — invoice list, invoice create (manual entry, validation, send states,
success screen), invoice detail, and stub screens for sign-in, company onboarding, and
new customer. All of it runs on **local mock data only** — nothing is connected to a
real backend yet. That's the entire next section.

---

## 1. Features still to build

### 1a. Backend — required before this app can do anything real

These are the biggest gap right now: the frontend exists, the backend doesn't.

- [ ] **Database schema** (Supabase Postgres + Drizzle): `companies` (incl.
      `kor_exempt` boolean), `customers`, `invoices`, `invoice_items`, plus a
      per-company atomic invoice-number counter with row-level locking.
- [ ] **A place for the backend to live.** The design doc assumes a Next.js API route
      (`POST /api/invoices/:id/send`) — that Next.js app doesn't exist yet, only the
      mobile app. Either scaffold a minimal Next.js app now, or use Supabase Edge
      Functions instead (both were considered acceptable in the design review).
- [ ] **Shared compliance module** (`lib/invoice-compliance`): Dutch VAT rate rules
      (0/9/21%), KOR disclaimer text, invoice-number formatting — one source of truth,
      not duplicated between the send route and (later) the web dashboard.
- [ ] **The actual send flow**: server-side PDF generation (`@react-pdf/renderer`),
      Resend email dispatch, and the atomic commit rule already locked in review —
      the invoice number is only allocated once PDF + email both succeed, never on
      a bare attempt.
- [ ] **Client-side idempotency key** on every send request, so a lost response on
      flaky job-site signal can't cause a duplicate send to a real customer.
- [ ] **Supabase Auth wiring** — the sign-in screen is currently a UI stub with no
      real authentication behind it.
- [ ] Wire company onboarding, customer creation, and invoice creation/send to the
      real database instead of the in-memory mock store.
- [ ] Row Level Security policies so every user can only ever see their own data.

### 1b. Monetization — required before you can actually charge anyone

- [ ] Stripe subscription product: €3.99/mo, 7-day trial.
- [ ] Free-tier logic: 3 invoices **lifetime**, not monthly (locked decision from the
      eng review — see design doc Constraints).
- [ ] Paywall/upgrade screen in the app.
- [ ] `Payments` and `Subscriptions` tables — explicitly deferred out of the MVP
      walking skeleton, needed before this can generate revenue.

### 1c. Distribution — required before a real person can install this

- [ ] Apple TestFlight internal/external testing track set up (T12) — this is how
      Melvin or Casper's clients get a build without waiting on full App Store review.
- [ ] Google Play internal testing track set up.
- [ ] App icons, splash screen, and store listing assets (currently using Expo's
      placeholder icons).

### 1d. Polish already flagged, not yet built (from TODOS.md)

- [ ] Local draft autosave — survive an app crash/kill mid-form-fill without losing
      the invoice being typed.
- [ ] Customer search/filter — fine for now, will matter once someone has 10+ clients.
- [ ] Tablet-optimized layout — deliberately out of scope for MVP (phone-first thesis).
- [ ] A real `DESIGN.md` via `/design-consultation`, seeded from the decisions already
      locked (accent blue, ~18px radius, SF Pro/Roboto, Lucide icons) — deferred until
      after the first real user test.

### 1e. Testing

- [ ] E2E test: full invoice creation → send → PDF delivered flow.
- [ ] E2E test: send-success atomic transaction (number allocated only on success).
- [ ] Unit tests for the compliance module (VAT math, KOR text, number formatting).

### 1f. Post-MVP roadmap (from the original brief — not urgent, don't build yet)

- [ ] **V2** — Payment links, automatic payment reminders.
- [ ] **V3** — Offertes (quotes).
- [ ] **V4** — AI natural-language invoice parsing (type "Website voor Jan, 1250 euro"
      → structured invoice). Was originally pulled into MVP, then deliberately
      deferred back out during the eng review — see TODO in TODOS.md about
      interpreting the first pilot test correctly given this deferral.
- [ ] **V5** — Bonnetjes (receipt scanning).
- [ ] **V6** — BTW overzicht (VAT overview/reporting).
- [ ] **V7** — Bankkoppelingen (bank account integrations).

---

## 2. Accounts & software you need to go set up

Nobody else can do these — they need your identity, your payment details, or your
business registration.

### 2a. Before backend work starts

- [ ] **Supabase account + project** — Postgres database, Auth, Storage. Free tier is
      fine to start.
- [ ] **Vercel account** — hosting for the Next.js API (if you go that route instead
      of Supabase Edge Functions).
- [ ] **Resend account + a verified sending domain.** You need a domain you control
      and can add DNS records to (SPF/DKIM) before Resend will actually deliver
      invoice emails reliably instead of landing in spam.

### 2b. Before you can charge money

- [ ] **Stripe account.** For iDEAL support (the payment method actually used in NL)
      you'll want to confirm Stripe's Dutch payment method coverage during setup, and
      you'll need a registered business entity (see 2d) to receive payouts.

### 2c. Before real users can install the app

- [ ] **Apple Developer Program** — $99/year. Required for TestFlight and the App
      Store, no way around it.
- [ ] **Google Play Console account** — $25 one-time. Required for Play's internal
      testing track and the Play Store.
- [ ] **Expo/EAS account** — for `eas build` / `eas submit`. Free tier has limited
      concurrent builds; fine to start, may need a paid tier if you're iterating fast.

### 2d. Business / legal (not software, but blocking real money)

- [ ] **A registered business entity** (zzp'er/eenmanszaak or BV) with a KVK-nummer
      and BTW-nummer of your own. You need this to legally invoice Stripe subscribers,
      receive payouts, and be VAT-compliant yourself — the exact rules Nota enforces
      on its own users apply to you as the business selling Nota.
- [ ] Confirm your own KOR status (VAT-exempt or not) — same question the app asks
      its users, just for your own business now.

### 2e. Observability (lower priority, needed before real traffic)

- [ ] **PostHog account** — product analytics.
- [ ] **Sentry account** — error tracking. Wire this in before the first external
      tester (Melvin) uses a build, not after — you want to see crashes, not guess.

### 2f. Deferred — don't set up yet

- [ ] **LLM provider account** (Anthropic/OpenAI/Google) — only needed once V4 (AI
      parsing) is actually built. No need to open this account now.

---

## Notes

- Two TODOS.md items are still genuinely open decisions, not build tasks: whether
  deferring AI undermines how you should interpret the Melvin pilot result, and
  whether the €3.99/mo subscription model actually fits a deliberately low-frequency
  user. Worth rereading `TODOS.md` before you commit to the Stripe setup in 2b.
- The single highest-priority item on this entire list is still not code or an
  account — it's the design doc's Assignment: watch a real zzp'er invoice something
  with their current tool before building further. Everything in section 1 gets
  more valuable, not less, if you do that first.
