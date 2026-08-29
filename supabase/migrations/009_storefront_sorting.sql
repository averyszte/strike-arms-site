-- ═══════════════════════════════════════════════════════════════
-- 009 — Storefront sorting support
--
-- The shop sorts by the price a customer actually pays, which is the
-- sale price when one is set and the list price otherwise. PostgREST
-- cannot order by an expression, so the coalesce is materialised as a
-- generated column and indexed.
--
-- Without this, a discounted product sorts by its pre-discount price
-- and appears in the wrong place in "price: low to high".
-- ═══════════════════════════════════════════════════════════════

alter table products
  add column if not exists effective_price_cents int
  generated always as (coalesce(sale_price_cents, price_cents)) stored;

-- Storefront list queries: every one of them filters on is_published and
-- then sorts on one of these columns.
create index if not exists idx_products_effective_price
  on products (effective_price_cents);

create index if not exists idx_products_created_at
  on products (created_at desc);

create index if not exists idx_products_published_category
  on products (is_published, category);
