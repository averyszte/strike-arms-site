-- ═══════════════════════════════════════════════════════════════
-- 028: checkout integrity
--
-- Three ways money and stock could disagree (completion plan, blockers 1-2):
--
-- 1. reserve_order_stock checked each line on its own, so a basket with the
--    same one-off on two lines passed both checks and held two of one.
-- 2. confirm_order_paid took stock from order_items without checking it was
--    still there. If the sweeper had released the hold and someone else had
--    bought the item, greatest(0, ...) hid the negative and the item was sold
--    twice.
-- 3. clear_stale_checkout_attempt deleted the earlier pending order without
--    closing its Stripe session. Paying in that older tab then reached a
--    webhook that found no order, returned 200, and nobody was told.
--
-- After this migration:
--   - a stale attempt is marked 'abandoned', never deleted, and
--     create-checkout-session expires its Stripe session;
--   - a late payment on a pending or abandoned order always finds the order;
--   - if the stock has gone, the order is still recorded as paid and numbered
--     (the money was taken, and a refund needs something to point at), takes
--     no stock, and is flagged with attention_reason for Alan to refund or
--     source the item;
--   - orders.stock_taken_at records whether stock was actually taken, so
--     cancelling a flagged order does not restock what never left the shelf.
--
-- Lock order everywhere on the payment path is orders, then
-- checkout_reservations, then products (by id), the same as 012.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Columns and the new status ──────────────────────────────

alter table public.orders
  add column if not exists attention_reason    text,
  add column if not exists attention_raised_at timestamptz,
  add column if not exists stock_taken_at      timestamptz;

comment on column public.orders.attention_reason is
  'Why this order needs a human, in words the admin can show. Null when it does not.';
comment on column public.orders.stock_taken_at is
  'When confirm_order_paid took stock for this order. Null means none was taken, so cancelling must not restock.';

-- Until now a numbered order was exactly one whose stock was taken (025).
update public.orders
   set stock_taken_at = coalesce(paid_at, created_at)
 where stock_taken_at is null
   and order_number is not null
   and payment_status in ('paid', 'partially_refunded', 'refunded');

-- The payment_status check was declared inline in 001, so its name is
-- Postgres's choice; it is looked up rather than assumed (as in 020).
do $$
declare
  v_name text;
begin
  for v_name in
    select con.conname
      from pg_constraint con
      join pg_attribute att
        on att.attrelid = con.conrelid and att.attnum = any (con.conkey)
     where con.conrelid = 'public.orders'::regclass
       and con.contype = 'c'
       and att.attname = 'payment_status'
  loop
    execute format('alter table public.orders drop constraint %I', v_name);
  end loop;
end;
$$;

alter table public.orders
  add constraint orders_payment_status_check check (payment_status in (
    'pending', 'paid', 'refunded', 'partially_refunded', 'failed', 'expired', 'abandoned'
  ));

-- ─── 2. Reserve: duplicate lines are summed ─────────────────────
--
-- One reservation row per product rather than per line, which every release
-- path handles the same way. Products are locked in id order so two baskets
-- sharing items cannot deadlock each other.

