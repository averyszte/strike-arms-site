-- ═══════════════════════════════════════════════════════════════
-- 031: notification extras
--
-- Completion plan item 24. Two additions to the 030 outbox:
--
-- 1. A low-stock email to Alan. It is queued when a product's stock_count
--    falls to or below its low_stock_threshold, once per crossing: a sale
--    that takes it from 3 to 2 under a threshold of 3 queues nothing more.
--    stock_count, not sellable_count: reservations come and go with every
--    abandoned checkout, and an alert on those would cry wolf.
-- 2. Resend, for the order sheet. It queues a fresh copy of an email that
--    failed or that the customer says never arrived. A copy rather than a
--    reset, because the worker uses the job id as Resend's idempotency key
--    and Resend would drop a repeat of a sent job for 24 hours. A customer
--    email goes to the order's current address, so correcting a typo and
--    pressing resend is the fix.
--
-- A low-stock job belongs to a product, not an order, so order_id becomes
-- nullable and exactly one of the two is set.
--
-- Written after 030 and before the rate limit, so the rate limit moves to
-- 032 and every later number in the plan moves up by one.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Jobs about a product ────────────────────────────────────

alter table public.notification_jobs
  alter column order_id drop not null,
  add column if not exists product_id uuid references public.products (id) on delete cascade;

alter table public.notification_jobs
  drop constraint if exists notification_jobs_event_type_check,
  add constraint notification_jobs_event_type_check check (event_type in (
    'customer.order_confirmed',
    'owner.order_paid',
    'customer.status_changed',
    'customer.refunded',
    'owner.low_stock'));

alter table public.notification_jobs
  drop constraint if exists notification_jobs_subject_check,
  add constraint notification_jobs_subject_check
    check ((order_id is null) <> (product_id is null));

create index if not exists notification_jobs_product_idx
  on public.notification_jobs (product_id) where product_id is not null;

-- ─── 2. Low-stock producer ──────────────────────────────────────

create or replace function public.queue_low_stock_notification()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
begin
  if not new.is_archived
     and new.stock_count <= new.low_stock_threshold
     and old.stock_count > old.low_stock_threshold then
    insert into notification_jobs (event_type, product_id, recipient, payload)
      values ('owner.low_stock', new.id, 'owner',
              jsonb_build_object('stock_count', new.stock_count,
                                 'threshold', new.low_stock_threshold));
  end if;
  return null;
end;
$fn$;

drop trigger if exists products_queue_low_stock on public.products;
create trigger products_queue_low_stock
  after update of stock_count on public.products
  for each row
  execute function public.queue_low_stock_notification();

-- ─── 3. Resend ──────────────────────────────────────────────────
--
-- Called from the order sheet, so it checks the caller itself. Only order
-- emails: a low-stock alert has no sheet to be resent from. Returns the new
-- job's id.

create or replace function public.resend_notification(p_job_id uuid)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  v_job       notification_jobs;
  v_recipient text;
  v_new_id    uuid;
begin
  if not is_admin_aal2() then
    raise exception 'Not allowed' using errcode = '42501';
  end if;

  select * into v_job from notification_jobs where id = p_job_id;
  if v_job.id is null or v_job.order_id is null then
    raise exception 'No order email with that id';
  end if;
  if v_job.status = 'pending' then
    raise exception 'That email is still queued';
  end if;

  if v_job.recipient = 'owner' then
    v_recipient := 'owner';
  else
    select customer_email into v_recipient from orders where id = v_job.order_id;
    if v_recipient is null then
      raise exception 'The order has no email address';
    end if;
  end if;

  insert into notification_jobs (event_type, order_id, recipient, payload)
    values (v_job.event_type, v_job.order_id, v_recipient, v_job.payload)
    returning id into v_new_id;

  return v_new_id;
end;
$fn$;

-- ─── 4. Grants ──────────────────────────────────────────────────

revoke all on function public.queue_low_stock_notification() from public, anon, authenticated;
revoke all on function public.resend_notification(uuid) from public, anon;
grant execute on function public.resend_notification(uuid) to authenticated;

notify pgrst, 'reload schema';
