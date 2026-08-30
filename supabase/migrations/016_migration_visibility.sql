-- Strike Arms: make "applied" visible to the admin (G8)
--
-- The florist's worst production incident was a migration committed but never
-- pushed. Refunds failed for real customers while the handler returned HTTP
-- 200, and nothing anywhere connected "it is in the repo" to "it is in the
-- database". They now keep a thirty-five-row reconciliation table by hand,
-- which is a process, not a fix -- it is only correct while somebody keeps
-- editing it.
--
-- The database already knows the answer. The Supabase CLI records every
-- migration it applies in supabase_migrations.schema_migrations. That schema
-- is not readable by anyone but the service role, so this exposes exactly one
-- column of it to a signed-in admin, and the admin screen compares that list
-- against the files in the repo.
--
-- Which means this migration is the one that tells you migrations are missing
-- -- and if it is itself missing, the panel says so rather than showing a
-- reassuring green tick. That is the right failure: the check cannot quietly
-- pass because it was never installed.

create or replace function applied_migrations()
returns table (version text)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $fn$
begin
  -- is_admin(), not is_admin_aal2(). This is a read of deployment metadata,
  -- the same bar as the admin read policies on the tables; AAL2 is what
  -- guards writes. The version list is not a secret, but it is nobody's
  -- business but the shop's.
  if not public.is_admin() then
    raise exception 'not authorised' using errcode = '42501';
  end if;

  return query
    select m.version::text
    from supabase_migrations.schema_migrations m
    order by m.version;
end;
$fn$;

revoke all on function public.applied_migrations() from public, anon;
grant execute on function public.applied_migrations() to authenticated;

comment on function public.applied_migrations() is
  'Versions recorded by the Supabase CLI. Admin-only. Compared against the repo by the admin Settings screen (G8).';

notify pgrst, 'reload schema';
