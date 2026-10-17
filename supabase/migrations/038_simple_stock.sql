-- ═══════════════════════════════════════════════════════════════
-- 038: simple stock
--
-- The shop does not count stock. A product is either in stock or out of
-- stock, and Alan sets which by hand. A sale changes nothing: the product
-- stays in stock until he says otherwise.
--
-- Removed:
--   - products.stock_count, reserved_count, low_stock_threshold and the
--     sellable_count derived from them (026);
--   - checkout_reservations and the five-minute sweep that released them
--     (012), inventory_adjustments (the stock ledger), adjust_stock,
--     reserve_stock, order_stock_shortfall;
--   - the cancel-restock trigger (025, 028), the low-stock email (031) and
--     orders.stock_taken_at (028).
--
-- products.in_stock stops being generated and becomes an ordinary column the
-- admin writes. Its current values are kept.
--
-- Nothing about payment, fulfilment or delivery changes. The functions the
-- Edge Functions call keep their signatures, so this can be applied before
-- they are redeployed:
--   - reserve_order_stock now only checks that every product is in stock;
--   - release_order_reservations is kept as a no-op for abandon_order and
--     expire_order;
--   - confirm_order_paid numbers and marks the order paid, and no longer
--     takes stock or flags a shortfall.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Triggers that move or watch stock ───────────────────────

drop trigger if exists orders_restock_on_cancel on public.orders;
drop function if exists public.restock_cancelled_order();

drop trigger if exists products_queue_low_stock on public.products;
drop function if exists public.queue_low_stock_notification();

-- Unsent low-stock emails would only report counts that no longer exist.
-- Sent ones stay as history, so the event type stays allowed.
delete from public.notification_jobs
 where event_type = 'owner.low_stock' and status <> 'sent';

-- ─── 2. The reservation sweep ───────────────────────────────────
--
-- Through cron.unschedule() for the reason given in 012.

do $cron$
begin
  perform cron.unschedule('release-expired-reservations');
exception
  when others then null;  -- already gone
end
$cron$;

drop function if exists public.release_expired_reservations();

-- ─── 3. Functions that read the counts ──────────────────────────

drop function if exists public.adjust_stock(uuid, int, text);
drop function if exists public.reserve_stock(uuid, int, text, timestamptz);
drop function if exists public.order_stock_shortfall(uuid);

-- abandon_order (028) and expire_order (029) call this. There is nothing
-- left to give back.
create or replace function public.release_order_reservations(p_order_id uuid)
returns void
language sql
security definer
set search_path = pg_catalog, public
as $fn$
  select;
$fn$;

-- create-checkout-session calls this before opening a Stripe session and
-- refuses the basket if a product comes back. Same contract as 028: the
-- first product that cannot be sold, or null. Nothing is held.
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
  line record;
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

    if not exists (
      select 1 from products where id = line.product_id and in_stock
    ) then
      return line.product_id;
    end if;
  end loop;

  return null;
end;
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
  v_number text;
  v_moved  uuid;
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
   returning id, order_number into v_moved, v_number;

  if v_moved is null then
    -- Already paid (a redelivery), or refunded/failed and so not eligible.
    -- Stripe does not guarantee event ordering, and a late "completed" must
    -- never resurrect a closed order.
    select order_number into v_number
      from orders where id = p_order_id and payment_status = 'paid';
  end if;

  return v_number;
end;
$fn$;

