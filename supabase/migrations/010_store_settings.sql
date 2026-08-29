-- Strike Arms: store settings
--
-- The rates that decide what a customer is charged used to live as constants in
-- two files — artifacts/strike-arms/src/lib/shipping.ts (Vite) and
-- supabase/functions/_shared/shipping.ts (Deno) — held in sync by nothing more
-- than a comment. Deno cannot import from the Vite tree, so the duplication is
-- unavoidable; what was avoidable was duplicating the *numbers*.
--
-- The All Blooms Florist build shipped that exact arrangement for delivery
-- zones and the two copies drifted in production: some zones were overcharged
-- and eight were missing from the server copy entirely, so the price shown in
-- the cart was not the amount Stripe charged. This table exists so that the
-- browser and the checkout function read the same row, and a rate can only be
-- wrong in one place at a time.
--
-- Single row, enforced by the primary key check. It is a settings record, not
-- a collection. Delivery zones, when Alan confirms them, become a separate
-- table keyed to this one rather than more columns here.

create table if not exists store_settings (
  id                            smallint    primary key default 1
    check (id = 1),
  shipping_flat_cents           int         not null
    check (shipping_flat_cents >= 0),
  free_shipping_threshold_cents int         not null
    check (free_shipping_threshold_cents >= 0),
  -- Basis points, so 2300 = 23%. Displayed prices are VAT inclusive, so this
  -- rate extracts the VAT already contained in a gross amount.
  vat_rate_basis_points         int         not null
    check (vat_rate_basis_points between 0 and 10000),
  updated_at                    timestamptz not null default now(),
  updated_by                    uuid        references auth.users(id) on delete set null
);

-- The same placeholder values the constants held. Still unconfirmed by Alan
-- and the accountant — but now there is one place to correct them, and no
-- deploy needed to do it.
insert into store_settings (
  id, shipping_flat_cents, free_shipping_threshold_cents, vat_rate_basis_points
)
values (1, 650, 7500, 2300)
on conflict (id) do nothing;

create trigger store_settings_updated_at
  before update on store_settings
  for each row execute function set_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- RLS
-- Everyone reads: the cart has to price delivery before anyone logs in.
-- Only an AAL2 admin writes. Nobody inserts or deletes — the single row is
-- seeded here, and a missing row must fail checkout loudly rather than fall
-- back to a hardcoded number, which is the drift this table removes.
-- ═══════════════════════════════════════════════════════════════

alter table store_settings enable row level security;

create policy "public read store settings"
  on store_settings for select using (true);

-- Subquery form: evaluated once per statement rather than once per row.
create policy "admin update store settings"
  on store_settings for update
  using ((select public.is_admin_aal2()))
  with check ((select public.is_admin_aal2()));

-- ═══════════════════════════════════════════════════════════════
-- GRANTS
-- Postgres checks grants before RLS, so a correct policy with no grant is a
-- silent 401. Deliberately no insert or delete grant to anyone.
-- ═══════════════════════════════════════════════════════════════

grant select on public.store_settings to anon, authenticated;
grant update on public.store_settings to authenticated;

notify pgrst, 'reload schema';