create or replace function public.reserve_order_stock(
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
  line      record;
  available int;
begin
  for line in
    select (l ->> 'product_id')::uuid        as product_id,
           sum((l ->> 'quantity')::int)::int as quantity
      from jsonb_array_elements(p_lines) l
     group by 1
     order by 1
  loop
    if line.quantity is null or line.quantity < 1 then
      raise exception 'Invalid quantity for product %', line.product_id;
    end if;

    select stock_count - reserved_count into available
      from products where id = line.product_id for update;

    if not found or available < line.quantity then
      return line.product_id;
    end if;
  end loop;

  for line in
    select (l ->> 'product_id')::uuid        as product_id,
           sum((l ->> 'quantity')::int)::int as quantity
      from jsonb_array_elements(p_lines) l
     group by 1
     order by 1
  loop
    update products set reserved_count = reserved_count + line.quantity
     where id = line.product_id;

    insert into checkout_reservations
      (product_id, quantity, session_key, order_id, expires_at)
      values (line.product_id, line.quantity, p_order_id::text, p_order_id, p_expires_at);
  end loop;

  return null;
end;
$fn$;

-- ─── 3. Abandon instead of delete ───────────────────────────────
--
-- An abandoned order keeps its row, so a late payment on its Stripe session
-- still finds it. Guarded on 'pending': a paid order is never abandoned.

create or replace function public.abandon_order(p_order_id uuid)
returns bool
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  v_moved uuid;
begin
  update orders set payment_status = 'abandoned'
   where id = p_order_id and payment_status = 'pending'
   returning id into v_moved;

  if v_moved is null then
    return false;
  end if;

  perform release_order_reservations(p_order_id);
  return true;
end;
$fn$;

-- Dropped rather than replaced: it returned int, and it now returns the Stripe
-- sessions of the orders it abandoned so the Edge Function can expire them.
-- Postgres refuses to change a return type in place (42P13), and the drop
-- discards the ACL, so the grant is set again below.
drop function if exists public.clear_stale_checkout_attempt(uuid);

create function public.clear_stale_checkout_attempt(p_attempt_id uuid)
returns setof text
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  o record;
begin
  for o in
    select id, stripe_session_id from orders
     where checkout_attempt_id = p_attempt_id and payment_status = 'pending'
     order by id
  loop
    if abandon_order(o.id) and o.stripe_session_id is not null then
      return next o.stripe_session_id;
    end if;
  end loop;
end;
$fn$;

-- ─── 4. Confirm: re-check before taking stock ───────────────────

-- The first product line on this order that cannot be covered, or nothing.
-- What this order may take is the stock nobody else is holding: its own
-- surviving holds count as its own. An abandoned or swept order has none.
create or replace function public.order_stock_shortfall(p_order_id uuid)
returns text
language sql
stable
security definer
set search_path = pg_catalog, public
as $fn$
  with needed as (
    select product_id, min(product_name) as product_name, sum(quantity) as quantity
      from order_items
     where order_id = p_order_id and product_id is not null
     group by product_id
  ),
  held as (
    select product_id, sum(quantity) as quantity
      from checkout_reservations
     where order_id = p_order_id
     group by product_id
  )
  select n.product_name
    from needed n
    left join products p on p.id = n.product_id
    left join held h on h.product_id = n.product_id
   where p.id is null
      or n.quantity > p.stock_count - greatest(0, p.reserved_count - coalesce(h.quantity, 0))
   order by n.product_id
   limit 1;
$fn$;

create or replace function public.confirm_order_paid(
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
  v_number  text;
  v_moved   uuid;
  v_channel text;
  v_short   text;
  res       record;
  item      record;
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
     and payment_status in ('pending', 'abandoned')
   returning id, order_number, channel into v_moved, v_number, v_channel;

  if v_moved is null then
    -- Already paid (a redelivery), or refunded/failed and so not eligible.
    -- Stripe does not guarantee event ordering, and a late "completed" must
    -- never resurrect a closed order.
    select order_number into v_number
      from orders where id = p_order_id and payment_status = 'paid';
    return v_number;
  end if;

  -- Lock this order's holds, then its products in id order, before reading
  -- what is available, so nothing moves between the check and the write.
  perform 1 from checkout_reservations where order_id = p_order_id for update;
  perform 1 from products
    where id in (select product_id from order_items where order_id = p_order_id)
    order by id
    for update;

  v_short := order_stock_shortfall(p_order_id);

  if v_short is not null then
    -- A counter or phone sale is made with the admin at the till: fail it
    -- outright, which rolls back the status change above, rather than record
    -- a sale that cannot be handed over.
    if v_channel <> 'web' then
      raise exception 'Not enough % in stock', v_short;
    end if;

    -- The customer has paid for something that is gone. Keep the payment
    -- and the number, take no stock, give back any holds, and say so.
    perform release_order_reservations(p_order_id);

    update orders
       set attention_reason    = format(
             'Paid, but %s was no longer in stock. No stock was taken. '
             'Refund the customer or source the item.', v_short),
           attention_raised_at = now()
     where id = p_order_id;

    return v_number;
  end if;

  -- Give back exactly the holds this order still has (see 012).
  for res in
    select product_id, sum(quantity)::int as quantity
      from checkout_reservations
     where order_id = p_order_id
     group by product_id
  loop
    update products
       set reserved_count = greatest(0, reserved_count - res.quantity)
     where id = res.product_id;
  end loop;

  delete from checkout_reservations where order_id = p_order_id;

  -- No greatest() here: the shortfall check has just proved the stock is
  -- there, and if it somehow is not, the stock_count >= 0 check should fail
  -- loudly rather than hide an oversell.
  for item in
    select product_id, sum(quantity)::int as quantity
      from order_items
     where order_id = p_order_id and product_id is not null
     group by product_id
  loop
    update products
       set stock_count = stock_count - item.quantity
     where id = item.product_id;

    insert into inventory_adjustments (product_id, adjustment, reason)
      values (item.product_id, -item.quantity, 'sale: ' || v_number);
  end loop;

  update orders set stock_taken_at = now() where id = p_order_id;

  return v_number;
end;
$fn$;

-- ─── 5. Cancel restocks only what was taken ─────────────────────
--
-- Same as 025 except the test: stock_taken_at rather than order_number,
-- because a flagged order has a number but took no stock.

create or replace function public.restock_cancelled_order()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  item record;
begin
  if new.fulfillment_status <> 'cancelled'
     or old.fulfillment_status = 'cancelled'
     or new.stock_taken_at is null then
    return null;
  end if;

  for item in
    select product_id, sum(quantity)::int as quantity
      from public.order_items
     where order_id = new.id and product_id is not null
     group by product_id
  loop
    perform public.adjust_stock(item.product_id, item.quantity,
                                'cancelled: ' || new.order_number);
  end loop;

  return null;
end;
$$;

-- ─── 6. Grants ──────────────────────────────────────────────────
--
-- Server tier only, as in 008. The replaced functions keep their ACLs, but
-- the new and recreated ones start executable by public, so all are set here.

do $grants$
declare
  fn text;
begin
  foreach fn in array array[
    'reserve_order_stock(uuid, jsonb, timestamptz)',
    'abandon_order(uuid)',
    'clear_stale_checkout_attempt(uuid)',
    'order_stock_shortfall(uuid)',
    'confirm_order_paid(uuid, text, text)'
  ] loop
    execute format(
      'revoke all on function public.%s from public, anon, authenticated', fn);
    execute format(
      'grant execute on function public.%s to service_role', fn);
  end loop;
end
$grants$;

revoke all on function public.restock_cancelled_order() from public, anon, authenticated;

notify pgrst, 'reload schema';
