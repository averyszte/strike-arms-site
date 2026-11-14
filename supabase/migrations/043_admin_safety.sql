-- ═══════════════════════════════════════════════════════════════
-- 043: admin and account safety
--
-- Pre-launch audit, L3.
--
-- M-020  handle_invited_admin (024, 027) made anyone with invited_at an
--        admin. GoTrue's invite reuses an existing unconfirmed sign-up and
--        writes invited_at onto it, password and all, so someone who signed
--        up with an address before Alan invited it would become an admin
--        with a password they chose. Only a user who has never had a
--        password and never signed in is promoted now. Such a user has no
--        session to sign out, which is why there is no global sign-out
--        here. Existing admins are not touched (see the check query in the
--        hand-over).
-- M-021  claim_my_guest_orders (034) trusted email_confirmed_at. With
--        "Confirm email" off, GoTrue stamps it at sign-up, so anyone could
--        register a customer's address and claim their orders. A claim now
--        also needs the confirmation to have come after the sign-up, which
--        only a real confirmation link does.
-- M-023  The store_settings row could be deleted by anyone with SQL access,
--        and checkout then fails. A trigger refuses it.
-- M-029  Delivery rates had no upper bound and no history. Hard limits,
--        deliberately looser than the admin form's warnings, and a history
--        row for every change.
-- M-024  Four small hardening items: the product-images list policy, an
--        AAL2 check on applied_migrations(), a pinned search_path on two
--        003 trigger functions, and archived products counting in the
--        subcategory delete guard.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Invited admins (M-020) ──────────────────────────────────

create or replace function public.handle_invited_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- A genuine invite is of an address with no account behind it: GoTrue
  -- creates the user with no password and writes invited_at. An existing
  -- sign-up that is re-invited keeps its own password, and is not promoted.
  if new.invited_at is not null
     and coalesce(new.encrypted_password, '') = ''
     and new.last_sign_in_at is null then
    insert into public.admins (id)
    values (new.id)
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

revoke execute on function public.handle_invited_admin() from public, anon, authenticated;

-- ─── 2. Guest order claim (M-021) ───────────────────────────────

create or replace function public.claim_my_guest_orders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text;
  v_claimed integer;
begin
  -- Auto-confirm (Confirm email off) stamps email_confirmed_at in the same
  -- moment as created_at. A real confirmation link is clicked later, so
  -- the gap is what proves the address belongs to whoever signed up.
  select lower(trim(u.email)) into v_email
  from auth.users u
  where u.id = auth.uid()
    and u.email_confirmed_at is not null
    and u.email_confirmed_at > u.created_at + interval '5 seconds';

  if v_email is null or v_email = '' then
    return 0;
  end if;

  update public.orders
     set user_id = auth.uid()
   where user_id is null
     and order_number is not null
     and lower(trim(customer_email)) = v_email;

  get diagnostics v_claimed = row_count;
  return v_claimed;
end;
$$;

revoke all on function public.claim_my_guest_orders() from public, anon;
grant execute on function public.claim_my_guest_orders() to authenticated;

-- ─── 3. store_settings cannot be deleted (M-023) ────────────────

create or replace function public.guard_store_settings_delete()
returns trigger
language plpgsql
set search_path = ''
as $fn$
begin
  raise exception 'store_settings row 1 holds the delivery and VAT rates checkout uses, and cannot be deleted. Update it instead.'
    using errcode = 'check_violation';
end;
$fn$;

drop trigger if exists store_settings_guard_delete on public.store_settings;
create trigger store_settings_guard_delete
  before delete on public.store_settings
  for each row execute function public.guard_store_settings_delete();

drop trigger if exists store_settings_guard_truncate on public.store_settings;
create trigger store_settings_guard_truncate
  before truncate on public.store_settings
  for each statement execute function public.guard_store_settings_delete();

revoke all on function public.guard_store_settings_delete() from public, anon, authenticated;

-- ─── 4. Rate bounds and history (M-029) ─────────────────────────
--
-- The form warns well inside these (delivery over 30 euro, a zero
-- threshold, VAT not 0, 9, 13.5 or 23 per cent). The database only stops
-- what cannot be meant: delivery over 100 euro, a threshold over 2,000
-- euro, VAT over 30 per cent.

do $bounds$
declare
  v public.store_settings%rowtype;
begin
  select * into v from public.store_settings where id = 1;
  if found and (v.shipping_flat_cents > 10000
             or v.free_shipping_threshold_cents > 200000
             or v.vat_rate_basis_points > 3000) then
    raise exception 'store_settings row 1 is outside the new bounds (shipping %, threshold %, VAT %); correct it before applying 043',
      v.shipping_flat_cents, v.free_shipping_threshold_cents, v.vat_rate_basis_points;
  end if;
