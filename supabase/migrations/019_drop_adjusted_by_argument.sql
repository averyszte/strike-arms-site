-- ═══════════════════════════════════════════════════════════════
-- 019 -- adjust_stock loses its p_adjusted_by argument
--
-- Migration 014 made adjust_stock attribute every ledger row to auth.uid()
-- and ignore p_adjusted_by, but kept the argument so the database and the
-- front end could be deployed in either order. 014 is applied, so the
-- argument is now dead weight that invites a caller to believe it does
-- something.
--
-- A changed argument list is a different function in Postgres, so the old
-- signature is dropped rather than replaced. The body is 014's, unchanged.
--
-- Order of deployment: the front end stopped sending p_adjusted_by in the
-- same commit. That build works against either signature (the old one
-- defaulted the argument), so ship the front end first or together.
-- ═══════════════════════════════════════════════════════════════

drop function if exists public.adjust_stock(uuid, int, text, uuid);

create function public.adjust_stock(
  p_product_id  uuid,
  p_adjustment  int,
  p_reason      text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
begin
  if not public.is_admin_aal2() then
    raise exception 'not authorised' using errcode = '42501';
  end if;

  update products
     set stock_count = stock_count + p_adjustment
   where id = p_product_id;

  if not found then
    raise exception 'product % not found', p_product_id;
  end if;

  insert into inventory_adjustments (product_id, adjustment, reason, adjusted_by)
    values (p_product_id, p_adjustment, p_reason, auth.uid());
end;
$fn$;

revoke all on function public.adjust_stock(uuid, int, text)
  from public, anon;
grant execute on function public.adjust_stock(uuid, int, text)
  to authenticated;

comment on function public.adjust_stock(uuid, int, text) is
  'Admin stock adjustment. Requires an AAL2 admin session. The ledger row is attributed to auth.uid().';
