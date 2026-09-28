-- ═══════════════════════════════════════════════════════════════
-- 027: the 024 invite trigger never fired
--
-- 024 gave an invited user an admins row "after insert on auth.users, when
-- invited_at is set". Supabase Auth does not set invited_at on that insert:
-- it creates the user, sends the email, and only then writes invited_at with
-- a separate UPDATE (sendInvite in supabase/auth internal/api/mail.go). So
-- the insert always saw invited_at null, and an invited user who accepted
-- landed on "No admin access".
--
-- The trigger now also fires on the update that writes invited_at. Inviting
-- an existing user again goes through the same update, and the insert is
-- idempotent, so that is harmless.
--
-- The backfill gives an admins row to everyone already invited, which is
-- what 024 meant to do for them. Customer accounts never carry invited_at
-- (see 024), so this does not reach them.
-- ═══════════════════════════════════════════════════════════════

drop trigger if exists on_auth_user_invited on auth.users;

create trigger on_auth_user_invited
  after insert or update of invited_at on auth.users
  for each row
  when (new.invited_at is not null)
  execute function public.handle_invited_admin();

insert into public.admins (id)
select u.id
from auth.users u
where u.invited_at is not null
on conflict (id) do nothing;
