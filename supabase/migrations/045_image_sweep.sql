-- ═══════════════════════════════════════════════════════════════
-- 045: photo sweep grace period and the cron key
--
-- Pre-launch audit, L3.
--
-- M-018  sweep-orphan-images deleted an unreferenced photo on its next run,
--        so a photo removed by mistake, or wiped by a CSV import with a
--        blank images cell, could not be got back. Photos now wait 30 days
--        in orphaned_images (orphaned_at already exists, 011, and its index
--        already covers the filter). sweepable_orphaned_images() is the
--        queue as the sweep should read it; list and restore RPCs let the
--        admin find a photo and keep it.
-- M-019  schedule_image_sweep (012) wrote the service-role key into the
--        cron.job command, where anyone who can read that table sees it.
--        It now schedules invoke_image_sweep(), which reads the key from
--        Vault when the job runs, as 030 does for the notification worker.
--        An existing job is rescheduled here in the new form, with its own
--        URL and schedule, so the key leaves cron.job on db push. The key
--        has still been exposed and must be rotated (hosted step).
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Grace period (M-018) ────────────────────────────────────

comment on column public.orphaned_images.orphaned_at is
  'When the last product dropped this photo. The sweep leaves it alone for 30 days (045).';

-- What the sweep may delete now: unreferenced for 30 days, and not given
-- up on (011 stops after five failed attempts). Oldest first.
create or replace function public.sweepable_orphaned_images(p_limit int default 100)
returns setof text
language sql
stable
security definer
set search_path = ''
as $fn$
  select o.path
    from public.orphaned_images o
   where o.attempt_count < 5
     and o.orphaned_at < now() - interval '30 days'
   order by o.orphaned_at
   limit greatest(1, least(p_limit, 500));
$fn$;

-- The admin's view of the queue. sweep_after is when the photo goes.
create or replace function public.list_orphaned_images()
returns table (
  path          text,
  orphaned_at   timestamptz,
  sweep_after   timestamptz,
  attempt_count int,
  last_error    text
)
language plpgsql
stable
security definer
set search_path = ''
as $fn$
begin
  if not public.is_admin_aal2() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;

  return query
    select o.path, o.orphaned_at, o.orphaned_at + interval '30 days',
           o.attempt_count, o.last_error
      from public.orphaned_images o
     order by o.orphaned_at desc;
end;
$fn$;

-- Takes a photo off the deletion queue. The usual way back is to put the
-- photo on a product again (getPublicUrl(path) into products.images), which
-- 011's dequeue trigger already handles; this is for keeping a file that
-- has no product yet. Returns false when the path was not queued.
create or replace function public.restore_orphaned_image(p_path text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_path text;
begin
  if not public.is_admin_aal2() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;

  delete from public.orphaned_images where path = p_path
  returning path into v_path;

  return v_path is not null;
end;
$fn$;

-- ─── 2. Key out of cron.job (M-019) ─────────────────────────────

create extension if not exists pg_net;
create extension if not exists pg_cron;

create or replace function public.invoke_image_sweep(p_sweep_url text)
returns void
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_key text;
begin
  if not exists (
    select 1 from public.orphaned_images
     where attempt_count < 5 and orphaned_at < now() - interval '30 days'
  ) then
    return;
  end if;

  select decrypted_secret into v_key
    from vault.decrypted_secrets
   where name = 'service_role_key';

  if v_key is null then
    raise exception 'No Vault secret named service_role_key';
  end if;

  perform net.http_post(
    url     := p_sweep_url,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
end;
$fn$;

-- Same signature and return as 012. It no longer needs the key to exist
-- when it runs, only when the job does; invoke_image_sweep fails loudly in
-- cron.job_run_details if it is missing.
create or replace function public.schedule_image_sweep(
  p_project_url text,
  p_schedule    text default '17 3 * * *'
)
returns text
language plpgsql
security definer
set search_path = ''
as $fn$
begin
  begin
    perform cron.unschedule('sweep-orphan-images');
  exception
    when others then null;  -- not scheduled yet
  end;

  perform cron.schedule(
    'sweep-orphan-images',
    p_schedule,
    format('select public.invoke_image_sweep(%L);',
           rtrim(p_project_url, '/') || '/functions/v1/sweep-orphan-images')
  );

  return format('sweep-orphan-images scheduled (%s), key read from Vault at run time', p_schedule);
end;
$fn$;

comment on function public.schedule_image_sweep(text, text) is
  'Schedules the orphan-image sweep. The job reads the Vault secret service_role_key when it runs (045). Run from the SQL editor.';

-- Reschedule a job left by 012 in the new form. Its URL and schedule are
-- taken from the old command, so nothing has to be re-entered. If cron.job
-- cannot be read the notice says so, and Phil runs schedule_image_sweep().
do $resched$
declare
  v_command  text;
  v_schedule text;
  v_url      text;
begin
  select command, schedule into v_command, v_schedule
    from cron.job where jobname = 'sweep-orphan-images';

  if v_command is null then
    raise notice '045: sweep-orphan-images is not scheduled; nothing to move';
  elsif v_command like '%invoke_image_sweep%' then
    raise notice '045: sweep-orphan-images already reads its key from Vault';
  else
    v_url := substring(v_command from $re$url\s*:=\s*'([^']+)'$re$);
    if v_url is null then
      perform cron.unschedule('sweep-orphan-images');
      raise warning '045: removed the old sweep job but could not read its URL; run select public.schedule_image_sweep(''https://<ref>.supabase.co'');';
    else
      perform cron.unschedule('sweep-orphan-images');
      perform cron.schedule(
        'sweep-orphan-images', v_schedule,
        format('select public.invoke_image_sweep(%L);', v_url)
      );
      raise notice '045: sweep-orphan-images rescheduled without the key in its command';
    end if;
  end if;
exception
  when insufficient_privilege then
    raise warning '045: could not read cron.job (%); run select public.schedule_image_sweep(''https://<ref>.supabase.co'');', sqlerrm;
end
$resched$;

-- ─── 3. Grants ──────────────────────────────────────────────────

revoke all on function public.sweepable_orphaned_images(int) from public, anon, authenticated;
grant execute on function public.sweepable_orphaned_images(int) to service_role;

revoke all on function public.invoke_image_sweep(text) from public, anon, authenticated;
revoke all on function public.schedule_image_sweep(text, text) from public, anon, authenticated;

revoke all on function public.list_orphaned_images() from public, anon;
grant execute on function public.list_orphaned_images() to authenticated;
revoke all on function public.restore_orphaned_image(text) from public, anon;
grant execute on function public.restore_orphaned_image(text) to authenticated;

notify pgrst, 'reload schema';