end
$bounds$;

alter table public.store_settings
  drop constraint if exists store_settings_shipping_bound,
  add constraint store_settings_shipping_bound
    check (shipping_flat_cents between 0 and 10000),
  drop constraint if exists store_settings_threshold_bound,
  add constraint store_settings_threshold_bound
    check (free_shipping_threshold_cents between 0 and 200000),
  drop constraint if exists store_settings_vat_bound,
  add constraint store_settings_vat_bound
    check (vat_rate_basis_points between 0 and 3000);

create table if not exists public.store_settings_history (
  id                                bigint      generated always as identity primary key,
  changed_at                        timestamptz not null default now(),
  changed_by                        uuid        references auth.users (id) on delete set null default auth.uid(),
  old_shipping_flat_cents           int         not null,
  new_shipping_flat_cents           int         not null,
  old_free_shipping_threshold_cents int         not null,
  new_free_shipping_threshold_cents int         not null,
  old_vat_rate_basis_points         int         not null,
  new_vat_rate_basis_points         int         not null
);

comment on table public.store_settings_history is
  'Every change to the delivery and VAT rates, old and new, with who made it (043).';

alter table public.store_settings_history enable row level security;

drop policy if exists "admin read store settings history" on public.store_settings_history;
create policy "admin read store settings history"
  on public.store_settings_history for select
  to authenticated
  using ((select public.is_admin_aal2()));

revoke all on public.store_settings_history from public, anon, authenticated;
grant select on public.store_settings_history to authenticated;
grant all on public.store_settings_history to service_role;

-- security definer so the admin's update can write the history row they
-- have no insert grant for.
create or replace function public.log_store_settings_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $fn$
begin
  if (old.shipping_flat_cents, old.free_shipping_threshold_cents, old.vat_rate_basis_points)
     is distinct from
     (new.shipping_flat_cents, new.free_shipping_threshold_cents, new.vat_rate_basis_points) then
    insert into public.store_settings_history (
      old_shipping_flat_cents, new_shipping_flat_cents,
      old_free_shipping_threshold_cents, new_free_shipping_threshold_cents,
      old_vat_rate_basis_points, new_vat_rate_basis_points
    ) values (
      old.shipping_flat_cents, new.shipping_flat_cents,
      old.free_shipping_threshold_cents, new.free_shipping_threshold_cents,
      old.vat_rate_basis_points, new.vat_rate_basis_points
    );
  end if;
  return null;
end;
$fn$;

drop trigger if exists store_settings_log_change on public.store_settings;
create trigger store_settings_log_change
  after update on public.store_settings
  for each row execute function public.log_store_settings_change();

revoke all on function public.log_store_settings_change() from public, anon, authenticated;

-- ─── 5. Small hardening (M-024) ─────────────────────────────────

-- (a) Listing the bucket is for the admin gallery only. Public image URLs
-- do not consult RLS, so the storefront is unaffected.
drop policy if exists "public read product images" on storage.objects;
drop policy if exists "admin list product images" on storage.objects;
create policy "admin list product images"
  on storage.objects for select to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin_aal2()));

-- (b) applied_migrations(): AAL2, like every other admin call.
create or replace function public.applied_migrations()
returns table (version text)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $fn$
begin
  if not public.is_admin_aal2() then
    raise exception 'not authorised' using errcode = '42501';
  end if;

  return query
    select m.version::text
    from supabase_migrations.schema_migrations m
    order by m.version;
end;
$fn$;

revoke all on function public.applied_migrations() from public, anon;
grant execute on function public.applied_migrations() to authenticated;

-- (c) The two 003 trigger functions are invoker functions and so not a
-- privilege risk, but a pinned search_path stops a caller's path changing
-- what order_status_log resolves to.
alter function public.set_updated_at() set search_path = pg_catalog, public;
alter function public.log_order_status_change() set search_path = pg_catalog, public;

-- (d) Archived products now block a subcategory delete too: restoring one
-- (M-037) would otherwise land it on a shelf that no longer exists.
create or replace function public.guard_subcategory_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count int;
begin
  select count(*) into v_count
    from public.products
   where category = old.category
     and subcategory = old.slug;

  if v_count > 0 then
    raise exception '% is used by % product% (archived ones included). Move them to another subcategory first.',
      old.name, v_count, case when v_count = 1 then '' else 's' end
      using errcode = 'foreign_key_violation';
  end if;

  return old;
end;
$$;

revoke all on function public.guard_subcategory_delete() from public, anon, authenticated;

notify pgrst, 'reload schema';
