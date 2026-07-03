-- Strike Arms: Row Level Security policies

-- ═══════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- Both are security definer so they run as the function owner
-- (bypassing RLS on the admins table itself).
-- ═══════════════════════════════════════════════════════════════

create or replace function is_admin()
returns bool
language sql
security definer
stable
as $$
  select exists (select 1 from public.admins where id = auth.uid())
$$;

create or replace function is_admin_aal2()
returns bool
language sql
security definer
stable
as $$
  select
    is_admin()
    and coalesce(
      (select aal from auth.sessions where id = (auth.jwt() ->> 'session_id')::uuid),
      'aal1'
    ) = 'aal2'
$$;

-- ═══════════════════════════════════════════════════════════════
-- PRODUCTS
-- Public: read published products only.
-- Admin read: all products (including drafts).
-- Admin write: requires AAL2 (TOTP-verified session).
-- ═══════════════════════════════════════════════════════════════

alter table products enable row level security;

create policy "public read published products"
  on products for select
  using (is_published = true);

create policy "admin read all products"
  on products for select
  using (is_admin());

create policy "admin insert products"
  on products for insert
  with check (is_admin_aal2());

create policy "admin update products"
  on products for update
  using (is_admin_aal2());

create policy "admin delete products"
  on products for delete
  using (is_admin_aal2());

-- ═══════════════════════════════════════════════════════════════
-- ORDERS
-- No public access. Orders are created by the Stripe webhook Edge
-- Function using the service role key, so no anon INSERT policy needed.
-- ═══════════════════════════════════════════════════════════════

alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_log enable row level security;

create policy "admin read orders"
  on orders for select using (is_admin());

create policy "admin update orders"
  on orders for update using (is_admin_aal2());

create policy "admin read order items"
  on order_items for select using (is_admin());

create policy "admin read order status log"
  on order_status_log for select using (is_admin());

create policy "admin insert order status log"
  on order_status_log for insert with check (is_admin_aal2());

-- ═══════════════════════════════════════════════════════════════
-- INVENTORY
-- ═══════════════════════════════════════════════════════════════

alter table inventory_adjustments enable row level security;

create policy "admin manage inventory adjustments"
  on inventory_adjustments for all using (is_admin_aal2());

-- Checkout reservations: anon inserts (store-front checkout),
-- admin can read/delete (cleanup and monitoring).
alter table checkout_reservations enable row level security;

create policy "anon insert checkout reservations"
  on checkout_reservations for insert with check (true);

create policy "admin manage checkout reservations"
  on checkout_reservations for all using (is_admin());

-- ═══════════════════════════════════════════════════════════════
-- INQUIRIES
-- Anon can submit. Admin can read and update status.
-- ═══════════════════════════════════════════════════════════════

alter table inquiries enable row level security;

create policy "anon insert inquiries"
  on inquiries for insert with check (true);

create policy "admin read inquiries"
  on inquiries for select using (is_admin());

create policy "admin update inquiries"
  on inquiries for update using (is_admin_aal2());

-- ═══════════════════════════════════════════════════════════════
-- ADMINS
-- No browser access — managed via Supabase dashboard or service role.
-- ═══════════════════════════════════════════════════════════════

alter table admins enable row level security;

-- ═══════════════════════════════════════════════════════════════
-- STRIPE & NOTIFICATIONS (service role only — no browser policies)
-- ═══════════════════════════════════════════════════════════════

alter table stripe_event_log enable row level security;
alter table notification_jobs enable row level security;
