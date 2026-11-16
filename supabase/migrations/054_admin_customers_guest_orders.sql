-- ═══════════════════════════════════════════════════════════════
-- 054: admin_customers() counts guest orders and the opt-in date
--
-- 053 only counted orders whose user_id points at the account. Guest
-- orders are linked by claim_my_guest_orders() (034), but that only runs
-- when the customer opens My Orders, so someone who checked out as a guest
-- and then signed up showed 0 orders. This version also counts unlinked
-- orders (user_id null) whose email matches a confirmed account, the same
-- rule the claim function uses. It reads only; nothing is relinked.
--
-- Also:
--   - returns marketing_opt_in_at, the record of when they said yes;
--   - email is never null (phone-only or anonymous users have none);
--   - anonymous and soft-deleted auth users are left out.
--
-- Orders still count as on the dashboard (lib/admin-dashboard-metrics.ts
-- wasPaid) and spend as revenue does (lib/order-revenue.ts): paid,
-- partially refunded and refunded are orders; spend is net of refunds
-- from paid and partially refunded ones.
-- ═══════════════════════════════════════════════════════════════

-- The guest-order match is on the trimmed lower-case email, which the plain
-- idx_orders_customer_email (003) cannot serve.
create index if not exists idx_orders_guest_email_lower
  on public.orders (lower(trim(customer_email)))
  where user_id is null and order_number is not null;

-- The return type changes, so the old function has to go first.
drop function if exists public.admin_customers();

create function public.admin_customers()
returns table (
  user_id             uuid,
  email               text,
  full_name           text,
  phone               text,
  marketing_opt_in    boolean,
  marketing_opt_in_at timestamptz,
  created_at          timestamptz,
  email_confirmed_at  timestamptz,
  last_sign_in_at     timestamptz,
  order_count         integer,
  spent_cents         bigint,
  last_order_at       timestamptz
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
  select u.id,
         coalesce(u.email::text, ''),
         coalesce(p.full_name, ''),
         coalesce(p.phone, ''),
         coalesce(p.marketing_opt_in, false),
         p.marketing_opt_in_at,
         u.created_at,
         u.email_confirmed_at,
         u.last_sign_in_at,
         coalesce(o.order_count, 0)::integer,
         coalesce(o.spent_cents, 0)::bigint,
         o.last_order_at
    from auth.users u
    left join public.customer_profiles p on p.user_id = u.id
    left join lateral (
      select count(*) as order_count,
             sum(case when mine.payment_status in ('paid', 'partially_refunded')
                      then mine.total_cents - mine.refund_cents else 0 end) as spent_cents,
             max(coalesce(mine.paid_at, mine.created_at)) as last_order_at
        from (
          select ord.payment_status, ord.total_cents, ord.refund_cents, ord.paid_at, ord.created_at
            from public.orders ord
           where ord.user_id = u.id
             and ord.order_number is not null
             and ord.payment_status in ('paid', 'partially_refunded', 'refunded')
          union all
          select ord.payment_status, ord.total_cents, ord.refund_cents, ord.paid_at, ord.created_at
            from public.orders ord
           where ord.user_id is null
             and u.email_confirmed_at is not null
             and u.email is not null
             and ord.order_number is not null
             and lower(trim(ord.customer_email)) = lower(trim(u.email::text))
             and ord.payment_status in ('paid', 'partially_refunded', 'refunded')
        ) mine
    ) o on true
   where not exists (select 1 from public.admins a where a.id = u.id)
     and u.deleted_at is null
     and not coalesce(u.is_anonymous, false)
   order by u.created_at desc;
end;
$fn$;

comment on function public.admin_customers() is
  'Every customer account (admins left out) with its orders, including unlinked guest orders under the same confirmed email, for /admin/customers. Admin with two-factor only.';

revoke all on function public.admin_customers() from public, anon;
grant execute on function public.admin_customers() to authenticated;
