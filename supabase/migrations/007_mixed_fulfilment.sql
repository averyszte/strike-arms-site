-- Strike Arms: mixed fulfilment + Stripe checkout hardening
--
-- Two things happen here.
--
-- (1) MIXED FULFILMENT. Alan ships gear, parts and BBs but guns are
--     collect-in-store only, so "which items may leave the shop" is a property
--     of the product, and an order can legitimately be half-posted and
--     half-collected. Before this migration the schema was click-and-collect
--     only and a checkout built on it would have lied to the customer.
--
-- (2) STRIPE HARDENING. Three defects that are free to fix now because no real
--     order exists yet, and expensive to fix later:
--       - order_number was stamped by an INSERT-time DEFAULT, so every
--         abandoned or declined checkout burned a number. It is now assigned at
--         payment success by confirm_order_paid() (see 008).
--       - stripe_event_log had no event type and no claim/release protocol, so
--         a handler that threw after logging would have its Stripe retry
--         deduplicated and silently dropped.
--       - a retried checkout left orphan pending orders holding stock.

-- ═══════════════════════════════════════════════════════════════
-- PRODUCTS — per-product shippability
-- ═══════════════════════════════════════════════════════════════

-- Defaults to FALSE deliberately: an unclassified product is collect-only.
-- The failure mode of the wrong default is "customer must collect a pair of
-- goggles", not "a rifle was posted to someone who never showed ID".
alter table products
  add column if not exists is_shippable  bool not null default false,
  add column if not exists ship_weight_g int  not null default 0
    check (ship_weight_g >= 0);

comment on column products.is_shippable is
  'False = collect in store only (guns / RIFs). True = may be posted.';

-- ═══════════════════════════════════════════════════════════════
-- ORDERS — fulfilment method, shipping address, checkout attempt
-- ═══════════════════════════════════════════════════════════════

alter table orders
  add column if not exists fulfillment_method text not null default 'pickup'
    check (fulfillment_method in ('pickup', 'delivery', 'mixed')),
  add column if not exists shipping_cents     int  not null default 0
    check (shipping_cents >= 0),
  add column if not exists shipping_name      text,
  add column if not exists shipping_line1     text,
  add column if not exists shipping_line2     text,
  add column if not exists shipping_city      text,
  add column if not exists shipping_county    text,
  add column if not exists shipping_eircode   text,
  add column if not exists checkout_attempt_id uuid,
  add column if not exists refunded_at        timestamptz,
  add column if not exists paid_at            timestamptz;

-- A delivery or mixed order must carry somewhere to deliver to. Enforced here
-- rather than in the edge function so it cannot be bypassed by a future writer.
alter table orders drop constraint if exists orders_shipping_address_present;
alter table orders add constraint orders_shipping_address_present check (
  fulfillment_method = 'pickup'
  or (shipping_line1 is not null and shipping_city is not null
      and shipping_eircode is not null)
);

-- Shipping is only ever charged when something is actually being shipped.
alter table orders drop constraint if exists orders_shipping_cents_pickup_zero;
alter table orders add constraint orders_shipping_cents_pickup_zero check (
  fulfillment_method <> 'pickup' or shipping_cents = 0
);

-- Fulfilment states now cover the postal path as well as collection.
-- Mixed orders share one order-level status; per-item states are deliberately
-- not modelled — order_items.fulfillment_method already tells staff which
-- lines are handed over and which are posted.
alter table orders drop constraint if exists orders_fulfillment_status_check;
alter table orders add constraint orders_fulfillment_status_check check (
  fulfillment_status in (
    'pending', 'ready_for_pickup', 'collected',
    'packed', 'shipped', 'delivered', 'cancelled'
  )
);

-- Order numbers are drawn at payment success, not at insert. Nullable so an
-- in-flight pending order can exist without one; still UNIQUE, and Postgres
-- allows many NULLs under a unique constraint.
alter table orders alter column order_number drop default;
alter table orders alter column order_number drop not null;

-- ═══════════════════════════════════════════════════════════════
-- ORDER ITEMS — which lines ship and which are collected
-- ═══════════════════════════════════════════════════════════════

alter table order_items
  add column if not exists fulfillment_method text not null default 'pickup'
    check (fulfillment_method in ('pickup', 'delivery'));

-- ═══════════════════════════════════════════════════════════════
-- CHECKOUT RESERVATIONS — tie held stock to the order that holds it
-- ═══════════════════════════════════════════════════════════════

-- Without this the only link was a free-text session_key, so nothing could
-- release exactly the stock belonging to one order.
alter table checkout_reservations
  add column if not exists order_id uuid references orders(id) on delete cascade;

-- ═══════════════════════════════════════════════════════════════
-- STRIPE EVENT LOG — event type, for operator visibility
-- ═══════════════════════════════════════════════════════════════

alter table stripe_event_log
  add column if not exists type text not null default 'unknown';

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════

create index if not exists idx_orders_payment_intent
  on orders (stripe_payment_intent);

-- Partial: only pending orders are ever looked up by attempt id (to clear a
-- previous attempt's stock hold on retry).
create index if not exists idx_orders_checkout_attempt
  on orders (checkout_attempt_id)
  where payment_status = 'pending';

create index if not exists idx_reservations_order_id
  on checkout_reservations (order_id);

create index if not exists idx_products_is_shippable
  on products (is_shippable);
