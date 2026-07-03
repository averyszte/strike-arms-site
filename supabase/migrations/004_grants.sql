-- Strike Arms: PostgREST role grants
-- Supabase migrations do not auto-grant schema access.
-- These grants are required alongside RLS policies for the API to work.

-- Schema usage
grant usage on schema public to anon, authenticated;

-- Products: anon reads catalogue; authenticated (admin) does everything
grant select on public.products to anon;
grant all on public.products to authenticated;

-- Orders: admin only
grant all on public.orders to authenticated;
grant all on public.order_items to authenticated;
grant all on public.order_status_log to authenticated;
grant all on public.inventory_adjustments to authenticated;

-- Checkout reservations: anon can insert (reserve stock); admin manages
grant insert on public.checkout_reservations to anon;
grant all on public.checkout_reservations to authenticated;

-- Inquiries: anon can submit contact form; admin manages
grant insert on public.inquiries to anon;
grant all on public.inquiries to authenticated;

-- Admins, stripe log, notification jobs: service role only (no browser grants)
grant all on public.admins to authenticated;
grant all on public.stripe_event_log to authenticated;
grant all on public.notification_jobs to authenticated;
