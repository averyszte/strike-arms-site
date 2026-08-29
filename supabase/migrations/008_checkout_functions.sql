-- Strike Arms: checkout and Stripe webhook RPCs
--
-- Everything the two Edge Functions need, as SECURITY DEFINER Postgres
-- functions granted to service_role only. Two reasons for putting the logic
-- here rather than in Deno:
--   - each of these has to be atomic (stock + status + order number move
--     together or not at all), and a function body is one transaction;
--   - Stripe redelivers events, so every one of them must be safe to run twice.

-- ═══════════════════════════════════════════════════════════════
-- WEBHOOK IDEMPOTENCY — claim / release
--
-- The claim is the lock: INSERT ... ON CONFLICT DO NOTHING means two
-- concurrent deliveries of the same event cannot both proceed, which a
-- read-then-write check cannot guarantee. The release exists because a claim
-- that is never released would deduplicate Stripe's retry of an event whose
-- handler threw, silently dropping it.
-- ═══════════════════════════════════════════════════════════════

create or replace function claim_stripe_event(p_event_id text, p_type text)
returns bool
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  claimed int;
begin
  insert into stripe_event_log (id, type)
    values (p_event_id, p_type)
    on conflict (id) do nothing;

  get diagnostics claimed = row_count;
  return claimed = 1;
end;
$fn$;

create or replace function release_stripe_event(p_event_id text)
returns void
language sql
security definer
set search_path = pg_catalog, public
as $fn$
  delete from stripe_event_log where id = p_event_id;
$fn$;

-- ═══════════════════════════════════════════════════════════════
-- STOCK HELD FOR A CHECKOUT
-- ═══════════════════════════════════════════════════════════════

