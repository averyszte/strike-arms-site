-- ═══════════════════════════════════════════════════════════════
-- 046: notification worker limits and the bulk status preview
--
-- Pre-launch audit, L3. Split from 042 to keep each file short; it
-- redefines only functions 030 and 031 created, so it has no dependency
-- on 043 to 045.
--
-- M-010  A job whose worker died was re-leased for ever, because only
--        complete_notification_job() could mark it failed. The cap is now
--        eight attempts with exponential backoff (about six hours in all),
--        enforced at claim time as well. The worker call has a timeout.
-- M-017  preview_status_emails() tells a bulk status change how many
--        customers it will email.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Claim and complete (M-010) ──────────────────────────────
--
-- Eight attempts. A job that has had eight leases and is due again has
-- been abandoned by a worker that never reported back; it is failed here,
-- in the same statement as the claim, instead of being leased again.

create or replace function public.claim_notification_jobs(p_limit int default 10)
returns setof public.notification_jobs
language sql
security definer
set search_path = pg_catalog, public
as $fn$
  with gave_up as (
    update notification_jobs
       set status     = 'failed',
           last_error = left(concat_ws(' | ', last_error,
                          'Gave up after 8 attempts; the last one never reported back.'), 1000)
     where status = 'pending'
       and attempt_count >= 8
       and next_attempt_at <= now()
    returning id
  )
  update notification_jobs j
     set attempt_count   = j.attempt_count + 1,
         next_attempt_at = now() + interval '5 minutes'
   where j.id in (
     select id from notification_jobs
      where status = 'pending'
        and attempt_count < 8
        and next_attempt_at <= now()
      order by next_attempt_at
      limit greatest(1, least(p_limit, 50))
      for update skip locked
   )
  returning j.*;
$fn$;

-- Backoff after attempt n is 3 * 2^(n-1) minutes: 3, 6, 12, 24, 48, 96,
-- 192, about six and a half hours before the eighth and last try.
create or replace function public.complete_notification_job(
  p_job_id uuid,
  p_error  text default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
begin
  if p_error is null then
    update notification_jobs
       set status = 'sent', sent_at = now(), last_error = null
     where id = p_job_id;
    return;
  end if;

  update notification_jobs
     set last_error      = left(p_error, 1000),
         status          = case when attempt_count >= 8 then 'failed' else 'pending' end,
         next_attempt_at = now() + make_interval(
           mins => least(240, 3 * power(2, greatest(attempt_count, 1) - 1))::int)
   where id = p_job_id;
end;
$fn$;

-- As 030, with a timeout on the request.
create or replace function public.invoke_notification_worker(p_worker_url text)
returns void
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_key text;
begin
  if not exists (
    select 1 from public.notification_jobs
     where status = 'pending' and next_attempt_at <= now()
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
    url     := p_worker_url,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
end;
$fn$;

-- ─── 2. Bulk status preview (M-017) ─────────────────────────────
--
-- How many of these orders would email their customer if moved to
-- p_status now. Read-only; the bulk confirm shows the number.

create or replace function public.preview_status_emails(p_order_ids uuid[], p_status text)
returns integer
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $fn$
declare
  v_count integer;
begin
  if not is_admin_aal2() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;

  select count(*) into v_count
    from orders o
   where o.id = any (p_order_ids)
     and o.customer_email is not null
     and is_status_email_due(o.fulfillment_method, o.fulfillment_status,
                             p_status, o.payment_status, o.channel)
     and not exists (
       select 1 from notification_jobs j
        where j.order_id = o.id
          and j.event_type = 'customer.status_changed'
          and j.payload ->> 'status' = p_status
          and j.status in ('pending', 'sent')
     );

  return v_count;
end;
$fn$;

-- ─── 3. Grants ──────────────────────────────────────────────────

revoke all on function public.claim_notification_jobs(int) from public, anon, authenticated;
grant execute on function public.claim_notification_jobs(int) to service_role;
revoke all on function public.complete_notification_job(uuid, text) from public, anon, authenticated;
grant execute on function public.complete_notification_job(uuid, text) to service_role;
revoke all on function public.invoke_notification_worker(text) from public, anon, authenticated;

revoke all on function public.preview_status_emails(uuid[], text) from public, anon;
grant execute on function public.preview_status_emails(uuid[], text) to authenticated;

notify pgrst, 'reload schema';
