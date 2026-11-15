-- ═══════════════════════════════════════════════════════════════
-- 050: ID checked at collection
--
-- Phase 2 audit, N-084 (Phil's decision PD10).
--
-- The checkout tick is stored as age_verified, but it is only the
-- customer saying they are 18 or over. Terms, Delivery and the
-- collection email say photo ID is checked when the order is collected,
-- and nothing recorded that it was. Two columns now record who checked
-- and when, set from the admin's "ID checked" confirm when a collection
-- order is marked collected.
--
-- The admin sends only id_checked_at. The trigger replaces it with the
-- database clock and stamps the signed-in user, so neither can be typed
-- in from the browser. Once recorded it cannot be changed or cleared
-- through the API: it is a record of something that happened.
--
-- Nothing here makes the check compulsory. Counter sales (P-06) and
-- bulk moves stay as they were; the column simply stays null.
-- ═══════════════════════════════════════════════════════════════

alter table public.orders
  add column if not exists id_checked_at timestamptz,
  add column if not exists id_checked_by uuid references auth.users (id) on delete set null;

comment on column public.orders.id_checked_at is
  'When staff confirmed they saw photo ID at collection (N-084). Set by stamp_id_check().';
comment on column public.orders.id_checked_by is
  'The admin who confirmed the photo ID check at collection (N-084).';

create or replace function public.stamp_id_check()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.id_checked_at is not null then
    -- Already recorded: keep the original record whatever was sent.
    new.id_checked_at := old.id_checked_at;
    new.id_checked_by := old.id_checked_by;
  elsif new.id_checked_at is not null then
    new.id_checked_at := now();
    new.id_checked_by := auth.uid();
  end if;
  return new;
end;
$$;

revoke all on function public.stamp_id_check() from public, anon, authenticated;

drop trigger if exists orders_stamp_id_check on public.orders;
create trigger orders_stamp_id_check
  before update of id_checked_at on public.orders
  for each row execute function public.stamp_id_check();

-- The admin update policy (023) still decides which rows; this only adds
-- the column to the ones authenticated may set (034). id_checked_by is
-- deliberately not granted: the trigger writes it.
grant update (id_checked_at) on public.orders to authenticated;
