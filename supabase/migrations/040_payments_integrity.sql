-- ═══════════════════════════════════════════════════════════════
-- 040: payments integrity
--
-- Pre-launch audit, L3. Four fixes to the paths money takes:
--
-- M-015  Order numbers past 9999. lpad(n, 4) truncates: order 10000 would
--        be numbered SA-YYYY-1000, collide with the real 1000 and fail the
--        unique constraint, so a paid customer's confirmation would 500.
--        Numbers are now padded to at least four digits and never cut.
--        Existing numbers are not touched.
-- M-002  The Stripe event claim was a bare insert. A handler that died
--        after claiming (a timeout, an isolate kill) left the event claimed
--        for ever and the retry was dismissed as a duplicate. A claim now
--        has a status and a time: a failed event, or one stuck processing
--        for more than two minutes, can be claimed again.
-- M-003  Paid after abandon. A shopper who starts a second checkout and
--        then pays the first session moves an 'abandoned' order to paid.
--        That is allowed (the money arrived), but it may be a second charge
--        for the same basket, so the order is now flagged for Alan in the
--        same transaction.
-- M-008  A web order whose Stripe session was never created stays pending
--        for ever. A daily job abandons them after 24 hours and records
--        what it did, for the health check (048).
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Order numbers (M-015) ───────────────────────────────────

create or replace function public.next_order_number()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $fn$
declare
  v_seq text := nextval('public.order_number_seq')::text;
begin
  -- greatest() keeps the four-digit look for the first 9999 orders and
  -- lets the number grow after that instead of truncating it.
  return 'SA-' || to_char(now(), 'YYYY') || '-' ||
         lpad(v_seq, greatest(4, length(v_seq)), '0');
end;
$fn$;

comment on function public.next_order_number() is
  'Draws the next order number, SA-YYYY-NNNN, padded to at least four digits and never truncated (040).';

-- ─── 2. Stripe event claims (M-002) ─────────────────────────────

alter table public.stripe_event_log
  add column if not exists status     text not null default 'done',
  add column if not exists claimed_at timestamptz,
  add column if not exists last_error text;

-- Existing rows are events the old code processed (or tried to): 'done'
-- is the honest reading, and it is what the default gave them.
update public.stripe_event_log
   set claimed_at = coalesce(claimed_at, processed_at)
 where claimed_at is null;

alter table public.stripe_event_log
  drop constraint if exists stripe_event_log_status_check,
  add constraint stripe_event_log_status_check
    check (status in ('processing', 'done', 'failed'));

comment on column public.stripe_event_log.status is
  'processing while a webhook run holds the event, done once handled, failed when the handler threw (040).';
comment on column public.stripe_event_log.claimed_at is
  'When the current (or last) claim was taken. A processing claim older than two minutes is treated as dead (040).';

-- Same signature and contract as 008: true means this call holds the event.
-- It also succeeds when the earlier holder failed or went silent.
create or replace function public.claim_stripe_event(p_event_id text, p_type text)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  v_id text;
begin
  insert into stripe_event_log as l (id, type, status, claimed_at, processed_at)
  values (p_event_id, coalesce(p_type, 'unknown'), 'processing', now(), now())
  on conflict (id) do update
     set status     = 'processing',
         claimed_at = now(),
         type       = excluded.type,
         last_error = null
   where l.status = 'failed'
      or (l.status = 'processing' and l.claimed_at < now() - interval '2 minutes')
  returning l.id into v_id;

  return v_id is not null;
end;
$fn$;

