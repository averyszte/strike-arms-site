-- Strike Arms: server-side product search (A4)
--
-- The header dropdown used to download the whole published catalogue -- capped
-- at 500 rows -- and score it in the browser. That works today with 56
-- products and stops working silently: at 501 the dropdown simply cannot see
-- the tail of the catalogue, and nothing anywhere says so. The store page's
-- ?q= did a three-column ilike and could not search tags at all.
--
-- This moves both to the database.
--
--   search_text      one generated column holding everything searchable,
--                    lowercased, tags included.
--   trigram index    so `like '%needle%'` on that column has an index to use.
--                    Without pg_trgm a leading-wildcard like is a sequential
--                    scan, which is the thing that eventually gets slow.
--   search_products  ranked search for the dropdown: one query, whole
--                    catalogue, best matches first.
--
-- The store page filters on search_text directly, so the dropdown and the
-- "View all results" page it links to agree on what matches. They did not
-- before -- tags were searched by neither, and now they are searched by both.
--
-- Cost: `select *` now carries search_text on every product read, which is the
-- other columns concatenated. It compresses to almost nothing over the wire
-- next to the rest of the row, and the alternative -- naming every column in
-- every query in products-repository.ts -- is a worse trade.

create extension if not exists pg_trgm;

-- ═══════════════════════════════════════════════════════════════
-- The searchable text
--
-- Lowercased here rather than at query time so the index is over the same
-- expression the query compares against. Every source column is NOT NULL, but
-- coalesce costs nothing and means a later nullable column can be added to the
-- list without turning the whole string null.
-- ═══════════════════════════════════════════════════════════════

alter table products
  add column if not exists search_text text
  generated always as (
    lower(
      coalesce(name, '') || ' ' ||
      coalesce(brand, '') || ' ' ||
      coalesce(short_description, '') || ' ' ||
      array_to_string(tags, ' ')
    )
  ) stored;

comment on column products.search_text is
  'Generated: lowercased name, brand, short description and tags. Read-only -- filter on it, never write it.';

create index if not exists idx_products_search_trgm
  on products using gin (search_text gin_trgm_ops);

-- ═══════════════════════════════════════════════════════════════
-- search_products -- ranked results for the header dropdown
--
-- security invoker on purpose: the products policies then apply as they do to
-- any other read, so an anonymous caller sees published rows and nothing else.
-- is_published is pinned as well, because an admin passes the "read all
-- products" policy and must not get drafts in the public search box.
--
-- Ranking mirrors what the browser used to do, and for the same reason: a name
-- that starts with what you typed is what you meant, a name that contains it
-- probably is, and a description that mentions it probably is not. Stock is the
-- tiebreak -- between two equal matches, the one that can be bought is the more
-- useful answer.
--
-- p_query is stripped of like wildcards before use. It arrives as a bind
-- parameter so there is no injection to worry about, but an unstripped
-- underscore is a single-character wildcard, and a user typing "m_4" would get
-- results they cannot explain.
-- ═══════════════════════════════════════════════════════════════

create or replace function search_products(
  p_query text,
  p_limit int default 12
)
returns setof products
language sql
stable
security invoker
set search_path = pg_catalog, public
as $fn$
  with needle as (
    -- Trimmed after the wildcards are stripped, not before: a query of
    -- "%%" would otherwise arrive here as two spaces and match every row.
    select btrim(translate(lower(coalesce(p_query, '')), '%_\', '   ')) as q
  )
  select p.*
  from products p, needle n
  where p.is_published
    -- Two characters is the point below which every result is noise. The
    -- client enforces it too; this is the half that cannot be skipped.
    and length(n.q) >= 2
    and p.search_text like '%' || n.q || '%'
  order by
    (
      case
        when lower(p.name) like n.q || '%' then 10
        when lower(p.name) like '%' || n.q || '%' then 6
        else 0
      end
      + case when lower(p.brand) like '%' || n.q || '%' then 4 else 0 end
      + case when lower(array_to_string(p.tags, ' ')) like '%' || n.q || '%' then 2 else 0 end
      + case when lower(p.short_description) like '%' || n.q || '%' then 1 else 0 end
    ) desc,
    p.in_stock desc,
    p.name asc,
    p.id asc
  -- Clamped rather than trusted. This is callable by anonymous visitors, and
  -- an unbounded limit turns a search box into a catalogue download.
  limit least(greatest(coalesce(p_limit, 12), 1), 50);
$fn$;

-- Postgres grants EXECUTE to PUBLIC by default, which happens to be what this
-- one wants -- but it is spelled out, because "the default was right this
-- time" is not something the next reader can tell from silence.
revoke all on function public.search_products(text, int) from public;
grant execute on function public.search_products(text, int) to anon, authenticated;

comment on function public.search_products(text, int) is
  'Ranked product search for the storefront. Published rows only; RLS applies as the calling role.';

notify pgrst, 'reload schema';
