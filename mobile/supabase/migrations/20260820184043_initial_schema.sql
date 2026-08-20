-- Nota — initial schema: companies, customers, invoices, invoice_items
--
-- How to run this:
--   1. Supabase Dashboard -> SQL Editor -> paste this whole file -> Run.
--      (Fastest, no tooling needed.)
--   2. Or, if you set up the Supabase CLI later: drop this file into
--      supabase/migrations/ (already named for it) and run `supabase db push`.
--
-- Scope: just the tables + RLS + the atomic invoice-number counter. The app
-- still runs on its in-memory mock stores (InvoiceStore.tsx, CustomerStore.tsx,
-- CompanyProfileContext.tsx) until a follow-up step swaps those for real
-- Supabase queries — this migration only creates the destination for that.
--
-- Column choices mirror the frontend types exactly (src/features/*/types.ts)
-- so that follow-up swap is a mostly-mechanical mapping, not a redesign:
--   Customer      -> customers
--   Invoice       -> invoices (+ a customer_* snapshot, see comment below)
--   InvoiceItem   -> invoice_items
--   CompanyProfile -> companies

create extension if not exists "pgcrypto";

-- ============================================================================
-- companies
-- One row per logged-in zzp'er — the app's onboarding flow creates this once
-- (CompanyProfileContext). `invoice_number_seq` backs allocate_invoice_number()
-- below; it lives here (not a separate table) since it's 1:1 with a company.
-- ============================================================================
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,

  name text not null,
  kvk_nummer text not null,
  btw_nummer text,
  -- VAT-exempt under the kleineondernemersregeling — see KOR_DISCLAIMER_NL
  -- in src/lib/vat.ts. Determines whether invoices show a VAT line or the
  -- legally-required KOR disclaimer text instead.
  kor_exempt boolean not null default false,

  -- Printed on every invoice; a valid Dutch factuur legally requires this.
  address_street text not null,
  address_house_number text not null,
  address_postcode text not null,
  address_city text not null,

  logo_url text,

  -- Last-allocated invoice number for this company. Incremented only via
  -- allocate_invoice_number() below — never write to this column directly,
  -- or you risk a duplicate/skipped invoice number.
  invoice_number_seq integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.companies.invoice_number_seq is
  'Managed exclusively by allocate_invoice_number(). Do not update directly.';

-- ============================================================================
-- customers
-- ============================================================================
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,

  name text not null,
  email text,
  is_business boolean not null default false,
  kvk_nummer text,
  btw_nummer text,
  -- Single "straat + huisnummer" line, matching Customer.address in the
  -- frontend (unlike companies.address_*, which is split for the invoice
  -- template) — the picker/edit forms only ever collect it as one field.
  address text,
  postcode text,
  city text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_company_id_idx on public.customers (company_id);

-- ============================================================================
-- invoices
-- ============================================================================
create type public.invoice_status as enum ('draft', 'queued', 'sending', 'sent', 'failed');

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  -- Kept for linking/filtering ("alle facturen van deze klant"). Set null
  -- (not cascade-deleted) if the customer record is later removed — the
  -- invoice itself, a legal document, must survive that.
  customer_id uuid references public.customers (id) on delete set null,

  -- Null until a send actually succeeds — draft/queued/sending/failed all
  -- have no number yet. Set exclusively via allocate_invoice_number().
  -- Mirrors CHECKLIST.md 1a: "the invoice number is only allocated once
  -- send succeeds, never on a bare attempt."
  invoice_number text,
  status public.invoice_status not null default 'draft',

  -- Snapshot of the customer's details at send time, not a live join. An
  -- invoice is a legal document: if the customer's name/address changes
  -- later, past invoices must NOT silently change with them. This is what
  -- actually gets printed on the PDF; customer_id above is for navigation
  -- only.
  customer_name text not null,
  customer_email text,
  customer_is_business boolean not null default false,
  customer_kvk_nummer text,
  customer_btw_nummer text,
  customer_address text,
  customer_postcode text,
  customer_city text,

  -- Sum across invoice_items — kept here too (not purely derived) so
  -- listing/sorting/dashboard totals don't need to join+sum on every read.
  -- Subtotal and the per-rate VAT breakdown are cheap to recompute from
  -- invoice_items client-side (see calculateInvoiceTotals in lib/vat.ts)
  -- and intentionally not duplicated here.
  total_cents integer not null default 0,

  sent_at timestamptz,
  -- sent_at + the standard payment term (paymentTerms.ts) — null until sent.
  due_date timestamptz,
  -- Null = unpaid. Set by the "markeer als betaald" toggle.
  paid_at timestamptz,
  -- Null = no reminder sent yet. Set by "Stuur herinnering".
  reminded_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index invoices_company_id_idx on public.invoices (company_id);
create index invoices_customer_id_idx on public.invoices (customer_id);

-- The actual legal invariant: two invoices from the same company can never
-- share a number. Partial index (only when not null) since draft/queued
-- invoices legitimately have no number yet.
create unique index invoices_company_invoice_number_unique
  on public.invoices (company_id, invoice_number)
  where invoice_number is not null;

-- ============================================================================
-- invoice_items
-- ============================================================================
create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,

  -- Display order — the app supports reordering line items (up/down), so
  -- insertion order alone isn't reliable once a user has moved a row.
  position integer not null default 0,

  description text not null,
  -- Not always a whole number — e.g. 2.5 uur. Matches the frontend schema,
  -- which only requires > 0, not an integer.
  quantity numeric(10, 2) not null check (quantity > 0),
  -- Cents, like every other money value in this app — avoids float
  -- rounding bugs on invoice totals (see lib/currency.ts's own comment).
  unit_price_cents integer not null check (unit_price_cents >= 0),
  vat_rate smallint not null check (vat_rate in (0, 9, 21)),

  created_at timestamptz not null default now()
);

create index invoice_items_invoice_id_idx on public.invoice_items (invoice_id);

-- ============================================================================
-- updated_at housekeeping
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

-- ============================================================================
-- allocate_invoice_number(company_id) — the atomic counter
--
-- The single `update ... set invoice_number_seq = invoice_number_seq + 1
-- ... returning` is what makes this safe under concurrency: Postgres takes
-- a row lock for the duration of an UPDATE, so two simultaneous sends for
-- the same company serialize on this statement instead of racing — the
-- second caller's UPDATE simply waits for the first to commit, then reads
-- the already-incremented value. No separate `SELECT ... FOR UPDATE` or
-- advisory lock needed. It also can't leak a gap on a failed send: if the
-- surrounding transaction rolls back, this increment rolls back with it
-- (unlike a native Postgres SEQUENCE, which deliberately does NOT roll
-- back — the reason a plain counter column was used here instead).
--
-- Format matches the existing mock allocator in InvoiceStore.tsx exactly
-- ("{year}-{seq, zero-padded to 3 digits}") so swapping the frontend over
-- doesn't change what a user sees, e.g. "2026-001".
-- ============================================================================
create or replace function public.allocate_invoice_number(p_company_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seq integer;
begin
  update public.companies
  set invoice_number_seq = invoice_number_seq + 1
  where id = p_company_id
    and user_id = auth.uid()
  returning invoice_number_seq into v_seq;

  if v_seq is null then
    raise exception 'Company % not found or not owned by the current user', p_company_id;
  end if;

  return to_char(now(), 'YYYY') || '-' || lpad(v_seq::text, 3, '0');
end;
$$;

grant execute on function public.allocate_invoice_number(uuid) to authenticated;

-- ============================================================================
-- Row Level Security — every table scoped to "owns the company", so one
-- zzp'er can never see another's data. companies is scoped directly by
-- user_id; everything else through a join back up to companies.
-- ============================================================================
alter table public.companies enable row level security;
alter table public.customers enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

-- companies ------------------------------------------------------------
create policy "companies_select_own" on public.companies
  for select using (user_id = auth.uid());

create policy "companies_insert_own" on public.companies
  for insert with check (user_id = auth.uid());

create policy "companies_update_own" on public.companies
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "companies_delete_own" on public.companies
  for delete using (user_id = auth.uid());

-- customers --------------------------------------------------------------
create policy "customers_select_own" on public.customers
  for select using (
    exists (select 1 from public.companies c where c.id = customers.company_id and c.user_id = auth.uid())
  );

create policy "customers_insert_own" on public.customers
  for insert with check (
    exists (select 1 from public.companies c where c.id = customers.company_id and c.user_id = auth.uid())
  );

create policy "customers_update_own" on public.customers
  for update using (
    exists (select 1 from public.companies c where c.id = customers.company_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.companies c where c.id = customers.company_id and c.user_id = auth.uid())
  );

create policy "customers_delete_own" on public.customers
  for delete using (
    exists (select 1 from public.companies c where c.id = customers.company_id and c.user_id = auth.uid())
  );

-- invoices -----------------------------------------------------------------
create policy "invoices_select_own" on public.invoices
  for select using (
    exists (select 1 from public.companies c where c.id = invoices.company_id and c.user_id = auth.uid())
  );

create policy "invoices_insert_own" on public.invoices
  for insert with check (
    exists (select 1 from public.companies c where c.id = invoices.company_id and c.user_id = auth.uid())
  );

create policy "invoices_update_own" on public.invoices
  for update using (
    exists (select 1 from public.companies c where c.id = invoices.company_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.companies c where c.id = invoices.company_id and c.user_id = auth.uid())
  );

create policy "invoices_delete_own" on public.invoices
  for delete using (
    exists (select 1 from public.companies c where c.id = invoices.company_id and c.user_id = auth.uid())
  );

-- invoice_items — scoped two levels up (invoice -> company -> user) --------
create policy "invoice_items_select_own" on public.invoice_items
  for select using (
    exists (
      select 1 from public.invoices i
      join public.companies c on c.id = i.company_id
      where i.id = invoice_items.invoice_id and c.user_id = auth.uid()
    )
  );

create policy "invoice_items_insert_own" on public.invoice_items
  for insert with check (
    exists (
      select 1 from public.invoices i
      join public.companies c on c.id = i.company_id
      where i.id = invoice_items.invoice_id and c.user_id = auth.uid()
    )
  );

create policy "invoice_items_update_own" on public.invoice_items
  for update using (
    exists (
      select 1 from public.invoices i
      join public.companies c on c.id = i.company_id
      where i.id = invoice_items.invoice_id and c.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.invoices i
      join public.companies c on c.id = i.company_id
      where i.id = invoice_items.invoice_id and c.user_id = auth.uid()
    )
  );

create policy "invoice_items_delete_own" on public.invoice_items
  for delete using (
    exists (
      select 1 from public.invoices i
      join public.companies c on c.id = i.company_id
      where i.id = invoice_items.invoice_id and c.user_id = auth.uid()
    )
  );
