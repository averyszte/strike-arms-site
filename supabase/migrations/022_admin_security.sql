-- ═══════════════════════════════════════════════════════════════
-- 022 -- admin security: the Categories screen, the admin checks, and
--        reservation writes
--
-- Found by the completion audit (docs/audit/completion-plan.md, blockers 6
-- and 7). Four separate fixes, all to the admin side.
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- 1. subcategories -- the admin policy could never pass
--
-- 005's "admins_all" inlined `exists (select 1 from admins where id =
-- auth.uid())`. A policy expression runs as the caller, so that subquery is
-- itself subject to the caller's privileges and RLS on admins: RLS on, no
-- policies (002), and since 014 no grant either. Every admin write to
-- subcategories therefore failed with "permission denied for table admins".
-- 014's ledger signed the table off having checked only the anon read side.
--
-- The replacement goes through the SECURITY DEFINER helper, needs a
-- TOTP-verified session like every other admin write, and is wrapped in a
-- subquery so it is evaluated once per statement, not once per row. Reads
-- stay with 005's public_read policy.
-- ═══════════════════════════════════════════════════════════════

drop policy if exists "admins_all" on public.subcategories;

create policy "admin insert subcategories"
  on public.subcategories for insert
  to authenticated
  with check ((select public.is_admin_aal2()));

create policy "admin update subcategories"
  on public.subcategories for update
  to authenticated
  using ((select public.is_admin_aal2()))
  with check ((select public.is_admin_aal2()));

create policy "admin delete subcategories"
  on public.subcategories for delete
  to authenticated
  using ((select public.is_admin_aal2()));

-- ═══════════════════════════════════════════════════════════════
-- 2. is_admin(), is_admin_aal2(), reserve_stock() -- no search_path
--
-- Every other SECURITY DEFINER function in the schema pins its search_path;
-- these three from 002/003 did not. A definer function that resolves names
-- through the caller's search_path can be pointed at an object the caller
-- created. Every admin RLS policy in the database goes through the first two.
--
-- ALTER rather than CREATE OR REPLACE, so the bodies are untouched.
-- is_admin_aal2() calls is_admin() unqualified, which is why the path keeps
-- public after pg_catalog rather than being empty.
-- ═══════════════════════════════════════════════════════════════

alter function public.is_admin()      set search_path = pg_catalog, public;
alter function public.is_admin_aal2() set search_path = pg_catalog, public;
alter function public.reserve_stock(uuid, int, text, timestamptz)
  set search_path = pg_catalog, public;

-- ═══════════════════════════════════════════════════════════════
-- 3. checkout_reservations -- admin writes needed only a password
--
-- 002's "admin manage checkout reservations" is FOR ALL using is_admin(), so a
-- password-only (aal1) session could insert, edit or delete holds. A deleted
-- or edited row desynchronises products.reserved_count the same way 014's
-- forged-row exploit did. Nothing in the site writes this table: the checkout
-- Edge Function and the cron sweeper both use the service role. The browser
-- keeps a TOTP-gated read, for monitoring, and loses the writes.
-- ═══════════════════════════════════════════════════════════════

drop policy if exists "admin manage checkout reservations" on public.checkout_reservations;

create policy "admin read checkout reservations"
  on public.checkout_reservations for select
  to authenticated
  using ((select public.is_admin_aal2()));

revoke insert, update, delete, truncate on public.checkout_reservations from authenticated;

-- ═══════════════════════════════════════════════════════════════
-- 4. Maintenance functions -- revoked from PUBLIC only
--
-- 011 and 012 revoked these from PUBLIC. A probe with the anon key is refused,
-- so there is no direct grant to anon today, but schedule_image_sweep reads
-- the service role key out of Vault and posts it to whatever project URL it
-- is given. That is too much to rest on the absence of a default grant, so
-- the browser roles are named explicitly.
-- ═══════════════════════════════════════════════════════════════

revoke execute on function public.schedule_image_sweep(text, text) from anon, authenticated;
revoke execute on function public.bump_orphan_attempts(text[], text) from anon, authenticated;
revoke execute on function public.storage_path_from_public_url(text) from anon, authenticated;
