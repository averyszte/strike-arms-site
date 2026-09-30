-- Strike Arms: 032 service_role grants
--
-- Every Edge Function talks to the database as service_role (createAdminClient
-- in supabase/functions/_shared/supabase-admin.ts). service_role bypasses RLS,
-- but bypassing RLS is not the same as holding privileges: it still needs
-- USAGE on the schema and table-level grants, like any other role.
--
-- This project does not hand those out automatically (004 says as much, and
-- 006 had to fix the same gap for subcategories). 004 granted the schema and
-- the tables to anon and authenticated only, so service_role could not read
-- orders at all. Seen live on 2026-09-29: order-lookup and checkout-status
-- both answered 500 to requests that should have come back "not found".
-- create-checkout-session, stripe-webhook, refund-order, notification-worker
-- and sweep-orphan-images all go through the same client.
--
-- service_role is the server-side key and never reaches the browser, so the
-- blanket grant is the intended Supabase setup, not a widening.

grant usage on schema public to service_role;

grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

-- Tables, sequences and functions created by later migrations get the same,
-- so the next new table does not repeat this.
alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to service_role;
alter default privileges in schema public
  grant execute on functions to service_role;
