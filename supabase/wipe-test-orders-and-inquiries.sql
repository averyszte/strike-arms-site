-- ═══════════════════════════════════════════════════════════════
-- Wipe test orders and inquiries
--
-- A one-off script for the Supabase SQL Editor. It is NOT a migration, so
-- `supabase db push` never runs it.
--
-- The site went live on 2026-11-14, so real orders and enquiries may sit
-- among the test ones. Run STEP 1 on its own first and read the list. If
-- anything in it is real, set the cutoff in STEP 2 to just before it.
--
-- Deleting an order also deletes its items, status log, refunds and queued
-- emails (all on delete cascade). Deleting an inquiry deletes its queued
-- emails. stripe_event_log and payment_alerts are left alone: they record
-- what Stripe sent, and are not orders.
--
-- This cannot be undone.
-- ═══════════════════════════════════════════════════════════════


-- ─── STEP 1: preview (run this on its own) ─────────────────────

select 'order' as kind, order_number as ref, channel, payment_status,
       customer_name as name, customer_email as email,
       total_cents / 100.0 as total_eur, created_at
from public.orders
union all
select 'inquiry', coalesce(subject, '(no subject)'), source_page, status,
       name, email, null, created_at
from public.inquiries
order by created_at;


-- ─── STEP 2: delete (run after checking STEP 1) ────────────────
--
-- Everything created before the cutoff goes. The default deletes all of
-- it. To keep real orders, change it, e.g. '2026-11-14 12:00 Europe/Dublin'.

begin;

create temporary table wipe_cutoff on commit drop as
select timestamptz '2100-01-01 00:00 UTC' as before_ts;

delete from public.orders
where created_at < (select before_ts from wipe_cutoff);

delete from public.inquiries
where created_at < (select before_ts from wipe_cutoff);

-- Once no orders are left, the next order is SA-YYYY-0001 again. If any
-- order is kept, numbering carries on so no number is used twice.
select setval('public.order_number_seq', 1, false)
where not exists (select 1 from public.orders);

-- What is left. Both should be 0 if you used the default cutoff.
select (select count(*) from public.orders)    as orders_left,
       (select count(*) from public.inquiries) as inquiries_left;

commit;
