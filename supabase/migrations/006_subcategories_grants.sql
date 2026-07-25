-- Strike Arms: grants for the subcategories table
-- 005 created subcategories with RLS policies, but the table-level grants in
-- 004 had already run, so the table shipped with no PostgREST access. In
-- Postgres a GRANT is required alongside RLS: without it the API returns
-- "permission denied for table subcategories" before any policy is evaluated.
--
-- Mirrors the products pattern: anon reads the taxonomy, authenticated (admin)
-- manages it. Matches the public_read (anon, authenticated) and admins_all
-- (authenticated) policies defined in 005.

grant select on public.subcategories to anon;
grant all on public.subcategories to authenticated;
