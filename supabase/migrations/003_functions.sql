-- Strike Arms: Database functions and triggers

-- ═══════════════════════════════════════════════════════════════
-- UPDATED_AT TRIGGER
-- ═══════════════════════════════════════════════════════════════

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on products
  for each row execute function set_updated_at();

create trigger orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- STOCK MANAGEMENT
-- All stock mutations go through these functions so that the
-- products.stock_count and the audit log stay in sync atomically.
-- ═══════════════════════════════════════════════════════════════

-- Adjust stock_count (positive = restock, negative = sale/deduction).
-- Writes an inventory_adjustments row for the audit trail.
create or replace function adjust_stock(
  p_product_id  uuid,
  p_adjustment  int,
  p_reason      text,
  p_adjusted_by uuid default null
)
returns void
language plpgsql
security definer
as $$
begin
  update products
    set stock_count = stock_count + p_adjustment
    where id = p_product_id;

  if not found then
    raise exception 'product % not found', p_product_id;
  end if;

  insert into inventory_adjustments (product_id, adjustment, reason, adjusted_by)
    values (p_product_id, p_adjustment, p_reason, p_adjusted_by);
end;
$$;

-- Reserve stock for an active checkout session.
-- Returns true on success, false if insufficient available stock.
-- "Available" = stock_count - reserved_count (the in_stock generated column).
create or replace function reserve_stock(
  p_product_id  uuid,
  p_quantity    int,
  p_session_key text,
  p_expires_at  timestamptz
)
returns bool
language plpgsql
security definer
as $$
declare
  available int;
begin
  select stock_count - reserved_count
    into available
    from products
    where id = p_product_id
    for update;

  if available is null then
    raise exception 'product % not found', p_product_id;
  end if;

  if available < p_quantity then
    return false;
  end if;

  update products
    set reserved_count = reserved_count + p_quantity
    where id = p_product_id;

  insert into checkout_reservations (product_id, quantity, session_key, expires_at)
    values (p_product_id, p_quantity, p_session_key, p_expires_at);

  return true;
end;
$$;

-- Release expired checkout reservations.
-- Called by a Supabase cron job every 5 minutes.
create or replace function release_expired_reservations()
returns void
language plpgsql
security definer
as $$
declare
  r checkout_reservations%rowtype;
begin
  for r in
    select * from checkout_reservations
    where expires_at < now()
    for update skip locked
  loop
    update products
      set reserved_count = greatest(0, reserved_count - r.quantity)
      where id = r.product_id;
    delete from checkout_reservations where id = r.id;
  end loop;
end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- ORDER STATUS AUDIT LOG TRIGGER
-- Automatically writes a row to order_status_log whenever
-- payment_status or fulfillment_status changes on an order.
-- ═══════════════════════════════════════════════════════════════

create or replace function log_order_status_change()
returns trigger language plpgsql as $$
begin
  if new.payment_status is distinct from old.payment_status then
    insert into order_status_log (order_id, field, from_status, to_status)
      values (new.id, 'payment_status', old.payment_status, new.payment_status);
  end if;

  if new.fulfillment_status is distinct from old.fulfillment_status then
    insert into order_status_log (order_id, field, from_status, to_status)
      values (new.id, 'fulfillment_status', old.fulfillment_status, new.fulfillment_status);
  end if;

  return new;
end;
$$;

create trigger orders_status_log
  after update on orders
  for each row execute function log_order_status_change();

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════

create index if not exists idx_products_category     on products (category);
create index if not exists idx_products_brand        on products (brand);
create index if not exists idx_products_is_published on products (is_published);
create index if not exists idx_orders_stripe_session on orders (stripe_session_id);
create index if not exists idx_orders_customer_email on orders (customer_email);
create index if not exists idx_orders_created_at     on orders (created_at desc);
create index if not exists idx_order_items_order_id  on order_items (order_id);
create index if not exists idx_inquiries_status      on inquiries (status);
create index if not exists idx_reservations_expires  on checkout_reservations (expires_at);
create index if not exists idx_notification_jobs_status on notification_jobs (status, next_attempt_at);
