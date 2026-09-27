-- ═══════════════════════════════════════════════════════════════
-- 026: product archive and the stock filter
--
-- Deleting a product cascaded away its stock ledger and left its order
-- lines pointing at nothing. And the admin could only find low stock by
-- scrolling, because "sellable" is two columns and PostgREST cannot filter
-- on an expression.
--
-- 1. products.sellable_count, stock_count - reserved_count, stored so the
--    products list can filter and page on it server-side.
-- 2. products.is_archived and archived_at. An archived product is never
--    published, and products can no longer be deleted from the browser.
-- 3. A subcategory cannot be deleted while a product that is not archived
--    still uses it.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Sellable count ──────────────────────────────────────────
--
-- The same sum as in_stock (001) and sellableCount in
-- src/lib/stock-levels.ts. Change them together.

alter table public.products
  add column if not exists sellable_count int
  generated always as (stock_count - reserved_count) stored;

-- ─── 2. Archive instead of delete ───────────────────────────────

alter table public.products
  add column if not exists is_archived bool        not null default false,
  add column if not exists archived_at timestamptz;

alter table public.products
  drop constraint if exists products_archived_not_published;
alter table public.products
  add constraint products_archived_not_published
  check (not (is_archived and is_published));

-- Deleting is gone from the admin, so it goes from the database too. The
-- SQL editor (as postgres) can still delete a product made by mistake.
drop policy if exists "admin delete products" on public.products;
revoke delete, truncate on public.products from anon, authenticated;

-- ─── 3. Subcategories in use cannot be deleted ─────────────────
--
-- products.subcategory is the subcategory's slug as text, not a foreign
-- key, so nothing stopped a delete from stranding live products under a
-- subcategory the storefront no longer lists. Archived products do not
-- block it: they are off the shop, and restoring one means editing it.
--
-- security definer so the count sees every product whatever the caller's
-- read policy is.

create or replace function public.guard_subcategory_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count int;
begin
  select count(*) into v_count
    from public.products
   where category = old.category
     and subcategory = old.slug
     and not is_archived;

  if v_count > 0 then
    raise exception '% is used by % product%. Move them to another subcategory or archive them first.',
      old.name, v_count, case when v_count = 1 then '' else 's' end
      using errcode = 'foreign_key_violation';
  end if;

  return old;
end;
$$;

drop trigger if exists subcategories_guard_delete on public.subcategories;
create trigger subcategories_guard_delete
  before delete on public.subcategories
  for each row execute function public.guard_subcategory_delete();

revoke all on function public.guard_subcategory_delete() from public, anon, authenticated;
