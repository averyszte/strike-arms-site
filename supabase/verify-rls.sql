-- Strike Arms: read-only security check
--
-- NOT a migration. It lives outside supabase/migrations/ so `db push` never
-- applies it, and it only reads the catalogue. Paste it into the Supabase SQL
-- editor and run it after every migration.
--
-- One result set. Each row is a finding; an empty result is a pass.
--   fail   -- a rule is broken; fix before launch
--   review -- allowed today, but someone should be able to say why
--
-- Ported from All Blooms' verify-rls.sql, which dumps everything for a human
-- to read. This version asserts, so a regression shows up as a row instead of
-- relying on someone noticing it in a long listing. It would have caught both
-- of the problems 022 fixes.

with
-- Tables that hold customer data. Nothing here may be readable by anon.
pii_tables(name) as (values
  ('orders'), ('order_items'), ('order_status_log'), ('inquiries'),
  ('checkout_reservations'), ('notification_jobs'), ('stripe_event_log'), ('admins'),
  ('payment_alerts')
),
-- SECURITY DEFINER functions the browser is meant to call. Each one checks
-- the caller itself (or, for the two helpers, only answers about the caller).
browser_definers(name) as (values
  ('is_admin'), ('is_admin_aal2'), ('adjust_stock'), ('create_counter_order'),
  ('applied_migrations'), ('resend_notification')
),
policies as (
  select tablename, policyname, cmd, roles,
         coalesce(qual, '') || ' ' || coalesce(with_check, '') as expr
  from pg_policies
  where schemaname = 'public'
),
findings(severity, rule, object, detail) as (

  -- 1. Every public table has RLS on.
  select 'fail', 'rls-disabled', c.relname::text, 'RLS is not enabled'
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity

  union all
  -- 2. Every SECURITY DEFINER function pins its search_path.
  select 'fail', 'definer-no-search-path',
         p.oid::regprocedure::text, 'SECURITY DEFINER without set search_path'
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prosecdef
    and not exists (
      select 1 from unnest(coalesce(p.proconfig, '{}')) s where s like 'search_path=%'
    )

  union all
  -- 3. No policy reads the admins table directly. A policy runs as the
  --    caller, who has no access to admins; use is_admin_aal2() instead.
  select 'fail', 'policy-reads-admins', tablename || ' / ' || policyname, expr
  from policies
  where expr ~* '\mfrom\s+(public\.)?admins\M'

  union all
  -- 4. Every write policy requires a TOTP-verified admin.
  select 'fail', 'write-without-aal2', tablename || ' / ' || policyname,
         cmd || ': ' || expr
  from policies
  where cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
    and expr not like '%is_admin_aal2()%'
    and not (tablename = 'inquiries' and policyname = 'anon insert inquiries')

  union all
  -- 5. Nothing on a customer-data table is readable by anon.
  select 'fail', 'pii-readable-by-anon', t.name, 'anon has ' || g.privilege_type
  from pii_tables t
  join information_schema.role_table_grants g
    on g.table_schema = 'public' and g.table_name = t.name
  where g.grantee = 'anon' and g.privilege_type in ('SELECT', 'UPDATE', 'DELETE')

  union all
  -- 6. anon writes nothing except the public inquiry form (until the
  --    submit-inquiry function replaces it).
  select 'fail', 'anon-write-grant', g.table_name, 'anon has ' || g.privilege_type
  from information_schema.role_table_grants g
  where g.table_schema = 'public' and g.grantee = 'anon'
    and g.privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')
    and not (g.table_name = 'inquiries' and g.privilege_type = 'INSERT')

  union all
  -- 7. The browser can execute no SECURITY DEFINER function except the ones
  --    listed above.
  select 'fail', 'definer-callable-from-browser', p.oid::regprocedure::text,
         concat_ws(', ',
           case when has_function_privilege('anon', p.oid, 'EXECUTE') then 'anon' end,
           case when has_function_privilege('authenticated', p.oid, 'EXECUTE') then 'authenticated' end)
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prosecdef
    and p.proname not in (select name from browser_definers)
    and (has_function_privilege('anon', p.oid, 'EXECUTE')
      or has_function_privilege('authenticated', p.oid, 'EXECUTE'))

  union all
  -- 8. Admin reads of customer data should need TOTP too (023).
  select 'review', 'pii-read-without-aal2', tablename || ' / ' || policyname, expr
  from policies
  where cmd = 'SELECT' and tablename in (select name from pii_tables)
    and expr not like '%is_admin_aal2()%'

  union all
  -- 9. Policies with no TO clause are also evaluated for anon (023).
  select 'review', 'policy-without-to', tablename || ' / ' || policyname,
         'applies to ' || array_to_string(roles, ', ')
  from policies
  where roles = '{public}'

  union all
  -- 10. The one intentional anon write, listed so it is not forgotten (033, inquiries_lockdown).
  select 'review', 'anon-insert-inquiries', 'inquiries',
         'open anon insert; replace with the submit-inquiry function'
  from information_schema.role_table_grants g
  where g.table_schema = 'public' and g.table_name = 'inquiries'
    and g.grantee = 'anon' and g.privilege_type = 'INSERT'

  union all
  -- 11. The stock ledger is written only by definer functions, never edited (025).
  select 'fail', 'ledger-writable-from-browser', 'inventory_adjustments',
         g.grantee || ' has ' || g.privilege_type
  from information_schema.role_table_grants g
  where g.table_schema = 'public' and g.table_name = 'inventory_adjustments'
    and g.grantee in ('anon', 'authenticated')
    and g.privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')

  union all
  -- 12. Products are archived, never deleted: a delete cascades away the
  --     stock history (026).
  select 'fail', 'products-deletable-from-browser', 'products',
         g.grantee || ' has ' || g.privilege_type
  from information_schema.role_table_grants g
  where g.table_schema = 'public' and g.table_name = 'products'
    and g.grantee in ('anon', 'authenticated')
    and g.privilege_type in ('DELETE', 'TRUNCATE')
)
select severity, rule, object, detail
from findings
order by severity, rule, object;