-- The counter sale, as in 013 without the stock check: the admin is holding
-- the item while they ring it up.
create or replace function public.create_counter_order(
  p_lines            jsonb,
  p_customer_name    text,
  p_customer_email   text default null,
  p_customer_phone   text default null,
  p_payment_method   text default 'cash',
  p_channel          text default 'counter',
  p_notes            text default null,
  p_age_verified     bool default false,
  p_shipping_line1   text default null,
  p_shipping_line2   text default null,
  p_shipping_city    text default null,
  p_shipping_county  text default null,
  p_shipping_eircode text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  v_rates    store_settings%rowtype;
  v_product  products%rowtype;
  v_line     jsonb;
  v_order_id uuid;
  v_number   text;
  v_qty      int;
  v_method   text;
  v_unit     int;

  v_items_cents       int  := 0;
  v_deliverable_cents int  := 0;
  v_has_pickup        bool := false;
  v_has_delivery      bool := false;
  v_shipping_cents    int  := 0;
  v_total_cents       int;
  v_fulfilment        text;
begin
  -- AAL2, matching every other admin write in this schema. Taking money is not
  -- something a half-authenticated session gets to do.
  if not is_admin_aal2() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;

  if p_lines is null or jsonb_array_length(p_lines) = 0 then
    raise exception 'A counter order needs at least one line';
  end if;

  select * into v_rates from store_settings where id = 1;
  if not found then
    raise exception 'store_settings row is missing; rates are not configured';
  end if;

  -- Created as pending and pickup so the row is valid before the lines are
  -- known. The real fulfilment method and totals are set once they are, and
  -- the address constraint is evaluated then.
  insert into orders (
    customer_name, customer_email, customer_phone,
    payment_status, fulfillment_method, fulfillment_status,
    total_cents, vat_cents, shipping_cents,
    channel, payment_method, notes, age_verified, order_number,
    shipping_name, shipping_line1, shipping_line2, shipping_city, shipping_county,
    shipping_eircode
  )
  values (
    p_customer_name, p_customer_email, p_customer_phone,
    'pending', 'pickup', 'pending',
    0, 0, 0,
    p_channel, p_payment_method, p_notes, p_age_verified, null,
    -- The counter form asks for one name, so it is both the customer and the
    -- addressee. Left null on a collection so the admin's address block stays
    -- absent rather than becoming a record of empty strings.
    case when p_shipping_line1 is not null then p_customer_name end,
    p_shipping_line1, p_shipping_line2, p_shipping_city, p_shipping_county,
    p_shipping_eircode
  )
  returning id into v_order_id;

  for v_line in select * from jsonb_array_elements(p_lines) loop
    v_qty := (v_line ->> 'quantity')::int;
    if v_qty is null or v_qty < 1 then
      raise exception 'Every line needs a quantity of at least 1';
    end if;

    select * into v_product
      from products where id = (v_line ->> 'product_id')::uuid;
    if not found then
      raise exception 'Product % is not in the catalogue', v_line ->> 'product_id';
    end if;

    -- Unpublished is allowed here, unlike the web path. Stock that is in the
    -- shop but not yet on the website is a real counter sale, and the admin is
    -- holding the item while they ring it up.
    v_method := coalesce(v_line ->> 'fulfillment_method', 'pickup');
    if v_method not in ('pickup', 'delivery') then
      raise exception 'Unknown fulfilment method %', v_method;
    end if;
    if v_method = 'delivery' and not v_product.is_shippable then
      raise exception '% cannot be posted', v_product.name;
    end if;

    -- Same rule as pricedLine() in order-lines.ts.
    v_unit := case
      when v_product.sale_price_cents is not null
       and v_product.sale_price_cents < v_product.price_cents
      then v_product.sale_price_cents
      else v_product.price_cents
    end;

    insert into order_items (
      order_id, product_id, product_slug, product_name, product_image,
      brand, unit_price_cents, quantity, fulfillment_method
    )
    values (
      v_order_id, v_product.id, v_product.slug, v_product.name,
      v_product.images[1], v_product.brand, v_unit, v_qty, v_method
    );

    v_items_cents := v_items_cents + (v_unit * v_qty);
    if v_method = 'delivery' then
      v_has_delivery := true;
      v_deliverable_cents := v_deliverable_cents + (v_unit * v_qty);
    else
      v_has_pickup := true;
    end if;
  end loop;

  -- calculateShippingCents: charged once, on the shippable lines only, so a
  -- collect-only rifle in the same sale cannot push it over the free threshold.
  if v_has_delivery and v_deliverable_cents > 0
     and v_deliverable_cents < v_rates.free_shipping_threshold_cents then
    v_shipping_cents := v_rates.shipping_flat_cents;
  end if;

  v_total_cents := v_items_cents + v_shipping_cents;

  v_fulfilment := case
    when v_has_pickup and v_has_delivery then 'mixed'
    when v_has_delivery                  then 'delivery'
    else 'pickup'
  end;

  update orders
     set fulfillment_method = v_fulfilment,
         shipping_cents     = v_shipping_cents,
         total_cents        = v_total_cents,
         -- vatIncludedCents: prices are displayed gross, as Irish consumers
         -- expect, so this extracts the VAT contained in the total rather than
         -- adding to it. round() here and Math.round() there agree because
         -- both arguments are positive.
         vat_cents          = round(
           (v_total_cents::numeric * v_rates.vat_rate_basis_points)
           / (10000 + v_rates.vat_rate_basis_points)
         )
   where id = v_order_id;

  -- Reused rather than reimplemented: it draws the order number from the same
  -- sequence as the web path and marks the order paid. Both Stripe arguments
  -- are null because there is no Stripe.
  -- Counter and web orders therefore share one numbering sequence.
  v_number := confirm_order_paid(v_order_id, null, null);

  return jsonb_build_object('order_id', v_order_id, 'order_number', v_number);
end;
$fn$;

-- ─── 4. Tables and columns ──────────────────────────────────────

drop table if exists public.checkout_reservations;
drop table if exists public.inventory_adjustments;

alter table public.orders drop column if exists stock_taken_at;

-- sellable_count is generated from the counts, so it goes first. in_stock
-- keeps the value it was last generated with.
alter table public.products drop column if exists sellable_count;
alter table public.products alter column in_stock drop expression;
alter table public.products
  alter column in_stock set default true,
  alter column in_stock set not null;

alter table public.products
  drop column if exists stock_count,
  drop column if exists reserved_count,
  drop column if exists low_stock_threshold;

comment on column public.products.in_stock is
  'Set by the admin. Sales do not change it.';

-- ─── 5. Grants ──────────────────────────────────────────────────
--
-- Replaced functions keep their ACLs; these restate them (008, 013, 028).

do $grants$
declare
  fn text;
begin
  foreach fn in array array[
    'reserve_order_stock(uuid, jsonb, timestamptz)',
    'release_order_reservations(uuid)',
    'confirm_order_paid(uuid, text, text)'
  ] loop
    execute format(
      'revoke all on function public.%s from public, anon, authenticated', fn);
    execute format(
      'grant execute on function public.%s to service_role', fn);
  end loop;
end
$grants$;

revoke all on function public.create_counter_order(
  jsonb, text, text, text, text, text, text, bool, text, text, text, text, text
) from public, anon;

grant execute on function public.create_counter_order(
  jsonb, text, text, text, text, text, text, bool, text, text, text, text, text
) to authenticated;

notify pgrst, 'reload schema';
