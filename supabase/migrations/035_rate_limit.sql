-- 035: rate limit for the public Edge Functions (Phase 2 item 17).
--
-- create-checkout-session and order-lookup are open to anyone. Turnstile
-- stops most bots; this caps what a person, or a bot that gets past it, can do
-- from one address or against one order. Checkout matters most: every call
-- holds stock for 35 minutes, so a flood of calls could empty the shop without
-- paying for anything.
--
-- Fixed windows, counted per key. The key is built in the function
-- (_shared/rate-limit.ts), e.g. "checkout:ip:<sha-256 of the address>". IP
-- addresses are hashed there, so none is stored here in the clear.
--
-- Only the service role can call hit_rate_limit(). The table has RLS on and no
-- policies, so anon and authenticated can neither read nor write it.

create table if not exists public.rate_limit_hits (
  key          text        not null,
  window_start timestamptz not null,
  hits         integer     not null default 0,
  primary key (key, window_start)
);

alter table public.rate_limit_hits enable row level security;

revoke all on public.rate_limit_hits from public, anon, authenticated;
grant all on public.rate_limit_hits to service_role;

-- Counts one hit on p_key and says whether it is still within p_max for the
-- current window of p_window_seconds. The upsert is one statement, so two
-- requests at the same moment cannot both read the old count.
create or replace function public.hit_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_window timestamptz;
  v_hits   integer;
begin
  if p_key is null or length(p_key) = 0 or length(p_key) > 200 then
    raise exception 'rate limit key is missing or too long';
  end if;
  if p_max < 1 or p_window_seconds < 1 then
    raise exception 'rate limit max and window must be positive';
  end if;

  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.rate_limit_hits as r (key, window_start, hits)
  values (p_key, v_window, 1)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning r.hits into v_hits;

  return v_hits <= p_max;
end;
$fn$;

revoke all on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;

-- Old windows are no use once they have passed. The longest window used is an
-- hour, so anything older than a day can go.
create or replace function public.purge_rate_limit_hits()
returns void
language sql
security definer
set search_path = ''
as $fn$
  delete from public.rate_limit_hits where window_start < now() - interval '1 day';
$fn$;

revoke all on function public.purge_rate_limit_hits() from public, anon, authenticated;

create extension if not exists pg_cron;

-- Same re-runnable pattern as 012: unschedule through the extension's API,
-- ignoring the error when the job does not exist yet.
do $cron$
begin
  perform cron.unschedule('purge-rate-limit-hits');
exception
  when others then null;  -- not scheduled yet
end
$cron$;

select cron.schedule(
  'purge-rate-limit-hits',
  '17 3 * * *',
  $job$ select public.purge_rate_limit_hits(); $job$
);