-- New. The webhook calls this when the handler finished. p_error null marks
-- the event done; anything else marks it failed so Stripe's retry can claim.
-- Returns false when there was no claim to settle.
create or replace function public.complete_stripe_event(
  p_event_id text,
  p_error    text default null
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  v_id text;
begin
  update stripe_event_log
     set status     = case when p_error is null then 'done' else 'failed' end,
         last_error = left(p_error, 1000)
   where id = p_event_id
  returning id into v_id;

  return v_id is not null;
end;
$fn$;

-- Same signature as 008. It used to delete the row; it now marks it failed,
-- which keeps the record and lets the retry claim it all the same.
create or replace function public.release_stripe_event(p_event_id text)
returns void
language sql
security definer
set search_path = pg_catalog, public
as $fn$
  update stripe_event_log
     set status     = 'failed',
         last_error = coalesce(last_error, 'released by the webhook after a handler error')
   where id = p_event_id;
$fn$;

-- ─── 3. confirm_order_paid (M-003, M-015) ───────────────────────
--
-- As 038, with two changes: the number comes from next_order_number(), and
-- an order that was 'abandoned' when the money arrived is flagged.

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
  v_number   text;
  v_moved    uuid;
  v_previous text;
begin
  -- Read and lock first, so the status the update replaces is known.
  select payment_status into v_previous
    from orders where id = p_order_id
     for update;

  update orders
     set payment_status        = 'paid',
         paid_at               = coalesce(paid_at, now()),
         stripe_payment_intent = coalesce(stripe_payment_intent, p_payment_intent_id),
         stripe_session_id     = coalesce(stripe_session_id, p_session_id),
         order_number          = coalesce(order_number, public.next_order_number())
   where id = p_order_id
     and payment_status in ('pending', 'abandoned')
   returning id, order_number into v_moved, v_number;

  if v_moved is null then
    -- Already paid (a redelivery), or refunded/failed and so not eligible.
    -- Stripe does not guarantee event ordering, and a late "completed" must
    -- never resurrect a closed order.
    select order_number into v_number
      from orders where id = p_order_id and payment_status = 'paid';
    return v_number;
  end if;

  if v_previous = 'abandoned' then
    perform flag_order(
      p_order_id,
      'Paid after a newer checkout was started for the same basket. Check Stripe for a second charge.'
    );
  end if;

  return v_number;
end;
$fn$;

-- ─── 4. Orphan pending orders (M-008) ───────────────────────────

-- One row per maintenance job, overwritten by each run. The health check
-- reads it to tell "ran and found nothing" from "has not run".
create table if not exists public.maintenance_runs (
  job         text        primary key,
  last_run_at timestamptz not null default now(),
  last_result jsonb       not null default '{}'
);

comment on table public.maintenance_runs is
  'Last run of each scheduled database job and what it did. Read by system_health() (048).';

alter table public.maintenance_runs enable row level security;

drop policy if exists "admin read maintenance runs" on public.maintenance_runs;
create policy "admin read maintenance runs"
  on public.maintenance_runs for select
  to authenticated
  using ((select public.is_admin_aal2()));

revoke all on public.maintenance_runs from public, anon, authenticated;
grant select on public.maintenance_runs to authenticated;
grant all on public.maintenance_runs to service_role;

-- A web order with no Stripe session never reached Stripe, so no money can
-- arrive for it. After a day it is abandoned, the same status 028 uses for
-- a checkout the shopper left. Counter orders are paid in the transaction
-- that creates them and are excluded by the channel.
create or replace function public.abandon_orphan_pending_orders()
returns integer
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_count integer;
begin
  with moved as (
    update public.orders
       set payment_status = 'abandoned'
     where payment_status = 'pending'
       and stripe_session_id is null
       and channel = 'web'
       and created_at < now() - interval '24 hours'
    returning id
  )
  select count(*) into v_count from moved;

  insert into public.maintenance_runs (job, last_run_at, last_result)
  values ('abandon-orphan-orders', now(), jsonb_build_object('abandoned', v_count))
  on conflict (job) do update
     set last_run_at = excluded.last_run_at,
         last_result = excluded.last_result;

  return v_count;
end;
$fn$;

comment on function public.abandon_orphan_pending_orders() is
  'Daily: abandons web orders still pending with no Stripe session after 24 hours. Returns how many (040).';

create extension if not exists pg_cron;

do $cron$
begin
  perform cron.unschedule('abandon-orphan-orders');
exception
  when others then null;  -- not scheduled yet
end
$cron$;

select cron.schedule(
  'abandon-orphan-orders',
  '37 3 * * *',
  $job$ select public.abandon_orphan_pending_orders(); $job$
);

-- ─── 5. Grants ──────────────────────────────────────────────────
--
-- Replaced functions keep their ACLs; these restate them (008, 038). The
-- new ones are server-only.

do $grants$
declare
  fn text;
begin
  foreach fn in array array[
    'next_order_number()',
    'claim_stripe_event(text, text)',
    'complete_stripe_event(text, text)',
    'release_stripe_event(text)',
    'confirm_order_paid(uuid, text, text)',
    'abandon_orphan_pending_orders()'
  ] loop
    execute format(
      'revoke all on function public.%s from public, anon, authenticated', fn);
    execute format(
      'grant execute on function public.%s to service_role', fn);
  end loop;
end
$grants$;

notify pgrst, 'reload schema';
