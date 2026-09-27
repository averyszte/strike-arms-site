-- ═══════════════════════════════════════════════════════════════
-- 023 -- 002's policies brought into line, plus two grant clean-ups
--
-- Found by supabase/verify-rls.sql after 022.
--
-- 1. Admin reads of customer data needed only a password. orders,
--    order_items, order_status_log and inquiries were readable by an aal1
--    admin session. The admin UI never reads them before the session is aal2
--    (AuthGuard shows MfaGate until then), so this changes nothing a real
--    admin sees; it stops a stolen password alone from reading every
--    customer's name, address and phone number. Draft products get the same
--    rule for consistency: one admin check, everywhere.
--
-- 2. Every policy from 002 had no TO clause, so it was evaluated for anon as
--    well, and called the helper bare, so it was evaluated once per row.
--    Each is recreated with TO and the (select …) form 010 and 011 already
--    use. Behaviour is otherwise identical: same names, same commands.
--
-- 3. anon and authenticated held TRUNCATE on every public table, from
--    Supabase's default grants. PostgREST has no way to send a TRUNCATE, so
--    this was not reachable, but TRUNCATE ignores RLS entirely and nothing
--    here needs it.
--
-- 4. enqueue_orphaned_images() and dequeue_reused_images() are trigger
--    functions left with PostgreSQL's default PUBLIC execute. Postgres
--    refuses a direct call to a trigger function, so this was not reachable
--    either. Triggers do not check EXECUTE when they fire, so revoking it
--    leaves them working.
-- ═══════════════════════════════════════════════════════════════

-- ─── products ───────────────────────────────────────────────────

drop policy if exists "public read published products" on public.products;
drop policy if exists "admin read all products"        on public.products;
drop policy if exists "admin insert products"          on public.products;
drop policy if exists "admin update products"          on public.products;
drop policy if exists "admin delete products"          on public.products;

create policy "public read published products"
  on public.products for select
  to anon, authenticated
  using (is_published = true);

create policy "admin read all products"
  on public.products for select
  to authenticated
  using ((select public.is_admin_aal2()));

create policy "admin insert products"
  on public.products for insert
  to authenticated
  with check ((select public.is_admin_aal2()));

create policy "admin update products"
  on public.products for update
  to authenticated
  using ((select public.is_admin_aal2()))
  with check ((select public.is_admin_aal2()));

create policy "admin delete products"
  on public.products for delete
  to authenticated
  using ((select public.is_admin_aal2()));

-- ─── orders, order_items, order_status_log ──────────────────────

drop policy if exists "admin read orders"             on public.orders;
drop policy if exists "admin update orders"           on public.orders;
drop policy if exists "admin read order items"        on public.order_items;
drop policy if exists "admin read order status log"   on public.order_status_log;
drop policy if exists "admin insert order status log" on public.order_status_log;

create policy "admin read orders"
  on public.orders for select
  to authenticated
  using ((select public.is_admin_aal2()));

create policy "admin update orders"
  on public.orders for update
  to authenticated
  using ((select public.is_admin_aal2()))
  with check ((select public.is_admin_aal2()));

create policy "admin read order items"
  on public.order_items for select
  to authenticated
  using ((select public.is_admin_aal2()));

create policy "admin read order status log"
  on public.order_status_log for select
  to authenticated
  using ((select public.is_admin_aal2()));

create policy "admin insert order status log"
  on public.order_status_log for insert
  to authenticated
  with check ((select public.is_admin_aal2()));

-- ─── inventory_adjustments ──────────────────────────────────────
-- Still FOR ALL here; making the ledger insert-only is 024's job.

drop policy if exists "admin manage inventory adjustments" on public.inventory_adjustments;

create policy "admin manage inventory adjustments"
  on public.inventory_adjustments for all
  to authenticated
  using ((select public.is_admin_aal2()))
  with check ((select public.is_admin_aal2()));

-- ─── inquiries ──────────────────────────────────────────────────
-- The anon insert stays until the submit-inquiry function replaces it (028).

drop policy if exists "anon insert inquiries"   on public.inquiries;
drop policy if exists "admin read inquiries"    on public.inquiries;
drop policy if exists "admin update inquiries"  on public.inquiries;

create policy "anon insert inquiries"
  on public.inquiries for insert
  to anon, authenticated
  with check (true);

create policy "admin read inquiries"
  on public.inquiries for select
  to authenticated
  using ((select public.is_admin_aal2()));

create policy "admin update inquiries"
  on public.inquiries for update
  to authenticated
  using ((select public.is_admin_aal2()))
  with check ((select public.is_admin_aal2()));

-- ─── store_settings (010 had the right form but no TO) ─────────

drop policy if exists "public read store settings"  on public.store_settings;
drop policy if exists "admin update store settings" on public.store_settings;

create policy "public read store settings"
  on public.store_settings for select
  to anon, authenticated
  using (true);

create policy "admin update store settings"
  on public.store_settings for update
  to authenticated
  using ((select public.is_admin_aal2()))
  with check ((select public.is_admin_aal2()));

-- ─── grants ─────────────────────────────────────────────────────

revoke truncate on all tables in schema public from anon, authenticated;
alter default privileges in schema public revoke truncate on tables from anon, authenticated;

revoke execute on function public.enqueue_orphaned_images() from public, anon, authenticated;
revoke execute on function public.dequeue_reused_images()   from public, anon, authenticated;
