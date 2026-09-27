-- ═══════════════════════════════════════════════════════════════
-- 024: an invited user becomes an admin
--
-- is_admin() reads public.admins, and nothing wrote to it except a hand-run
-- insert. An admin invited from the Supabase dashboard could accept the
-- invite, set a password, and then be refused by the login page as "not an
-- admin", because their auth.users row had no admins row beside it.
--
-- This trigger writes that row when Supabase creates a user from an invite
-- (invited_at is set only on that path). Customer accounts are not in
-- Supabase Auth yet; when they are, they sign themselves up and never carry
-- invited_at. So inviting someone from the dashboard makes them an admin, and
-- that is the only thing that does.
--
-- Removing an admin is still a delete from public.admins (or deleting the
-- user, which cascades).
-- ═══════════════════════════════════════════════════════════════

create or replace function public.handle_invited_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.invited_at is not null then
    insert into public.admins (id)
    values (new.id)
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

-- A trigger function is never called directly, so nobody needs EXECUTE on it.
-- verify-rls.sql fails any definer function the browser can call.
revoke execute on function public.handle_invited_admin() from public, anon, authenticated;

drop trigger if exists on_auth_user_invited on auth.users;

create trigger on_auth_user_invited
  after insert on auth.users
  for each row
  execute function public.handle_invited_admin();
