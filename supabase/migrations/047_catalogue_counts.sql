-- ═══════════════════════════════════════════════════════════════
-- 047: shelf and brand counts
--
-- Pre-launch audit, L3, M-051. The storefront loaded whole product lists
-- only to count them. This view gives the counts in one small read.
--
-- One row per facet value, published products only:
--
--   facet            category   subcategory   brand
--   category         set        null          null
--   subcategory      set        set           null
--   brand            null       null          set
--   brand_category   set        null          set
--
-- product_count is every published product in the group; in_stock_count
-- is those ticked in stock (038).
--
-- security_invoker, so the products RLS policy (published rows only for
-- the public) applies as it does to a direct read; the where clause keeps
-- an admin's read to the same published-only numbers.
-- ═══════════════════════════════════════════════════════════════

create or replace view public.catalogue_counts
with (security_invoker = true)
as
select
  case grouping(p.category, p.subcategory, p.brand)
    when 3 then 'category'
    when 1 then 'subcategory'
    when 6 then 'brand'
    when 2 then 'brand_category'
  end                                       as facet,
  p.category,
  p.subcategory,
  p.brand,
  count(*)::int                             as product_count,
  (count(*) filter (where p.in_stock))::int as in_stock_count
from public.products p
where p.is_published
group by grouping sets (
  (p.category),
  (p.category, p.subcategory),
  (p.brand),
  (p.brand, p.category)
);

comment on view public.catalogue_counts is
  'Published product counts by category, subcategory, brand, and brand within category (047). Read with a filter on facet.';

revoke all on public.catalogue_counts from public, anon, authenticated;
grant select on public.catalogue_counts to anon, authenticated;
grant select on public.catalogue_counts to service_role;

notify pgrst, 'reload schema';
