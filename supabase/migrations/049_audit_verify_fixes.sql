-- ═══════════════════════════════════════════════════════════════
-- 049: fixes from the audit verification pass
--
-- Pre-launch audit, verification of 043 and 048.
--
-- M-021  claim_my_guest_orders (043) checked that the confirmation came
--        more than 5 seconds after the sign-up, then claimed every guest
--        order on the address, whenever it was placed. A claim now takes
--        only the orders placed at or before the confirmation. The worry
--        is someone registering a customer's address: with "Confirm email"
--        on they cannot confirm without the inbox, so this is defence in
--        depth, but an order placed after a confirmation the attacker
--        controlled proves nothing about who owns it. Only an order that
--        predates the confirmation can belong to the person who confirmed.
--        The ordinary case is untouched: a guest orders, later signs up
--        and confirms, and the order is older than the confirmation.
--        A guest order placed on the address after confirming (signed out
--        at checkout) is no longer linked automatically; Alan can link it
--        by hand if a customer asks.
-- M-010  The email_queue health check (048) did not see jobs still
--        retrying late in their eight attempts (046). It now also counts
--        pending jobs past their fifth attempt, as a warn. Pending, not
--        "anything but failed": a job that was sent on its sixth try is
--        done, and counting it would keep the check at warn for ever.
--
-- system_health() reads system_health_checks() at call time and its
-- signature is unchanged, so it needs no redefinition here.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Guest order claim (M-021) ───────────────────────────────

create or replace function public.claim_my_guest_orders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email        text;
  v_confirmed_at timestamptz;
  v_claimed      integer;
begin
  -- Auto-confirm (Confirm email off) stamps email_confirmed_at in the same
  -- moment as created_at. A real confirmation link is clicked later, so
  -- the gap is what proves the address belongs to whoever signed up.
  select lower(trim(u.email)), u.email_confirmed_at
    into v_email, v_confirmed_at
  from auth.users u
  where u.id = auth.uid()
    and u.email_confirmed_at is not null
    and u.email_confirmed_at > u.created_at + interval '5 seconds';

  if v_email is null or v_email = '' then
    return 0;
  end if;

  -- Only orders already placed when the address was confirmed.
  update public.orders
     set user_id = auth.uid()
   where user_id is null
     and order_number is not null
     and lower(trim(customer_email)) = v_email
     and created_at <= v_confirmed_at;

  get diagnostics v_claimed = row_count;
  return v_claimed;
end;
$$;

revoke all on function public.claim_my_guest_orders() from public, anon;
grant execute on function public.claim_my_guest_orders() to authenticated;

-- ─── 2. Email queue health (M-010) ──────────────────────────────
--
-- As 048, with the email_queue check (5) also counting late retries.

create or replace function public.system_health_checks()
returns table (check_name text, status text, detail text)
language plpgsql
stable
security definer
set search_path = ''
as $fn$
#variable_conflict use_column
declare
  v_n        bigint;
  v_m        bigint;
  v_r        bigint;
  v_text     text;
  v_at       timestamptz;
  v_order_at timestamptz;
