-- Strike Arms: GRANT audit (E1.1)
--
-- Postgres checks GRANTs before RLS, so the two have to be read together. A
-- correct policy with no grant is a silent 401; a generous grant with no
-- policy is usually harmless; and a SECURITY DEFINER function is neither --
-- it ignores RLS entirely and is executable by PUBLIC unless something
-- revokes it. That last case is what this migration is mostly about.
--
-- Everything below was found by reading 001-013 against what the browser and
-- the Edge Functions actually call. What was checked and found correct is
-- recorded at the foot of the file, so the next audit does not start over.
--
-- Deploy note: nothing here requires a matching front-end change, and the
-- front end does not break if this is pushed late. adjust_stock keeps its
-- four-argument signature for exactly that reason.

-- ═══════════════════════════════════════════════════════════════
-- 1. adjust_stock -- callable by anyone, trusted the caller's own word
--
-- SECURITY DEFINER, no revoke, and no authorisation check of any kind. The
-- anon key is public by design, so anyone could rewrite stock_count on any
-- product and write whatever they liked into the audit log:
--
--   POST /rest/v1/rpc/adjust_stock {"p_product_id": "...", "p_adjustment": -999}
--
-- p_adjusted_by was the same fault in miniature: the audit trail recorded
-- whoever the caller said they were. It now records auth.uid() and ignores
-- the argument. The argument itself stays so that this migration and the
-- front end can be deployed in either order; it comes out once this is
-- confirmed applied.
-- ═══════════════════════════════════════════════════════════════

create or replace function adjust_stock(
  p_product_id  uuid,
  p_adjustment  int,
  p_reason      text,
  p_adjusted_by uuid default null  -- ignored; see above
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
begin
  -- Matches the inventory_adjustments policy, which is what a direct write to
  -- the same table has always had to pass. A function that bypasses RLS must
  -- not be an easier door than the table it writes to.
  if not public.is_admin_aal2() then
    raise exception 'not authorised' using errcode = '42501';
  end if;

  update products
     set stock_count = stock_count + p_adjustment
   where id = p_product_id;

  if not found then
    raise exception 'product % not found', p_product_id;
  end if;

  insert into inventory_adjustments (product_id, adjustment, reason, adjusted_by)
    values (p_product_id, p_adjustment, p_reason, auth.uid());
end;
$fn$;

revoke all on function public.adjust_stock(uuid, int, text, uuid)
  from public, anon;
grant execute on function public.adjust_stock(uuid, int, text, uuid)
  to authenticated;

comment on function public.adjust_stock(uuid, int, text, uuid) is
  'Admin stock adjustment. Requires an AAL2 admin session. p_adjusted_by is ignored -- the row is attributed to auth.uid().';

-- ═══════════════════════════════════════════════════════════════
-- 2. reserve_stock -- superseded, still callable by anyone
--
-- Replaced by reserve_order_stock (008), which the checkout Edge Function
-- calls with the service role. Nothing in the site or the functions has
-- called this since. It was still SECURITY DEFINER and still executable by
-- PUBLIC, which meant anyone could inflate reserved_count on any product
-- until the shop showed it out of stock.
--
-- Revoked rather than dropped: it is sound machinery, and a drop would take
-- the generated database types with it for no gain.
-- ═══════════════════════════════════════════════════════════════

revoke all on function public.reserve_stock(uuid, int, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.reserve_stock(uuid, int, text, timestamptz)
  to service_role;

comment on function public.reserve_stock(uuid, int, text, timestamptz) is
  'Superseded by reserve_order_stock. Not callable from the browser.';

-- ═══════════════════════════════════════════════════════════════
-- 3. checkout_reservations -- anon INSERT is no longer used, and was a way
--    to release other people's stock
--
-- The grant and the policy date from when the browser reserved stock itself.
-- It does not any more: the checkout Edge Function calls reserve_order_stock
-- with the service role, and nothing in src/ touches this table.
--
-- Left open it is worse than unused. release_expired_reservations sweeps any
-- row whose expires_at has passed and decrements products.reserved_count by
-- that row's quantity. A forged row -- past expiry, null order_id, whatever
-- quantity you like -- therefore has the sweeper release genuine holds on the
-- named product five minutes later, and the shop oversells.
-- ═══════════════════════════════════════════════════════════════

drop policy if exists "anon insert checkout reservations" on public.checkout_reservations;
revoke all on public.checkout_reservations from anon;

-- ═══════════════════════════════════════════════════════════════
-- 4. Tables the browser has no business in
--
-- 004 says "service role only (no browser grants)" and then grants all three
-- to authenticated. RLS is enabled on each with no policies, so nothing gets
-- through today -- but the grant is a loaded gun for whoever later adds a
-- policy to one of these tables for some narrow reason and gets full write
-- access as a side effect.
-- ═══════════════════════════════════════════════════════════════

revoke all on public.admins from anon, authenticated;
revoke all on public.stripe_event_log from anon, authenticated;
revoke all on public.notification_jobs from anon, authenticated;

-- ═══════════════════════════════════════════════════════════════
-- CHECKED AND CORRECT -- recorded so the next audit can skip it
--
--   inquiries        anon INSERT granted (004) and policy present (002).
--                    This is the exact pairing whose absence gives a public
--                    contact form that 401s while showing a success message.
--   products         anon SELECT + published-only policy; writes need AAL2.
--   subcategories    anon SELECT (006) + public_read policy (005).
--   store_settings   anon SELECT, authenticated UPDATE (010), policies match.
--   orphaned_images  service_role only (011); RLS on, no policies.
--   orders,          granted to authenticated, but only the SELECT and UPDATE
--   order_items,     paths have policies -- inserts and deletes are the
--   order_status_log webhook's job and are denied in the browser by RLS.
--
--   008's trusted server tier (claim_stripe_event, reserve_order_stock,
--   confirm_order_paid, expire_order, record_refund and the rest) is revoked
--   from public/anon/authenticated and granted to service_role. 012 replaces
--   confirm_order_paid with an identical signature, so that ACL survives, and
--   re-grants release_expired_reservations after dropping it.
--
--   create_counter_order (013) is revoked from public/anon and granted to
--   authenticated, with its own AAL2 check inside.
--
--   is_admin() and is_admin_aal2() stay executable by anon and authenticated
--   on purpose. Every RLS policy calls them, and a policy is evaluated as the
--   querying role -- revoking these breaks every table at once.
--
--   set_updated_at, log_order_status_change, enqueue_orphaned_images and
--   dequeue_reused_images all return trigger. PostgREST will not expose them
--   and Postgres does not check EXECUTE when a trigger fires.
--
--   No sequences: every primary key is a uuid default, so there is no
--   sequence grant to miss.
-- ═══════════════════════════════════════════════════════════════

notify pgrst, 'reload schema';