-- Reserve every line of an order in one transaction. Returns null on success,
-- or the product_id that could not be satisfied, so the caller can tell the
-- shopper which item ran out. Every row is locked before any is written, so
-- two shoppers racing for the last item cannot both succeed.
--
-- p_lines: [{"product_id": uuid, "quantity": int}, ...]
create or replace function reserve_order_stock(
  p_order_id   uuid,
  p_lines      jsonb,
  p_expires_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  line      jsonb;
  pid       uuid;
  qty       int;
  available int;
begin
  for line in select * from jsonb_array_elements(p_lines) loop
    pid := (line ->> 'product_id')::uuid;
    qty := (line ->> 'quantity')::int;

    select stock_count - reserved_count into available
      from products where id = pid for update;

    if available is null or available < qty then
      return pid;
    end if;
  end loop;

  for line in select * from jsonb_array_elements(p_lines) loop
    pid := (line ->> 'product_id')::uuid;
    qty := (line ->> 'quantity')::int;

    update products set reserved_count = reserved_count + qty where id = pid;

    insert into checkout_reservations
      (product_id, quantity, session_key, order_id, expires_at)
      values (pid, qty, p_order_id::text, p_order_id, p_expires_at);
  end loop;

  return null;
end;
$fn$;

-- Give back everything one order is holding. Safe to call twice: rows are
-- deleted as they are released, so a second call finds nothing.
create or replace function release_order_reservations(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  r checkout_reservations%rowtype;
begin
  for r in
    select * from checkout_reservations where order_id = p_order_id for update
  loop
    update products
      set reserved_count = greatest(0, reserved_count - r.quantity)
      where id = r.product_id;
    delete from checkout_reservations where id = r.id;
  end loop;
end;
$fn$;

-- A shopper who bounces off the Stripe page and retries would otherwise leave
-- the first attempt's order holding stock until its reservation expires.
-- Only ever touches orders still pending, never one that has paid.
create or replace function clear_stale_checkout_attempt(p_attempt_id uuid)
returns int
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  o       record;
  cleared int := 0;
begin
  for o in
    select id from orders
      where checkout_attempt_id = p_attempt_id and payment_status = 'pending'
  loop
    perform release_order_reservations(o.id);
    delete from orders where id = o.id;
    cleared := cleared + 1;
  end loop;

  return cleared;
end;
$fn$;

-- ═══════════════════════════════════════════════════════════════
-- PAYMENT OUTCOMES
-- ═══════════════════════════════════════════════════════════════

-- The whole of "this order is paid": flip the status, draw the order number,
-- turn the reservation into a real stock deduction, and write the audit row,
-- in one transaction. An order therefore cannot end up paid but unnumbered,
-- or paid but still only reserved.
--
-- Returns the order number, or null if the order was not eligible. The stock
-- leg runs only on the pending -> paid transition, so a redelivered event
-- returns the existing number without deducting twice.
create or replace function confirm_order_paid(
  p_order_id          uuid,
  p_payment_intent_id text,
  p_session_id        text default null
)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  v_number text;
  v_moved  uuid;
  item     record;
begin
  update orders
     set payment_status        = 'paid',
         paid_at               = coalesce(paid_at, now()),
         stripe_payment_intent = coalesce(stripe_payment_intent, p_payment_intent_id),
         stripe_session_id     = coalesce(stripe_session_id, p_session_id),
         order_number          = coalesce(
           order_number,
           'SA-' || to_char(now(), 'YYYY') || '-' ||
             lpad(nextval('order_number_seq')::text, 4, '0')
         )
   where id = p_order_id
     and payment_status = 'pending'
   returning id, order_number into v_moved, v_number;

  if v_moved is null then
    -- Already paid (a redelivery), or refunded/expired and so not eligible.
    -- Stripe does not guarantee event ordering, and a late "completed" must
    -- never resurrect a closed order.
    select order_number into v_number
      from orders where id = p_order_id and payment_status = 'paid';
    return v_number;
  end if;

  for item in
    select product_id, quantity
      from order_items
      where order_id = p_order_id and product_id is not null
  loop
    update products
       set reserved_count = greatest(0, reserved_count - item.quantity),
           stock_count    = greatest(0, stock_count - item.quantity)
     where id = item.product_id;

    insert into inventory_adjustments (product_id, adjustment, reason)
      values (item.product_id, -item.quantity, 'sale: ' || v_number);
  end loop;

  delete from checkout_reservations where order_id = p_order_id;

  return v_number;
end;
$fn$;

-- Stripe session expiry. Releases the stock hold and closes the order.
-- Guarded on 'pending' so it can never close an order that has paid.
create or replace function expire_order(p_order_id uuid)
returns bool
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  v_moved uuid;
begin
  update orders set payment_status = 'failed'
    where id = p_order_id and payment_status = 'pending'
    returning id into v_moved;

  if v_moved is null then
    return false;
  end if;

  perform release_order_reservations(p_order_id);
  return true;
end;
$fn$;

-- Refunds are issued in the Stripe dashboard; this records what Stripe
-- reports. Matched on the payment intent because a refund event carries no
-- session. Stock is deliberately NOT returned: a refunded item may or may not
-- come back to the shelf, and only the shop knows which.
create or replace function record_refund(
  p_payment_intent_id text,
  p_refund_cents      int,
  p_fully_refunded    bool
)
returns bool
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  v_moved uuid;
begin
  update orders
     set refund_cents   = p_refund_cents,
         refunded_at    = coalesce(refunded_at, now()),
         payment_status = case
           when p_fully_refunded then 'refunded' else 'partially_refunded'
         end
   where stripe_payment_intent = p_payment_intent_id
     and payment_status in ('paid', 'partially_refunded')
   returning id into v_moved;

  return v_moved is not null;
end;
$fn$;

-- ═══════════════════════════════════════════════════════════════
-- GRANTS
-- These are the trusted server tier. They must never be callable from the
-- browser, so every one is revoked from anon/authenticated and granted only
-- to service_role, which is the key the Edge Functions hold.
-- ═══════════════════════════════════════════════════════════════

do $grants$
declare
  fn text;
begin
  foreach fn in array array[
    'claim_stripe_event(text, text)',
    'release_stripe_event(text)',
    'reserve_order_stock(uuid, jsonb, timestamptz)',
    'release_order_reservations(uuid)',
    'clear_stale_checkout_attempt(uuid)',
    'confirm_order_paid(uuid, text, text)',
    'expire_order(uuid)',
    'record_refund(text, int, bool)',
    'release_expired_reservations()'
  ] loop
    execute format(
      'revoke all on function public.%s from public, anon, authenticated', fn);
    execute format(
      'grant execute on function public.%s to service_role', fn);
  end loop;
end
$grants$;

notify pgrst, 'reload schema';
