-- ═══════════════════════════════════════════════════════════════
-- 029: webhook alerts
--
-- Completion plan item 14. The webhook had three ways to lose a problem:
--
-- 1. A paid session with no order returned 200 and logged a line nobody
--    reads. After 028 our own sessions always find their order, so what is
--    left is money Stripe took for something this site did not sell (a
--    payment link, another integration on the account). It is now recorded
--    in payment_alerts and shown on the dashboard until it is refunded or
--    marked handled.
-- 2. An amount or currency mismatch threw, so Stripe retried for three days
--    and the order stayed pending. The webhook now confirms the order (the
--    money was taken) and flags it with flag_order, which the 028 attention
--    display already shows.
-- 3. expire_order set 'failed', so every shopper who walked away from a
--    Stripe page raised the critical "failed payments" alert. It now sets
--    'expired', and the rows it had marked are moved across.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Expired is not failed ───────────────────────────────────

create or replace function public.expire_order(p_order_id uuid)
returns bool
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  v_moved uuid;
begin
  update orders set payment_status = 'expired'
    where id = p_order_id and payment_status = 'pending'
    returning id into v_moved;

  if v_moved is null then
    return false;
  end if;

  perform release_order_reservations(p_order_id);
  return true;
end;
$fn$;

-- expire_order was the only writer of 'failed', so every such row is an
-- expired session.
update public.orders set payment_status = 'expired' where payment_status = 'failed';

-- ─── 2. Flag an order ───────────────────────────────────────────
--
-- Appends rather than replaces: an order short of stock (028) can also have
-- been charged the wrong amount, and both need saying. A reason already
-- present is not added twice, so a retried webhook is a no-op.

create or replace function public.flag_order(p_order_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
begin
  update orders
     set attention_reason    = concat_ws(' ', attention_reason, p_reason),
         attention_raised_at = coalesce(attention_raised_at, now())
   where id = p_order_id
     and strpos(coalesce(attention_reason, ''), p_reason) = 0;
end;
$fn$;

-- ─── 3. Payments with no order ──────────────────────────────────

create table if not exists public.payment_alerts (
  id                    uuid        primary key default gen_random_uuid(),
  kind                  text        not null check (kind in ('no_order')),
  stripe_event_id       text        not null unique,
  stripe_session_id     text,
  stripe_payment_intent text,
  amount_cents          int,
  currency              text,
  customer_email        text,
  detail                text        not null,
  created_at            timestamptz not null default now(),
  resolved_at           timestamptz
);

comment on table public.payment_alerts is
  'Money Stripe reported that no order accounts for. Written by the stripe-webhook function; open until refunded or marked handled.';

create index if not exists payment_alerts_open_idx
  on public.payment_alerts (created_at desc) where resolved_at is null;

create index if not exists payment_alerts_payment_intent_idx
  on public.payment_alerts (stripe_payment_intent);

alter table public.payment_alerts enable row level security;

create policy "admin read payment alerts"
  on public.payment_alerts for select
  to authenticated
  using ((select public.is_admin_aal2()));

create policy "admin resolve payment alerts"
  on public.payment_alerts for update
  to authenticated
  using ((select public.is_admin_aal2()))
  with check ((select public.is_admin_aal2()));

revoke all on public.payment_alerts from anon, authenticated;
grant select on public.payment_alerts to authenticated;
grant update (resolved_at) on public.payment_alerts to authenticated;

-- A refund issued in Stripe for a payment with no order is how that alert
-- normally gets settled, so the refund webhook closes it.
create or replace function public.resolve_payment_alert(p_payment_intent_id text)
returns bool
language sql
security definer
set search_path = pg_catalog, public
as $fn$
  with closed as (
    update payment_alerts set resolved_at = now()
     where stripe_payment_intent = p_payment_intent_id and resolved_at is null
    returning id
  )
  select exists (select 1 from closed);
$fn$;

-- ─── 4. Grants ──────────────────────────────────────────────────

do $grants$
declare
  fn text;
begin
  foreach fn in array array[
    'expire_order(uuid)',
    'flag_order(uuid, text)',
    'resolve_payment_alert(text)'
  ] loop
    execute format(
      'revoke all on function public.%s from public, anon, authenticated', fn);
    execute format(
      'grant execute on function public.%s to service_role', fn);
  end loop;
end
$grants$;

notify pgrst, 'reload schema';
