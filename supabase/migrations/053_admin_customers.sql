-- ═══════════════════════════════════════════════════════════════
-- 053: the admin Customers page
--
-- One read for /admin/customers: every customer account with its sign-up
-- and sign-in dates, profile, marketing choice and what it has ordered.
--
-- The email and the sign-in dates live in auth.users, which the browser
-- cannot read, so this is a definer function and checks is_admin_aal2()
-- itself, like system_health() (048). Admins (public.admins) are left out:
-- the page is about the shop's customers, not its staff.
--
-- Orders are counted the way the dashboard counts them
-- (lib/admin-dashboard-metrics.ts): paid, partially refunded and refunded
-- orders are orders; spend is net of refunds and only from paid and
-- partially refunded ones. Unpaid checkouts have no order number and are
-- left out. Guest orders count once claim_my_guest_orders() (034) has
-- linked them to the account.
-- ═══════════════════════════════════════════════════════════════

create or replace function public.admin_customers()
returns table (
  user_id            uuid,
  email              text,
  full_name          text,
  phone              text,
  marketing_opt_in   boolean,
  created_at         timestamptz,
  email_confirmed_at timestamptz,
  last_sign_in_at    timestamptz,
  order_count        integer,
  spent_cents        bigint,
  last_order_at      timestamptz
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
         u.email::text,
         coalesce(p.full_name, ''),
         coalesce(p.phone, ''),
         coalesce(p.marketing_opt_in, false),
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
             sum(case when ord.payment_status in ('paid', 'partially_refunded')
                      then ord.total_cents - ord.refund_cents else 0 end) as spent_cents,
             max(coalesce(ord.paid_at, ord.created_at)) as last_order_at
        from public.orders ord
       where ord.user_id = u.id
         and ord.order_number is not null
         and ord.payment_status in ('paid', 'partially_refunded', 'refunded')
    ) o on true
   where not exists (select 1 from public.admins a where a.id = u.id)
   order by u.created_at desc;
end;
$fn$;

comment on function public.admin_customers() is
  'Every customer account (admins left out) with its orders, for /admin/customers. Admin with two-factor only.';

revoke all on function public.admin_customers() from public, anon;
grant execute on function public.admin_customers() to authenticated;
