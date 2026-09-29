-- ═══════════════════════════════════════════════════════════════
-- 030: notification producer
--
-- Completion plan item 21. Every email the shop sends starts as a row in
-- notification_jobs, written in the same transaction as the change that
-- causes it. If the payment commits, the confirmation email is queued; if it
-- rolls back, nothing is. Sending happens later, in the notification-worker
-- Edge Function (item 22), so a Resend outage delays an email instead of
-- losing it.
--
-- The rows are written by triggers on orders rather than inside
-- confirm_order_paid, record_refund and the status update. A trigger fires
-- inside whichever of those transactions made the change, which is the same
-- guarantee, and it keeps those functions as 028 and 025 left them.
--
-- Emails queued here:
--   customer.order_confirmed   payment_status moves to 'paid'
--   owner.order_paid           the same, web orders only (Alan made the
--                              counter and phone sales himself)
--   customer.status_changed    fulfilment moves to ready_for_pickup or shipped
--   customer.refunded          refund_cents goes up
-- Customer emails are skipped when the order has no email (a counter sale
-- where nobody gave one). "owner" is resolved by the worker from its
-- OWNER_EMAIL secret, so the address is not in the database.
--
-- Nothing is sent until the worker is deployed and scheduled. Until then
-- jobs wait in the table; queuing them is harmless.
-- ═══════════════════════════════════════════════════════════════

-- 001 created a placeholder notification_jobs (type, payload) that nothing
-- ever wrote to. It is replaced, not altered: the new one is keyed to an
-- order and typed. The guard stops this destroying anything if a row has
-- somehow appeared.
do $guard$
begin
  if exists (select 1 from public.notification_jobs) then
    raise exception 'notification_jobs has rows; 030 expected the unused 001 placeholder';
  end if;
end
$guard$;

drop table if exists public.notification_jobs;

create table public.notification_jobs (
  id                  uuid        primary key default gen_random_uuid(),
  event_type          text        not null check (event_type in (
                        'customer.order_confirmed',
                        'owner.order_paid',
                        'customer.status_changed',
                        'customer.refunded')),
  order_id            uuid        not null references public.orders (id) on delete cascade,
  recipient           text        not null,
  -- What the order row cannot say later, e.g. which status this email is for.
  -- Everything else the worker reads fresh from the order when it sends.
  payload             jsonb       not null default '{}',
  status              text        not null default 'pending'
                                  check (status in ('pending', 'sent', 'failed')),
  attempt_count       int         not null default 0,
  next_attempt_at     timestamptz not null default now(),
  last_error          text,
  sent_at             timestamptz,
  created_at          timestamptz not null default now()
);

comment on table public.notification_jobs is
  'Outbox for order emails. Written by triggers on orders, drained by the notification-worker Edge Function.';

create index notification_jobs_due_idx
  on public.notification_jobs (next_attempt_at) where status = 'pending';

create index notification_jobs_order_idx
  on public.notification_jobs (order_id, created_at);

alter table public.notification_jobs enable row level security;

create policy "admin read notification jobs"
  on public.notification_jobs for select
  to authenticated
  using ((select public.is_admin_aal2()));

revoke all on public.notification_jobs from anon, authenticated;
grant select on public.notification_jobs to authenticated;
grant all on public.notification_jobs to service_role;

-- ─── 1. Producers ───────────────────────────────────────────────

create or replace function public.queue_order_notifications()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
begin
  if new.payment_status = 'paid' and old.payment_status in ('pending', 'abandoned') then
    if new.customer_email is not null then
      insert into notification_jobs (event_type, order_id, recipient)
        values ('customer.order_confirmed', new.id, new.customer_email);
    end if;
    if new.channel = 'web' then
      insert into notification_jobs (event_type, order_id, recipient)
        values ('owner.order_paid', new.id, 'owner');
    end if;
  end if;

  if new.fulfillment_status is distinct from old.fulfillment_status
     and new.fulfillment_status in ('ready_for_pickup', 'shipped')
     and new.customer_email is not null then
    insert into notification_jobs (event_type, order_id, recipient, payload)
      values ('customer.status_changed', new.id, new.customer_email,
              jsonb_build_object('status', new.fulfillment_status));
  end if;

  if new.refund_cents > coalesce(old.refund_cents, 0)
     and new.customer_email is not null then
    insert into notification_jobs (event_type, order_id, recipient, payload)
      values ('customer.refunded', new.id, new.customer_email,
              jsonb_build_object('refund_cents', new.refund_cents,
                                 'refunded_now_cents',
                                 new.refund_cents - coalesce(old.refund_cents, 0)));
  end if;

  return null;
