-- ═══════════════════════════════════════════════════════════════
-- 044: counter sale guards
--
-- Pre-launch audit, L3, M-022. create_counter_order (038) sold archived
-- products and took any quantity, so a slip of the keypad (500 for 5)
-- became a paid order. As 038, with three changes:
--
--   - an archived product is refused;
--   - each line is capped at 50;
--   - a product marked out of stock is still sold (D1: stock is the admin's
--     tick, and they are holding the item), but its name comes back in
--     out_of_stock so the admin sees the warning.
--
-- Return shape: { order_id, order_number, total_cents, out_of_stock: text[] }.
-- total_cents is new too, so the toast can show the server's total rather
-- than the draft's (the L4 half of M-022). The first two keys are unchanged.
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
  v_out_of_stock      text[] := '{}';
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
    if v_qty > 50 then
      raise exception 'A line can be for at most 50. Split a bigger sale into more lines.';
    end if;

    select * into v_product
      from products where id = (v_line ->> 'product_id')::uuid;
    if not found then
      raise exception 'Product % is not in the catalogue', v_line ->> 'product_id';
    end if;
    if v_product.is_archived then
      raise exception '% is archived. Restore it before selling it.', v_product.name;
    end if;
    if not v_product.in_stock then
      v_out_of_stock := array_append(v_out_of_stock, v_product.name);
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

  return jsonb_build_object(
    'order_id',     v_order_id,
    'order_number', v_number,
    'total_cents',  v_total_cents,
    'out_of_stock', to_jsonb(v_out_of_stock)
  );
end;
$fn$;

revoke all on function public.create_counter_order(
  jsonb, text, text, text, text, text, text, bool, text, text, text, text, text
) from public, anon;

grant execute on function public.create_counter_order(
  jsonb, text, text, text, text, text, text, bool, text, text, text, text, text
) to authenticated;

notify pgrst, 'reload schema';
