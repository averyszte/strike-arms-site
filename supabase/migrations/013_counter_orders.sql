-- Strike Arms: counter and phone orders (D5.3)
--
-- Alan sells over the counter, and Phil confirmed those sales may still need
-- delivering — so a counter order takes the same fulfilment split as a web
-- order rather than being a simpler "sold, done" record.
--
-- The inventory listed four gaps (D5.3a-d). Building it turned up a fifth that
-- nothing had recorded: there is no admin INSERT policy on orders or
-- order_items. Only the Stripe webhook creates orders today, using the service
-- role, so the admin browser cannot create one at all. That is handled at the
-- bottom, and deliberately not by adding insert policies — see the note there.

-- ═══════════════════════════════════════════════════════════════
-- D5.3a: customer_email nullable
--
-- A cash walk-in who gives no email cannot be recorded today. A synthetic
-- placeholder address is the wrong fix: it pollutes the customer list (D7) and
-- breaks order lookup by email. Nullable is the honest representation of "we
-- do not know".
--
-- Anything being delivered still needs contactable details, so the constraint
-- keeps email mandatory the moment the order stops being a pure collection.
-- 'mixed' contains delivery lines, so only 'pickup' is exempt.
-- ═══════════════════════════════════════════════════════════════

alter table orders alter column customer_email drop not null;

alter table orders drop constraint if exists orders_customer_email_present;
alter table orders add constraint orders_customer_email_present check (
  fulfillment_method = 'pickup' or customer_email is not null
);

-- ═══════════════════════════════════════════════════════════════
-- D5.3b/c: where the sale came from, and how it was paid
--
-- Without channel, "what did the website make" versus "what did the shop make"
-- is unanswerable and D2's figures silently blend the two — the same class of
-- error as the florist counting archived orders out of revenue.
--
-- Both default to the web/Stripe values because every row that exists today
-- came in that way, so the backfill is the default and there are no nulls for
-- reporting to trip over.
-- ═══════════════════════════════════════════════════════════════

alter table orders
  add column if not exists channel text not null default 'web'
    check (channel in ('web', 'counter', 'phone')),
  add column if not exists payment_method text not null default 'stripe'
    check (payment_method in ('stripe', 'cash', 'card_terminal', 'bank_transfer'));

comment on column orders.channel is
  'Where the sale originated. D2 revenue must be able to separate web from counter.';
comment on column orders.payment_method is
  'How Alan was actually paid, for reconciling against the till at close of day.';

create index if not exists orders_channel_idx on orders (channel);

-- ═══════════════════════════════════════════════════════════════
-- D5.3d: creating the order
--
-- The inventory called for a wrapper around confirm_order_paid. Creation and
-- confirmation are one function instead, for two reasons:
--
--   - Splitting them means the browser makes two calls, and a browser that
--     dies between them leaves an order that exists, holds no stock, has no
--     order number and will never be paid. One function is one transaction.
--   - Creation is the half that has no route at all. Rather than open INSERT
--     policies on orders and order_items — which would let any AAL2 admin
--     session write arbitrary totals, prices and VAT straight through
--     PostgREST — the only way in is this function, which prices every line
--     from the catalogue itself.
--
-- Nothing the client sends decides money. The caller names products and
-- quantities; unit price, shipping, VAT and the order total are all computed
-- here from the products table and store_settings, using the same arithmetic
-- as the web path in _shared/shipping.ts. A counter sale and a web sale of the
-- same basket must produce the same numbers or the books disagree.
-- ═══════════════════════════════════════════════════════════════

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

    -- Locked for the same reason reserve_order_stock locks: two tills, or a
    -- till and a web checkout, must not both sell the last one.
    select * into v_product
      from products where id = (v_line ->> 'product_id')::uuid for update;
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

    -- Against available, not stock: a web checkout holding the last one has
    -- already promised it to somebody.
    if v_product.stock_count - v_product.reserved_count < v_qty then
      raise exception 'Not enough % in stock (% available)',
        v_product.name, v_product.stock_count - v_product.reserved_count;
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
  -- sequence as the web path, deducts stock, and writes the inventory
  -- adjustment. Both Stripe arguments are null because there is no Stripe.
  -- Counter and web orders therefore share one numbering sequence.
  v_number := confirm_order_paid(v_order_id, null, null);

  return jsonb_build_object('order_id', v_order_id, 'order_number', v_number);
end;
$fn$;

-- ═══════════════════════════════════════════════════════════════
-- GRANTS
-- Admins are 'authenticated', not service_role, so this one is granted there
-- and the AAL2 check inside the function is what actually gates it. anon is
-- never granted, and the revoke is required because a SECURITY DEFINER
-- function is executable by public by default.
-- ═══════════════════════════════════════════════════════════════

revoke all on function public.create_counter_order(
  jsonb, text, text, text, text, text, text, bool, text, text, text, text, text
) from public, anon;

grant execute on function public.create_counter_order(
  jsonb, text, text, text, text, text, text, bool, text, text, text, text, text
) to authenticated;

notify pgrst, 'reload schema';
