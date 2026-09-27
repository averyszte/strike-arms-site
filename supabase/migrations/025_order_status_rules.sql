-- ═══════════════════════════════════════════════════════════════
-- 025: order status rules
--
-- Until now fulfillment_status took any value the check constraint allowed,
-- from any other. A delivery order could be marked "ready for pickup", a
-- cancelled order brought back to "shipped", and cancelling a paid order left
-- its stock sold even though the item never left the shop.
--
-- 1. A guard on fulfillment_status: the status must belong to the order's
--    fulfilment method, cancelled is final, and nothing can be cancelled
--    once goods have been handed over or posted.
-- 2. Cancelling an order whose stock was taken puts it back, through
--    adjust_stock, so the ledger records why the count went up.
-- 3. order_status_log.changed_by defaults to auth.uid(), so the log says
--    which admin changed the status. Webhook changes stay null.
-- 4. inventory_adjustments becomes insert-only. It is the stock ledger; a
--    ledger that can be edited is not evidence of anything.
-- 5. record_refund never lowers refund_cents. Stripe does not promise event
--    order, so a late event for an earlier, smaller refund must not
--    overwrite a later, larger one.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Transition guard ────────────────────────────────────────
--
-- The lanes per method are the same as BOARD_LANES in
-- src/lib/order-board.ts, and FULFILLMENT_TRANSITIONS in
-- src/lib/order-transitions.ts mirrors this function so the admin only
-- offers moves the database will accept. Change all three together.
--
-- Within a method any lane can move to any other, backwards included: a
-- mis-click has to be correctable without SQL. A counter sale can go from
-- pending straight to collected.
--
-- Cancelling is allowed only before anything has left the shop (pending,
-- ready_for_pickup, packed), because that is what makes putting the stock
-- back correct. Moving an order forward needs it to be paid.

create or replace function public.fulfillment_lanes(p_method text)
returns text[]
language sql
immutable
set search_path = ''
as $$
  select case p_method
    when 'pickup'   then array['pending', 'ready_for_pickup', 'collected']
    when 'delivery' then array['pending', 'packed', 'shipped', 'delivered']
    when 'mixed'    then array['pending', 'packed', 'ready_for_pickup', 'shipped',
                               'collected', 'delivered']
    else array[]::text[]
  end;
$$;

create or replace function public.guard_fulfillment_status()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_label text := coalesce(old.order_number, 'This order');
begin
  if new.fulfillment_status is not distinct from old.fulfillment_status then
    return new;
  end if;

  if old.fulfillment_status = 'cancelled' then
    raise exception '% is cancelled, and a cancelled order cannot be reopened', v_label
      using errcode = 'check_violation';
  end if;

  if new.fulfillment_status = 'cancelled' then
    if old.fulfillment_status not in ('pending', 'ready_for_pickup', 'packed') then
      raise exception '% has already been %, so it cannot be cancelled. Record a refund instead.',
        v_label, replace(old.fulfillment_status, '_', ' ')
        using errcode = 'check_violation';
    end if;
    return new;
  end if;

  if not (new.fulfillment_status = any (public.fulfillment_lanes(new.fulfillment_method))) then
    raise exception '% is a % order, so it cannot be marked %',
      v_label, new.fulfillment_method, replace(new.fulfillment_status, '_', ' ')
      using errcode = 'check_violation';
  end if;

  if new.fulfillment_status <> 'pending'
     and new.payment_status not in ('paid', 'partially_refunded') then
    raise exception '% is not paid, so it cannot be marked %',
      v_label, replace(new.fulfillment_status, '_', ' ')
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists orders_guard_fulfillment_status on public.orders;
create trigger orders_guard_fulfillment_status
  before update of fulfillment_status on public.orders
  for each row execute function public.guard_fulfillment_status();

-- ─── 2. Restock on cancel ───────────────────────────────────────
--
-- Stock is taken by confirm_order_paid, which is also where an order gets
-- its number, for web and counter orders alike. So an order with a number
-- had its stock taken, and one without (an abandoned web checkout) did not.
--
-- adjust_stock checks for an aal2 admin, and the orders update policy
-- already requires one, so a browser cancellation always passes. The
-- webhook never cancels; if a server path ever does, it fails loudly here
-- rather than cancelling without restocking.

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
     or new.order_number is null then
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

drop trigger if exists orders_restock_on_cancel on public.orders;
create trigger orders_restock_on_cancel
  after update of fulfillment_status on public.orders
  for each row execute function public.restock_cancelled_order();

-- fulfillment_lanes stays executable: the guard runs as the admin and calls it.
revoke all on function public.guard_fulfillment_status() from public, anon, authenticated;
revoke all on function public.restock_cancelled_order() from public, anon, authenticated;

-- ─── 3. Who changed the status ──────────────────────────────────

alter table public.order_status_log
  alter column changed_by set default auth.uid();

-- ─── 4. The stock ledger is insert-only ─────────────────────────
--
-- adjust_stock and confirm_order_paid write it as definers, so the browser
-- never needs to write it directly; it keeps SELECT for the history panel.
-- The FK cascade from products still works, because referential actions
-- run as the table owner.

drop policy if exists "admin manage inventory adjustments" on public.inventory_adjustments;
drop policy if exists "admin read inventory adjustments"   on public.inventory_adjustments;

create policy "admin read inventory adjustments"
  on public.inventory_adjustments for select
  to authenticated
  using ((select public.is_admin_aal2()));

revoke insert, update, delete, truncate on public.inventory_adjustments from anon, authenticated;

-- ─── 5. record_refund never lowers the refunded amount ──────────

create or replace function public.record_refund(
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
     set refund_cents   = greatest(refund_cents, p_refund_cents),
         refunded_at    = coalesce(refunded_at, now()),
         payment_status = case
           when p_fully_refunded or payment_status = 'refunded' then 'refunded'
           else 'partially_refunded'
         end
   where stripe_payment_intent = p_payment_intent_id
     and payment_status in ('paid', 'partially_refunded', 'refunded')
   returning id into v_moved;

  return v_moved is not null;
end;
$fn$;

revoke all on function public.record_refund(text, int, bool) from public, anon, authenticated;
grant execute on function public.record_refund(text, int, bool) to service_role;
