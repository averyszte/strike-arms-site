-- ═══════════════════════════════════════════════════════════════
-- 021 -- retire the Parts category
--
-- Strike Arms does not sell parts; the workshop fits and repairs, it does not
-- retail internals. The app no longer has a 'parts' category, so:
--
--   * the four jumble items batch 2 filed under parts/external-parts move to
--     accessories/rails, beside the RIS rails already there. Their 'jumble'
--     tag is untouched, so they stay on the Jumble shelf.
--   * the parts subcategory rows seeded by 005 are removed, so the admin
--     Categories page stops listing them.
-- ═══════════════════════════════════════════════════════════════

update products
set category = 'accessories',
    subcategory = 'rails'
where category = 'parts'
  and slug in (
    'm4-magpul-style-fore-end',
    'm4a1-style-stock-smooth',
    'm4a1-style-stock-ribbed',
    'ak-74-rear-sight-assembly'
  );

delete from subcategories where category = 'parts';
