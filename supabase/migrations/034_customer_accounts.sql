-- Strike Arms: 034 customer accounts
--
-- Real customer sign-in (docs/customer-accounts-plan.md, Part 2). Replaces
-- decision D1 (guest checkout only). Guest checkout stays; an account is
-- optional.
--
-- What a signed-in customer can reach, and how:
--
--   customer_profiles  their own row, through RLS. Name and phone editable
--                      directly; the marketing choice only through
--                      set_marketing_opt_in(), so its timestamp is honest.
--   their orders       NOT through table policies. my_orders() returns them
--                      in the same shape as the order-lookup function: no
--                      staff notes, Stripe ids, address or attention flags.
--   guest orders       claim_my_guest_orders() links earlier guest orders
--                      placed with the account's email, once that email is
--                      confirmed.
--
-- orders.user_id is set by create-checkout-session from the verified JWT,
-- never from the request body, and by claim_my_guest_orders().
--
-- 004 gave `authenticated` ALL on orders, order_items and order_status_log.
-- That was safe while every authenticated user was an admin, because the
-- policies still needed is_admin_aal2(). With customers signing in it is
-- still safe (the policies have not changed), but the grants are narrowed
-- to what the admin screens actually do, so a future policy mistake cannot
-- hand a customer insert or delete:
--   orders           select; update of the four columns the admin edits
--   order_items      select (restock_cancelled_order reads it as the invoker)
--   order_status_log select, insert (log_order_status_change runs as the
--                    invoker, so the admin's own update writes the log row)
-- Checkout, counter sales and refunds all write through definer functions or
-- the service role, which these grants do not touch.

-- 1. orders.user_id

alter table public.orders
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists idx_orders_user_id on public.orders (user_id)
  where user_id is not null;

comment on column public.orders.user_id is
  'The customer account the order belongs to, if any. Null for guest orders and after the account is deleted.';

-- 2. customer_profiles

create table if not exists public.customer_profiles (
  user_id              uuid        primary key references auth.users (id) on delete cascade,
  full_name            text        not null default '' check (char_length(full_name) <= 120),
  phone                text        not null default '' check (char_length(phone) <= 30),
  marketing_opt_in     boolean     not null default false,
  marketing_opt_in_at  timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

comment on table public.customer_profiles is
  'One row per customer account, made by handle_new_customer(). Deleted with the auth user.';
comment on column public.customer_profiles.marketing_opt_in_at is
  'When the customer said yes to marketing email. Cleared when they say no.';

drop trigger if exists customer_profiles_updated_at on public.customer_profiles;
create trigger customer_profiles_updated_at
  before update on public.customer_profiles
  for each row execute function public.set_updated_at();

alter table public.customer_profiles enable row level security;

drop policy if exists "customer read own profile" on public.customer_profiles;
create policy "customer read own profile"
  on public.customer_profiles for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "customer update own profile" on public.customer_profiles;
create policy "customer update own profile"
  on public.customer_profiles for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "admin read customer profiles" on public.customer_profiles;
create policy "admin read customer profiles"
  on public.customer_profiles for select to authenticated
  using ((select public.is_admin_aal2()));

revoke all on public.customer_profiles from public, anon, authenticated;
grant select on public.customer_profiles to authenticated;
grant update (full_name, phone) on public.customer_profiles to authenticated;
grant all on public.customer_profiles to service_role;

-- 3. A profile for every new account
--
-- Fires for invited admins too (Supabase inserts them before it sets
-- invited_at, see 027). An admin with an empty profile row is harmless.

create or replace function public.handle_new_customer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.customer_profiles (user_id, full_name)
  values (
    new.id,
    left(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), 120)
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_customer() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_customer();

insert into public.customer_profiles (user_id)
select u.id from auth.users u
on conflict (user_id) do nothing;

-- 4. my_orders()
--
-- The caller's paid orders, newest first, in the order-lookup shape
-- (src/types/order-lookup.ts LookedUpOrder). Unpaid checkouts have no order
-- number and are left out.

create or replace function public.my_orders()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(o.doc order by o.placed_at desc), '[]'::jsonb)
  from (
    select coalesce(ord.paid_at, ord.created_at) as placed_at,
           jsonb_build_object(
             'orderNumber',       ord.order_number,
             'placedAt',          coalesce(ord.paid_at, ord.created_at),
             'paymentStatus',     ord.payment_status,
             'fulfillmentStatus', ord.fulfillment_status,
             'fulfillmentMethod', ord.fulfillment_method,
             'totalCents',        ord.total_cents,
             'shippingCents',     ord.shipping_cents,
             'refundCents',       ord.refund_cents,
             'trackingNumber',    ord.tracking_number,
             'items', coalesce((
               select jsonb_agg(jsonb_build_object(
                        'slug',             i.product_slug,
                        'name',             i.product_name,
                        'brand',            i.brand,
                        'unitPriceCents',   i.unit_price_cents,
                        'quantity',         i.quantity,
                        'subtotalCents',    i.subtotal_cents,
                        'fulfillmentMethod', i.fulfillment_method
                      ) order by i.product_name)
               from public.order_items i
               where i.order_id = ord.id
             ), '[]'::jsonb),
             'history', coalesce((
               select jsonb_agg(jsonb_build_object('status', l.to_status, 'at', l.created_at)
                                order by l.created_at)
               from public.order_status_log l
               where l.order_id = ord.id and l.field = 'fulfillment_status'
             ), '[]'::jsonb)
           ) as doc
    from public.orders ord
    where ord.user_id = auth.uid()
      and ord.order_number is not null
  ) o;
$$;

comment on function public.my_orders() is
  'The signed-in customer''s orders for /account, without staff-only fields.';

-- 5. claim_my_guest_orders()
--
-- Links guest orders placed with the account's email. Only once the email is
-- confirmed: otherwise anyone could sign up with someone else's address and
-- read their orders. Never takes an order another account already holds.

create or replace function public.claim_my_guest_orders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text;
  v_claimed integer;
begin
  select lower(trim(u.email)) into v_email
  from auth.users u
  where u.id = auth.uid() and u.email_confirmed_at is not null;

  if v_email is null or v_email = '' then
    return 0;
  end if;

  update public.orders
     set user_id = auth.uid()
   where user_id is null
     and order_number is not null
     and lower(trim(customer_email)) = v_email;

  get diagnostics v_claimed = row_count;
  return v_claimed;
end;
$$;

comment on function public.claim_my_guest_orders() is
  'Links earlier guest orders to the signed-in customer, by confirmed email. Returns how many.';

-- 6. set_marketing_opt_in()

create or replace function public.set_marketing_opt_in(p_opt_in boolean)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.customer_profiles
     set marketing_opt_in    = p_opt_in,
         marketing_opt_in_at = case when p_opt_in then now() end
   where user_id = auth.uid()
     and marketing_opt_in is distinct from p_opt_in;
$$;

comment on function public.set_marketing_opt_in(boolean) is
  'The signed-in customer''s marketing email choice, stamped with when they said yes.';

revoke all on function public.my_orders() from public, anon;
revoke all on function public.claim_my_guest_orders() from public, anon;
revoke all on function public.set_marketing_opt_in(boolean) from public, anon;
grant execute on function public.my_orders() to authenticated;
grant execute on function public.claim_my_guest_orders() to authenticated;
grant execute on function public.set_marketing_opt_in(boolean) to authenticated;

-- 7. Narrow the 004 grants on orders

revoke all on public.orders from authenticated;
grant select on public.orders to authenticated;
grant update (fulfillment_status, notes, is_archived, tracking_number) on public.orders to authenticated;

revoke all on public.order_items from authenticated;
grant select on public.order_items to authenticated;

revoke all on public.order_status_log from authenticated;
grant select, insert on public.order_status_log to authenticated;
