-- Strike Arms: 033 order tracking
--
-- The customer-facing tracker (the line of steps on /account) and the email
-- that goes with each step.
--
-- 1. orders.tracking_number: the An Post number for a posted order. Optional.
--    The site and the "posted" email turn it into a tracking link.
-- 2. queue_order_notifications() now emails the customer on every forward
--    step, not only ready_for_pickup and shipped (decided 2026-09-29).
--
-- Rules for a status email, all of which must hold:
--   * the status moved FORWARD in the order's lane (025 fulfillment_lanes), or
--     to cancelled. A correction backwards, or back to pending, is silent:
--     025 lets staff undo a mis-click and the customer should not hear it.
--   * the order is paid (or part refunded) -- or, for cancelled, was paid.
--     An unpaid order that is cancelled was never the customer's order.
--   * it is not a counter sale. Those go pending -> collected at the till and
--     the customer is standing there.
--   * that status has not already been emailed for this order. Forward, back,
--     forward again would otherwise send the same email twice.
--
-- Everything else in the function is unchanged from 030.

alter table public.orders
  add column if not exists tracking_number text;

alter table public.orders drop constraint if exists orders_tracking_number_format;
alter table public.orders add constraint orders_tracking_number_format check (
  tracking_number is null or tracking_number ~ '^[A-Za-z0-9 -]{4,40}$'
);

comment on column public.orders.tracking_number is
  'An Post tracking number for posted items. Shown to the customer as a tracking link.';

create or replace function public.is_status_email_due(
  p_method text, p_from text, p_to text, p_payment text, p_channel text
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_channel is distinct from 'counter'
     and p_to is distinct from p_from
     and case
       when p_to = 'cancelled' then
         p_payment in ('paid', 'partially_refunded', 'refunded')
       when p_to = 'pending' then false
       else
         p_payment in ('paid', 'partially_refunded')
         and coalesce(array_position(public.fulfillment_lanes(p_method), p_to), 0)
           > coalesce(array_position(public.fulfillment_lanes(p_method), p_from), 0)
     end;
$$;

comment on function public.is_status_email_due(text, text, text, text, text) is
  'Whether a fulfilment change should email the customer. See 033 for the rules.';

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

  if new.customer_email is not null
     and public.is_status_email_due(new.fulfillment_method, old.fulfillment_status,
                                    new.fulfillment_status, new.payment_status, new.channel)
     and not exists (
       select 1 from notification_jobs j
        where j.order_id = new.id
          and j.event_type = 'customer.status_changed'
          and j.payload ->> 'status' = new.fulfillment_status
     ) then
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

revoke all on function public.is_status_email_due(text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.is_status_email_due(text, text, text, text, text)
  to service_role;
