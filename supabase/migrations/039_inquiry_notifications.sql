-- ═══════════════════════════════════════════════════════════════
-- 039: inquiry notifications
--
-- An email to Alan for every contact form and service quote. Until now they
-- were only filed in `inquiries` and he had to open the admin to see them.
--
-- The job is written by a trigger on inquiries, in the same transaction as
-- the insert (submit-inquiry is the only writer, 036), and sent by the same
-- worker as the order emails, so it gets the same retries and idempotency.
-- The worker reads the inquiry fresh when it sends; the job carries only
-- the id.
--
-- A job is now about exactly one of an order, a product (031, history only
-- since 038) or an inquiry.
-- ═══════════════════════════════════════════════════════════════

alter table public.notification_jobs
  add column if not exists inquiry_id uuid references public.inquiries (id) on delete cascade;

alter table public.notification_jobs
  drop constraint if exists notification_jobs_event_type_check,
  add constraint notification_jobs_event_type_check check (event_type in (
    'customer.order_confirmed',
    'owner.order_paid',
    'customer.status_changed',
    'customer.refunded',
    'owner.low_stock',
    'owner.new_inquiry'));

alter table public.notification_jobs
  drop constraint if exists notification_jobs_subject_check,
  add constraint notification_jobs_subject_check
    check (num_nonnulls(order_id, product_id, inquiry_id) = 1);

create index if not exists notification_jobs_inquiry_idx
  on public.notification_jobs (inquiry_id) where inquiry_id is not null;

create or replace function public.queue_inquiry_notification()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
begin
  insert into notification_jobs (event_type, inquiry_id, recipient)
    values ('owner.new_inquiry', new.id, 'owner');
  return null;
end;
$fn$;

revoke all on function public.queue_inquiry_notification() from public, anon, authenticated;

drop trigger if exists inquiries_queue_notification on public.inquiries;
create trigger inquiries_queue_notification
  after insert on public.inquiries
  for each row
  execute function public.queue_inquiry_notification();

notify pgrst, 'reload schema';