end;
$fn$;

drop trigger if exists orders_queue_notifications on public.orders;
create trigger orders_queue_notifications
  after update of payment_status, fulfillment_status, refund_cents on public.orders
  for each row
  execute function public.queue_order_notifications();

-- ─── 2. Claim and complete ──────────────────────────────────────
--
-- Claiming pushes next_attempt_at forward as a lease: a worker that dies
-- mid-send leaves the job pending, and it is picked up again when the lease
-- runs out. skip locked lets two overlapping worker runs take different
-- jobs instead of queueing behind each other or sending one twice. The
-- worker also passes the job id to Resend as the idempotency key, which
-- covers a send that succeeded but was not recorded.

create or replace function public.claim_notification_jobs(p_limit int default 10)
returns setof public.notification_jobs
language sql
security definer
set search_path = pg_catalog, public
as $fn$
  update notification_jobs j
     set attempt_count   = j.attempt_count + 1,
         next_attempt_at = now() + interval '5 minutes'
   where j.id in (
     select id from notification_jobs
      where status = 'pending' and next_attempt_at <= now()
      order by next_attempt_at
      limit greatest(1, least(p_limit, 50))
      for update skip locked
   )
  returning j.*;
$fn$;

-- p_error null means sent. Otherwise the job backs off (1, 4, 9, 16 minutes)
-- and gives up after five attempts; a failed job stays in the table for the
-- admin to see and resend (item 24).
create or replace function public.complete_notification_job(
  p_job_id uuid,
  p_error  text default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
begin
  if p_error is null then
    update notification_jobs
       set status = 'sent', sent_at = now(), last_error = null
     where id = p_job_id;
    return;
  end if;

  update notification_jobs
     set last_error      = left(p_error, 1000),
         status          = case when attempt_count >= 5 then 'failed' else 'pending' end,
         next_attempt_at = now() + make_interval(mins => attempt_count * attempt_count)
   where id = p_job_id;
end;
$fn$;

-- ─── 3. Schedule ────────────────────────────────────────────────
--
-- The cron job runs every minute but only calls the worker when a job is
-- due, so an idle shop makes no function calls. The key is read from Vault
-- when the job runs rather than written into the cron command (012 wrote it
-- into cron.job, where anyone who can read that table sees it).

create extension if not exists pg_net;
create extension if not exists pg_cron;

create or replace function public.invoke_notification_worker(p_worker_url text)
returns void
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_key text;
begin
  if not exists (
    select 1 from public.notification_jobs
     where status = 'pending' and next_attempt_at <= now()
  ) then
    return;
  end if;

  select decrypted_secret into v_key
    from vault.decrypted_secrets
   where name = 'service_role_key';

  if v_key is null then
    raise exception 'No Vault secret named service_role_key';
  end if;

  perform net.http_post(
    url     := p_worker_url,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body    := '{}'::jsonb
  );
end;
$fn$;

-- Run once from the SQL editor after the worker is deployed:
--   select public.schedule_notification_worker('https://<ref>.supabase.co');
create or replace function public.schedule_notification_worker(p_project_url text)
returns text
language plpgsql
security definer
set search_path = ''
as $fn$
begin
  begin
    perform cron.unschedule('notification-worker');
  exception
    when others then null;  -- not scheduled yet
  end;

  perform cron.schedule(
    'notification-worker',
    '* * * * *',
    format('select public.invoke_notification_worker(%L);',
           rtrim(p_project_url, '/') || '/functions/v1/notification-worker')
  );

  return 'notification-worker scheduled (every minute, only when a job is due)';
end;
$fn$;

-- ─── 4. Grants ──────────────────────────────────────────────────

do $grants$
declare
  fn text;
begin
  foreach fn in array array[
    'queue_order_notifications()',
    'claim_notification_jobs(int)',
    'complete_notification_job(uuid, text)',
    'invoke_notification_worker(text)',
    'schedule_notification_worker(text)'
  ] loop
    execute format(
      'revoke all on function public.%s from public, anon, authenticated', fn);
  end loop;
end
$grants$;

grant execute on function public.claim_notification_jobs(int) to service_role;
grant execute on function public.complete_notification_job(uuid, text) to service_role;

notify pgrst, 'reload schema';
