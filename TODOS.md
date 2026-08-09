# TODOS

## Product / Strategy

### Revisit whether deferring AI parsing confounds the Melvin pilot interpretation

**What:** Before drawing conclusions from the Melvin pilot test, explicitly separate two possible failure readings: "no real demand" (Premise 1) vs. "we tested the AI-less version that Tellow already beats for free" (Premise 2, untested since AI was deferred out of MVP).

**Why:** Raised by outside-voice review during /plan-eng-review — the 30-second promise was originally meant to be carried by AI-assisted input; it's now carried by an unvalidated manual form. If the pilot fails, without this framing it's easy to wrongly conclude "no demand" when the real issue could be "wrong version tested."

**Context:** The design doc's Premise 3 was reversed during architecture review (AI moved from "in MVP" back to "deferred"). This TODO doesn't reopen that decision — it's a note to interpret the upcoming pilot result correctly, not a call to re-add AI now.

**Effort:** S (it's an interpretation framework, not code)
**Priority:** P2
**Depends on:** The Melvin pilot happening first (see design doc's "The Assignment")

### Reassess whether €3.99/mo subscription fits a deliberately low-frequency user

**What:** Check whether the flat monthly subscription (with a 3-invoice lifetime free cap) actually fits users who invoice rarely by definition (one-off job workers), or whether usage-based/per-invoice pricing would convert better.

**Why:** Outside-voice review point — a user who invoices a few times a year may take months/years to hit the 3-invoice cap and never feel conversion pressure, meaning the subscription model may not match the target user's actual usage pattern.

**Context:** Pricing (€3.99/mo, 7-day trial, 3 free invoices) came from the original project brief, not from validated usage data. Not actionable until real usage numbers exist from early pilot users.

**Effort:** M (requires real usage data first, then a pricing-model analysis)
**Priority:** P3
**Depends on:** Real usage data from early users (Melvin's pilot and beyond)

## Mobile App

### Local draft autosave (survive app crash/kill mid-form-fill)

**What:** Persist the in-progress invoice form locally (e.g. AsyncStorage/SQLite) so a crash or app kill while filling out an invoice doesn't lose the entered data.

**Why:** Found during eng-review failure-mode analysis. Not a compliance risk (nothing was sent), but real UX friction that undercuts the "fast, on-location" promise the product is selling — a lost draft means a full retype at the job site.

**Context:** Not needed for the very first Melvin pilot test itself; a polish item once the core create → send loop works.

**Effort:** S
**Priority:** P3
**Depends on:** Invoice create form (implementation task T7)

### Make KOR-exemption setting understandable during company onboarding

**What:** Design onboarding copy/UX for the `kor_exempt` toggle so a non-accountant zzp'er can correctly determine their own status, rather than presenting a bare boolean checkbox.

**Why:** Found during eng-review failure-mode analysis. Most zzp'ers aren't accountants and may not know whether they're KOR-exempt — a bare toggle risks wrong data entry, which produces a legally incorrect invoice. This directly protects the compliance guarantee that was the whole point of adding the `kor_exempt` flag (issue 4 of the architecture review).

**Context:** The boolean field itself and its invoice-rendering behavior (KOR disclaimer vs. VAT line) were locked in this review. This TODO is specifically about the onboarding presentation layer.

**Effort:** S (copy/UX work, not new architecture)
**Priority:** P2
**Depends on:** Company onboarding form (implementation task T5)

## Design

### Write DESIGN.md via /design-consultation, seeded from this review's locked decisions

**What:** Run `/design-consultation` to produce a real design system document, seeded from the visual decisions locked in this review (accent blue, ~18px card radius, SF Pro/Roboto system font, Lucide icons).

**Why:** Future screens (dashboard, subscription/paywall in phase 2) will otherwise re-litigate the same visual questions from scratch instead of building on a documented system.

**Context:** Raised in Pass 5 of `/plan-design-review`. Explicitly deferred rather than run immediately, since the core demand hypothesis (Melvin pilot) isn't validated yet — no sense front-loading a full design system before knowing if the product survives its first real test.

**Effort:** M
**Priority:** P3
**Depends on:** The Melvin pilot / walking-skeleton build landing first

### Revisit customer-picker UX (search/filter) once a user has more than ~10-15 customers

**What:** Add search/filter to the customer picker once a zzp'er's client list grows beyond a quick-scan flat list.

**Why:** The flat-list approach chosen for MVP works fine for a handful of customers but degrades as a client list grows — not urgent now, but a known future friction point.

**Context:** Raised during Pass 6 of `/plan-design-review`. Deliberately out of scope for MVP since target users (one-off job workers) have few customers.

**Effort:** S
**Priority:** P4
**Depends on:** Real customer-count data from usage

### Tablet-optimized layout

**What:** Design a tablet-specific layout (currently phone-only).

**Why:** Some zzp'ers (electricians doing larger jobs, office-based admin work) may reach for an iPad rather than a phone — currently untested and unspecified.

**Context:** Raised in Pass 6 of `/plan-design-review`. Explicitly out of scope for MVP since the whole thesis is phone-first, job-site usage. Revisit only if real usage data shows meaningful tablet demand.

**Effort:** M
**Priority:** P4
**Depends on:** Phone MVP shipping and being validated first
