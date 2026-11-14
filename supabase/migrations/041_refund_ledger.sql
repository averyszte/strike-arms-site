-- ═══════════════════════════════════════════════════════════════
-- 041: refund ledger, manual refunds and counter voids
--
-- Pre-launch audit, L3.
--
-- M-006  record_refund (025) only knows a running total, so refund-order
--        cannot write a refund straight after refunds.create without
--        risking a double count when it retries. Each refund is now a row
--        keyed by its Stripe refund id (re_...), so recording the same
--        refund twice changes nothing, and a refund that later fails at
--        Stripe is visible and flagged.
-- M-033  A mistaken counter sale could not be voided, and a cash refund
--        could not be recorded, so revenue stayed wrong. Two admin RPCs,
--        AAL2 and written to the same ledger with who did it and why.
--
-- orders.refund_cents stays the number everything else reads. It is never
-- lowered, matching 025: a refund that fails at Stripe is flagged for Alan
-- rather than silently taken back off the order.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Ledger ──────────────────────────────────────────────────

create table if not exists public.order_refunds (
  id           text        primary key,  -- Stripe refund id, or manual:<uuid>
  order_id     uuid        not null references public.orders (id) on delete cascade,
  amount_cents int         not null check (amount_cents > 0),
  status       text        not null check (status in ('pending', 'succeeded', 'failed', 'canceled')),
  source       text        not null check (source in ('stripe', 'manual', 'void')),
  note         text,
  created_by   uuid        references auth.users (id) on delete set null default auth.uid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.order_refunds is
  'One row per refund: Stripe refunds by refund id, cash refunds and counter voids by manual:<uuid> (041).';

create index if not exists order_refunds_order_idx on public.order_refunds (order_id, created_at);

alter table public.order_refunds enable row level security;

drop policy if exists "admin read order refunds" on public.order_refunds;
create policy "admin read order refunds"
  on public.order_refunds for select
  to authenticated
  using ((select public.is_admin_aal2()));

revoke all on public.order_refunds from public, anon, authenticated;
grant select on public.order_refunds to authenticated;
grant all on public.order_refunds to service_role;

-- What the ledger says has gone back to the customer outside Stripe's own
-- charge total: cash refunds and voids. Stripe's charge.amount_refunded
-- does not include them, so both Stripe paths add this on.
create or replace function public.manual_refunded_cents(p_order_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $fn$
  select coalesce(sum(amount_cents), 0)::int
    from public.order_refunds
   where order_id = p_order_id
     and source in ('manual', 'void')
     and status = 'succeeded';
$fn$;

-- ─── 2. Stripe refunds by id (M-006) ────────────────────────────
--
-- Called by refund-order straight after refunds.create, and by the webhook
-- for charge.refund.updated. Idempotent on p_refund_id. p_status is the
-- Stripe refund status. Returns false when no refundable order has that
-- payment intent.

create or replace function public.record_stripe_refund(
  p_payment_intent_id text,
  p_refund_id         text,
  p_amount_cents      int,
  p_status            text
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  v_order  orders%rowtype;
  v_total  int;
  v_status text := case p_status
                     when 'requires_action' then 'pending'
                     else p_status
                   end;
begin
  if p_refund_id is null or p_refund_id = '' then
    raise exception 'A refund id is required';
  end if;
  if v_status not in ('pending', 'succeeded', 'failed', 'canceled') then
    raise exception 'Unknown refund status %', p_status;
  end if;

  select * into v_order
    from orders
   where stripe_payment_intent = p_payment_intent_id
     and payment_status in ('paid', 'partially_refunded', 'refunded')
     for update;
  if not found then
    return false;
  end if;

  insert into order_refunds (id, order_id, amount_cents, status, source, created_by)
  values (p_refund_id, v_order.id, p_amount_cents, v_status, 'stripe', null)
  on conflict (id) do update
     set status = excluded.status, updated_at = now();

  if v_status in ('failed', 'canceled') then
    perform flag_order(v_order.id,
      'A Stripe refund (' || p_refund_id || ') did not go through. The refund shown may be more than the customer got back.');
    return true;
  end if;

  select coalesce(sum(amount_cents), 0)::int + manual_refunded_cents(v_order.id)
    into v_total
    from order_refunds
   where order_id = v_order.id and source = 'stripe'
     and status in ('pending', 'succeeded');

  update orders
     set refund_cents   = greatest(refund_cents, v_total),
         refunded_at    = coalesce(refunded_at, now()),
         payment_status = case
           when greatest(refund_cents, v_total) >= total_cents then 'refunded'
           else 'partially_refunded'
         end
   where id = v_order.id
     and v_total > refund_cents;

  return true;
end;
$fn$;

-- As 025, except that cash refunds recorded against the same order are
-- added to Stripe's running total rather than hidden by greatest().
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
     set refund_cents   = greatest(refund_cents, p_refund_cents + manual_refunded_cents(id)),
         refunded_at    = coalesce(refunded_at, now()),
         payment_status = case
           when p_fully_refunded or payment_status = 'refunded'
             or p_refund_cents + manual_refunded_cents(id) >= total_cents then 'refunded'
           else 'partially_refunded'
         end
   where stripe_payment_intent = p_payment_intent_id
     and payment_status in ('paid', 'partially_refunded', 'refunded')
   returning id into v_moved;

  return v_moved is not null;
end;
$fn$;

-- ─── 3. Manual refund (M-033) ───────────────────────────────────
--
-- Money given back outside Stripe: cash at the counter, or a goodwill
-- refund. Adds to refund_cents. The note is required, because the ledger
-- is the only record of why. A counter order sends no refund email (042).

create or replace function public.record_manual_refund(
  p_order_id     uuid,
  p_amount_cents int,
  p_note         text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  v_order orders%rowtype;
  v_new   int;
begin
  if not is_admin_aal2() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  if p_amount_cents is null or p_amount_cents < 1 then
    raise exception 'The refund must be at least 1 cent';
  end if;
  if p_note is null or length(trim(p_note)) = 0 then
    raise exception 'Say why the refund was given';
  end if;

  select * into v_order from orders where id = p_order_id for update;
  if not found then
    raise exception 'No order with that id';
  end if;
  if v_order.payment_status not in ('paid', 'partially_refunded') then
    raise exception '% is %, so a refund cannot be recorded',
      coalesce(v_order.order_number, 'This order'), replace(v_order.payment_status, '_', ' ');
  end if;
  if v_order.refund_cents + p_amount_cents > v_order.total_cents then
    raise exception 'That is more than is left to refund (% cents)',
      v_order.total_cents - v_order.refund_cents;
  end if;

  insert into order_refunds (id, order_id, amount_cents, status, source, note)
  values ('manual:' || gen_random_uuid(), v_order.id, p_amount_cents, 'succeeded', 'manual',
          left(trim(p_note), 500));

  v_new := v_order.refund_cents + p_amount_cents;

  update orders
     set refund_cents   = v_new,
         refunded_at    = coalesce(refunded_at, now()),
         payment_status = case when v_new >= total_cents then 'refunded' else 'partially_refunded' end
   where id = v_order.id;

  return jsonb_build_object(
    'order_id',       v_order.id,
    'refund_cents',   v_new,
    'payment_status', case when v_new >= v_order.total_cents then 'refunded' else 'partially_refunded' end
  );
end;
$fn$;

-- ─── 4. Void a counter sale (M-033) ─────────────────────────────
--
-- Undoes a counter sale rung up by mistake, on the day it was made (Irish
-- time). The full amount is refunded and, where 025 still allows it, the
-- order is cancelled. A sale already marked collected keeps that status:
-- 025 refuses to cancel it, and the refund is what corrects the revenue.

create or replace function public.void_counter_order(
  p_order_id uuid,
  p_reason   text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  v_order     orders%rowtype;
  v_cancel    bool;
  v_remaining int;
begin
  if not is_admin_aal2() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'Say why the sale is being voided';
  end if;

  select * into v_order from orders where id = p_order_id for update;
  if not found then
    raise exception 'No order with that id';
  end if;
  if v_order.channel <> 'counter' then
    raise exception 'Only a counter sale can be voided. Refund a web order instead.';
  end if;
  if v_order.payment_status not in ('paid', 'partially_refunded') then
    raise exception '% is %, so it cannot be voided',
      coalesce(v_order.order_number, 'This sale'), replace(v_order.payment_status, '_', ' ');
  end if;
  if (v_order.created_at at time zone 'Europe/Dublin')::date
     <> (now() at time zone 'Europe/Dublin')::date then
    raise exception 'A sale can only be voided on the day it was made. Record a refund instead.';
  end if;

  v_remaining := v_order.total_cents - v_order.refund_cents;
  v_cancel := v_order.fulfillment_status in ('pending', 'ready_for_pickup', 'packed');

  if v_remaining > 0 then
    insert into order_refunds (id, order_id, amount_cents, status, source, note)
    values ('manual:' || gen_random_uuid(), v_order.id, v_remaining, 'succeeded', 'void',
            left(trim(p_reason), 500));
  end if;

  update orders
     set refund_cents       = total_cents,
         refunded_at        = coalesce(refunded_at, now()),
         payment_status     = 'refunded',
         fulfillment_status = case when v_cancel then 'cancelled' else fulfillment_status end,
         notes              = concat_ws(E'\n', notes, 'Voided: ' || left(trim(p_reason), 500))
   where id = v_order.id;

  return jsonb_build_object(
    'order_id',       v_order.id,
    'order_number',   v_order.order_number,
    'refunded_cents', v_remaining,
    'cancelled',      v_cancel
  );
end;
$fn$;

-- ─── 5. Grants ──────────────────────────────────────────────────

do $grants$
declare
  fn text;
begin
  foreach fn in array array[
    'manual_refunded_cents(uuid)',
    'record_stripe_refund(text, text, int, text)',
    'record_refund(text, int, bool)'
  ] loop
    execute format(
      'revoke all on function public.%s from public, anon, authenticated', fn);
    execute format(
      'grant execute on function public.%s to service_role', fn);
  end loop;
end
$grants$;

revoke all on function public.record_manual_refund(uuid, int, text) from public, anon;
grant execute on function public.record_manual_refund(uuid, int, text) to authenticated;
revoke all on function public.void_counter_order(uuid, text) from public, anon;
grant execute on function public.void_counter_order(uuid, text) to authenticated;

notify pgrst, 'reload schema';
