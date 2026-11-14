-- ═══════════════════════════════════════════════════════════════
-- 042: notification outbox reliability
--
-- Pre-launch audit, L3.
--
-- M-016  The enqueue triggers ran in the order's own transaction with no
--        guard, so any failure queuing an email (a constraint, a bad
--        payload) rolled back the payment confirmation itself, and the
--        webhook 500'd until Stripe gave up. Queuing now goes through one
--        guarded helper. A failure is written to notification_enqueue_errors
--        and the order update goes through.
-- M-017  The Shipped email was deduped once per status, ever, and sent at
--        once. A status email now waits five minutes before it can be
--        claimed. Moving the order on or back in that time withdraws it.
--        Once sent, a status email is not queued again for that order
--        (an admin re-send is the only way to send it twice).
--        The bulk preview, preview_status_emails(), is in 046.
-- M-010  The attempt cap and worker timeout are in 046.
-- M-033  A counter order sends no refund email (the customer is standing
--        at the till).
-- M-001  owner.health_digest is a new event type with no order, product or
--        inquiry (048 queues it).
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Event types and subjects ────────────────────────────────

alter table public.notification_jobs
  drop constraint if exists notification_jobs_event_type_check,
  add constraint notification_jobs_event_type_check check (event_type in (
    'customer.order_confirmed',
    'owner.order_paid',
    'customer.status_changed',
    'customer.refunded',
    'owner.low_stock',
    'owner.new_inquiry',
    'owner.health_digest'));

-- The digest is about the shop, not one row, so it alone has no subject.
alter table public.notification_jobs
  drop constraint if exists notification_jobs_subject_check,
  add constraint notification_jobs_subject_check
    check (num_nonnulls(order_id, product_id, inquiry_id)
           = case when event_type = 'owner.health_digest' then 0 else 1 end);

-- ─── 2. Enqueue failures (M-016) ────────────────────────────────

-- No foreign keys on purpose: a row has to be writable even when the
-- failure was about the order or inquiry it names.
create table if not exists public.notification_enqueue_errors (
  id          uuid        primary key default gen_random_uuid(),
  source      text        not null,
  event_type  text,
  order_id    uuid,
  inquiry_id  uuid,
  detail      text        not null,
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);

comment on table public.notification_enqueue_errors is
  'Emails that could not be queued. The order or inquiry was saved; the email was not. Reported by system_health() (042).';

alter table public.notification_enqueue_errors enable row level security;

drop policy if exists "admin read enqueue errors" on public.notification_enqueue_errors;
create policy "admin read enqueue errors"
  on public.notification_enqueue_errors for select
  to authenticated
  using ((select public.is_admin_aal2()));

drop policy if exists "admin resolve enqueue errors" on public.notification_enqueue_errors;
create policy "admin resolve enqueue errors"
  on public.notification_enqueue_errors for update
  to authenticated
  using ((select public.is_admin_aal2()))
  with check ((select public.is_admin_aal2()));

revoke all on public.notification_enqueue_errors from public, anon, authenticated;
grant select on public.notification_enqueue_errors to authenticated;
grant update (resolved_at) on public.notification_enqueue_errors to authenticated;
grant all on public.notification_enqueue_errors to service_role;

-- Every producer queues through this. The exception block is a
-- subtransaction: a failed insert is undone on its own and recorded, and
-- the caller's transaction carries on. Returns the job id, or null.
create or replace function public.enqueue_notification(
  p_source     text,
  p_event_type text,
  p_recipient  text,
  p_order_id   uuid        default null,
  p_inquiry_id uuid        default null,
  p_payload    jsonb       default '{}',
  p_not_before timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_id uuid;
begin
  begin
    insert into public.notification_jobs
      (event_type, order_id, inquiry_id, recipient, payload, next_attempt_at)
    values
      (p_event_type, p_order_id, p_inquiry_id, p_recipient,
       coalesce(p_payload, '{}'), coalesce(p_not_before, now()))
    returning id into v_id;
    return v_id;
  exception
    when others then
      insert into public.notification_enqueue_errors
        (source, event_type, order_id, inquiry_id, detail)
      values
        (p_source, p_event_type, p_order_id, p_inquiry_id, left(sqlstate || ': ' || sqlerrm, 1000));
      return null;
  end;
end;
$fn$;

-- ─── 3. Order producer (M-016, M-017, M-033) ────────────────────

create or replace function public.queue_order_notifications()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
begin
  begin
    if new.payment_status = 'paid' and old.payment_status in ('pending', 'abandoned') then
      if new.customer_email is not null then
        perform enqueue_notification('orders', 'customer.order_confirmed',
                                     new.customer_email, new.id);
      end if;
      if new.channel = 'web' then
        perform enqueue_notification('orders', 'owner.order_paid', 'owner', new.id);
      end if;
    end if;

    if new.fulfillment_status is distinct from old.fulfillment_status then
      -- Withdraw any status email still in its hold for a status the order
      -- has now left. attempt_count = 0 means no worker has touched it.
      delete from notification_jobs j
       where j.order_id = new.id
         and j.event_type = 'customer.status_changed'
         and j.status = 'pending'
         and j.attempt_count = 0
         and j.payload ->> 'status' is distinct from new.fulfillment_status;

    end if;

    if new.customer_email is not null
       and is_status_email_due(new.fulfillment_method, old.fulfillment_status,
                               new.fulfillment_status, new.payment_status, new.channel)
       and not exists (
         select 1 from notification_jobs j
          where j.order_id = new.id
            and j.event_type = 'customer.status_changed'
            and j.payload ->> 'status' = new.fulfillment_status
            and j.status in ('pending', 'sent')
       ) then
      perform enqueue_notification('orders', 'customer.status_changed',
                                   new.customer_email, new.id, null,
                                   jsonb_build_object('status', new.fulfillment_status),
                                   now() + interval '5 minutes');
    end if;

    if new.refund_cents > coalesce(old.refund_cents, 0)
       and new.customer_email is not null
       and new.channel is distinct from 'counter' then
      perform enqueue_notification('orders', 'customer.refunded',
                                   new.customer_email, new.id, null,
                                   jsonb_build_object('refund_cents', new.refund_cents,
                                                      'refunded_now_cents',
                                                      new.refund_cents - coalesce(old.refund_cents, 0)));
    end if;
  exception
    when others then
      -- Anything outside the helper (a lane lookup, the withdraw). The order
      -- change stands; the email side is recorded for the health check.
      insert into notification_enqueue_errors (source, order_id, detail)
      values ('queue_order_notifications', new.id, left(sqlstate || ': ' || sqlerrm, 1000));
  end;

  return null;
end;
$fn$;

-- ─── 4. Inquiry producer (M-016) ────────────────────────────────

create or replace function public.queue_inquiry_notification()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
begin
  perform enqueue_notification('inquiries', 'owner.new_inquiry', 'owner', null, new.id);
  return null;
end;
$fn$;

-- ─── 5. Grants ──────────────────────────────────────────────────
--
-- claim, complete, the worker call and preview_status_emails (M-010 and
-- the M-017 preview) are in 046.

do $grants$
declare
  fn text;
begin
  foreach fn in array array[
    'enqueue_notification(text, text, text, uuid, uuid, jsonb, timestamptz)',
    'queue_order_notifications()',
    'queue_inquiry_notification()'
  ] loop
    execute format(
      'revoke all on function public.%s from public, anon, authenticated', fn);
  end loop;
end
$grants$;

grant execute on function public.enqueue_notification(text, text, text, uuid, uuid, jsonb, timestamptz) to service_role;

notify pgrst, 'reload schema';