begin
  -- 1. Scheduled jobs present and active. The worker is the one that
  -- matters most; without the sweep, photos only cost storage.
  check_name := 'cron_jobs';
  begin
    select string_agg(j.name, ', ') into v_text
      from unnest(array['notification-worker', 'purge-rate-limit-hits',
                        'sweep-orphan-images', 'abandon-orphan-orders',
                        'health-digest']) as j(name)
     where not exists (select 1 from cron.job c
                        where c.jobname = j.name and c.active);
    status := case when v_text is null then 'ok'
                   when v_text like '%notification-worker%' then 'fail'
                   else 'warn' end;
    detail := coalesce('Missing or paused: ' || v_text, 'All scheduled jobs are active');
  exception when others then status := 'warn'; detail := 'Could not check: ' || sqlerrm;
  end;
  return next;

  -- 2. Job runs that failed in the last day.
  check_name := 'cron_failures';
  begin
    select count(*), max(left(d.return_message, 200)) into v_n, v_text
      from cron.job_run_details d
     where d.status = 'failed' and d.start_time > now() - interval '24 hours';
    status := case when v_n = 0 then 'ok' else 'fail' end;
    detail := case when v_n = 0 then 'No failed runs in 24 hours'
                   else v_n || ' failed runs in 24 hours, e.g. ' || coalesce(v_text, '?') end;
  exception when others then status := 'warn'; detail := 'Could not check: ' || sqlerrm;
  end;
  return next;

  -- 3. The Vault key the worker and the sweep use. By name only: the
  -- secret itself is never read here.
  check_name := 'vault_key';
  begin
    status := case when exists (select 1 from vault.secrets s where s.name = 'service_role_key')
                   then 'ok' else 'fail' end;
    detail := case when status = 'ok' then 'service_role_key is in Vault'
                   else 'No Vault secret named service_role_key: emails and the photo sweep cannot run' end;
  exception when others then status := 'warn'; detail := 'Could not check: ' || sqlerrm;
  end;
  return next;

  -- 4. Calls from the database to Edge Functions that failed. pg_net keeps
  -- responses for a few hours only, so this is recent, not the full day.
  check_name := 'function_calls';
  begin
    select count(*) into v_n
      from net._http_response r
     where r.created > now() - interval '24 hours'
       and (r.timed_out or r.error_msg is not null
            or r.status_code is null or r.status_code not between 200 and 299);
    status := case when v_n = 0 then 'ok' else 'warn' end;
    detail := case when v_n = 0 then 'No failed calls to Edge Functions'
                   else v_n || ' recent calls to Edge Functions failed or timed out' end;
  exception when others then status := 'warn'; detail := 'Could not check: ' || sqlerrm;
  end;
  return next;

  -- 5. Email backlog, and jobs still retrying past their fifth of eight
  -- attempts (046), which will fail soon if nothing changes.
  check_name := 'email_queue';
  begin
    select count(*) filter (where j.status = 'pending' and j.next_attempt_at < now() - interval '15 minutes'),
           count(*) filter (where j.status = 'failed' and j.created_at > now() - interval '7 days'),
           count(*) filter (where j.status = 'pending' and j.attempt_count > 5)
      into v_n, v_m, v_r
      from public.notification_jobs j;
    status := case when v_n > 0 then 'fail' when v_m + v_r > 0 then 'warn' else 'ok' end;
    detail := v_n || ' emails overdue by 15 minutes or more; ' || v_m || ' failed in 7 days; '
              || v_r || ' still retrying after 5 of 8 attempts';
  exception when others then status := 'warn'; detail := 'Could not check: ' || sqlerrm;
  end;
  return next;

  -- 6. Emails that could not be queued at all (042).
  check_name := 'email_enqueue_errors';
  begin
    select count(*) into v_n from public.notification_enqueue_errors e where e.resolved_at is null;
    status := case when v_n = 0 then 'ok' else 'fail' end;
    detail := v_n || ' emails could not be queued and are not marked resolved';
  exception when others then status := 'warn'; detail := 'Could not check: ' || sqlerrm;
  end;
  return next;

  -- 7. Checkouts still pending well after their 30-minute Stripe session
  -- ended: the expiry webhook did not arrive.
  check_name := 'stuck_payments';
  begin
    select count(*) into v_n from public.orders o
     where o.payment_status = 'pending' and o.stripe_session_id is not null
       and o.created_at < now() - interval '45 minutes';
    status := case when v_n = 0 then 'ok' else 'warn' end;
    detail := v_n || ' web orders still pending 45 minutes after checkout began';
  exception when others then status := 'warn'; detail := 'Could not check: ' || sqlerrm;
  end;
  return next;

  -- 8. Money that may have been taken twice (040), and payments with no
  -- order (029).
  check_name := 'payment_attention';
  begin
    select count(*) into v_n from public.orders o
     where o.attention_reason like '%Paid after a newer checkout%'
       and o.attention_raised_at > now() - interval '7 days';
    select count(*) into v_m from public.payment_alerts a where a.resolved_at is null;
    status := case when v_n + v_m = 0 then 'ok' else 'fail' end;
    detail := v_n || ' orders paid after a newer checkout (7 days); '
              || v_m || ' open payments with no order';
  exception when others then status := 'warn'; detail := 'Could not check: ' || sqlerrm;
  end;
  return next;

  -- 9. Webhook freshness: a checkout started over an hour ago has had
  -- time to complete or expire, and either sends an event.
  check_name := 'stripe_webhook';
  begin
    select max(greatest(l.processed_at, l.claimed_at)) into v_at from public.stripe_event_log l;
    select max(o.created_at) into v_order_at from public.orders o
     where o.channel = 'web' and o.stripe_session_id is not null
       and o.created_at between now() - interval '7 days' and now() - interval '1 hour';
    select count(*) filter (where l.status = 'failed' and l.claimed_at > now() - interval '7 days'),
           count(*) filter (where l.status = 'processing' and l.claimed_at < now() - interval '10 minutes')
      into v_n, v_m
      from public.stripe_event_log l;
    status := case when v_order_at is not null and (v_at is null or v_at < v_order_at) then 'fail'
                   when v_n + v_m > 0 then 'warn' else 'ok' end;
    detail := 'Last event ' || coalesce(to_char(v_at, 'YYYY-MM-DD HH24:MI'), 'never')
              || '; ' || v_n || ' failed (7 days); ' || v_m || ' stuck in processing';
  exception when others then status := 'warn'; detail := 'Could not check: ' || sqlerrm;
  end;
  return next;

  -- 10. The rates checkout reads.
  check_name := 'store_settings';
  begin
    status := case when exists (select 1 from public.store_settings s where s.id = 1)
                   then 'ok' else 'fail' end;
    detail := case when status = 'ok' then 'Delivery and VAT rates are set'
                   else 'store_settings row 1 is missing: checkout will fail' end;
  exception when others then status := 'warn'; detail := 'Could not check: ' || sqlerrm;
  end;
  return next;

  -- 11. The shop-wide checkout limit (200 an hour, shared by everyone).
  check_name := 'checkout_rate';
  begin
    select coalesce(sum(h.hits), 0) into v_n from public.rate_limit_hits h
     where h.key like 'checkout:all:%'
       and h.window_start = to_timestamp(floor(extract(epoch from now()) / 3600) * 3600);
    status := case when v_n >= 200 then 'fail' when v_n > 160 then 'warn' else 'ok' end;
    detail := v_n || ' of 200 checkouts used this hour';
  exception when others then status := 'warn'; detail := 'Could not check: ' || sqlerrm;
  end;
  return next;

  -- 12. Failed Turnstile checks (the scope L2 counts them under).
  check_name := 'turnstile_failures';
  begin
    select coalesce(sum(h.hits), 0) into v_n from public.rate_limit_hits h
     where h.key like 'turnstile:fail:%' and h.window_start > now() - interval '24 hours';
    status := case when v_n > 50 then 'warn' else 'ok' end;
    detail := v_n || ' failed bot checks in 24 hours';
  exception when others then status := 'warn'; detail := 'Could not check: ' || sqlerrm;
  end;
  return next;

  -- 13. The daily orphan clean-up (040) is running.
  check_name := 'orphan_orders';
  begin
    select r.last_run_at into v_at from public.maintenance_runs r where r.job = 'abandon-orphan-orders';
    select count(*) into v_n from public.orders o
     where o.payment_status = 'pending' and o.stripe_session_id is null
       and o.channel = 'web' and o.created_at < now() - interval '26 hours';
    status := case when v_at is null or v_at < now() - interval '26 hours' then 'warn'
                   when v_n > 0 then 'warn' else 'ok' end;
    detail := 'Clean-up last ran ' || coalesce(to_char(v_at, 'YYYY-MM-DD HH24:MI'), 'never')
              || '; ' || v_n || ' web orders pending with no Stripe session for over a day';
  exception when others then status := 'warn'; detail := 'Could not check: ' || sqlerrm;
  end;
  return next;
end;
$fn$;

revoke all on function public.system_health_checks() from public, anon, authenticated;
grant execute on function public.system_health_checks() to service_role;

notify pgrst, 'reload schema';
