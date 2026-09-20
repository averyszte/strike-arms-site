-- ═══════════════════════════════════════════════════════════════
-- 018 — Condition: is this gun new or secondhand?
--
-- Until now "pre-loved" was not a fact the database held. It was three
-- conventions agreeing with each other by hand:
--
--   * a `pre-loved-` prefix on the slug,
--   * the tags pre-loved / secondhand / sold-as-seen,
--   * a sentence appended to the description.
--
-- Tags are rendered nowhere on the storefront, so the only one of those a
-- customer could actually see was the sentence -- and only if they opened the
-- product and read the paragraph. A €160 secondhand CYMA AKSU sat in
-- /store/rifles/aeg-rifles beside new rifles with nothing on the card to tell
-- them apart.
--
-- Alan's instruction was the opposite of subtle: "We will have to stress that
-- these rifles or pistols are sold as seen and are secondhand." A convention
-- somebody has to remember to type is the weakest possible way to honour that.
-- This makes it a column, so the shop can badge it, filter on it and declare it
-- in structured data.
--
-- Text with a check rather than an enum, matching orders.payment_status and the
-- rest of this schema: adding a value later is a check constraint swap, not an
-- ALTER TYPE that cannot run inside some transactions.
--
-- Default 'new' because that is what almost everything is, and because a
-- default of anything else would quietly relabel the existing catalogue.
-- ═══════════════════════════════════════════════════════════════

alter table products
  add column if not exists condition text not null default 'new'
    check (condition in ('new', 'pre-loved'));

comment on column products.condition is
  'new or pre-loved. Drives the storefront badge, the condition filter and schema.org itemCondition. Set it -- do not rely on the slug prefix or the tags.';

-- ═══════════════════════════════════════════════════════════════
-- Backfill
--
-- Both signals are checked, not just the slug. The importer writes the prefix
-- and the tag together, so today they agree; a row hand-added in the admin with
-- the tag and no prefix is still secondhand, and missing it would leave a used
-- rifle advertised as new.
--
-- The count is raised rather than assumed. The import put 14 pre-loved rows in,
-- so anything other than 14 here means the catalogue is not what we think it is
-- and is worth stopping for.
-- ═══════════════════════════════════════════════════════════════

do $$
declare
  relabelled int;
begin
  update public.products
     set condition = 'pre-loved'
   where condition = 'new'
     and (slug like 'pre-loved-%' or 'pre-loved' = any(tags));

  get diagnostics relabelled = row_count;
  raise notice 'Marked % product(s) as pre-loved', relabelled;
end $$;

-- The storefront's condition filter always runs with is_published pinned, so
-- the index leads with it -- same shape as idx_products_published_category.
create index if not exists idx_products_published_condition
  on products (is_published, condition);

notify pgrst, 'reload schema';
