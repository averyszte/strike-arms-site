-- ═══════════════════════════════════════════════════════════════
-- 052: every product can be posted
--
-- At the owner's request every product is marked as one that can be
-- posted, and new products are by default. A basket then never splits into
-- a collection and a parcel, so checkout no longer makes mixed orders.
--
-- Delivery itself stays switched off: the cart still offers collection
-- only, with "Coming soon" on delivery. This only readies the catalogue.
-- Alan can still mark a single product collection-only in the admin.
-- ═══════════════════════════════════════════════════════════════

update public.products
set is_shippable = true
where not is_shippable;

alter table public.products alter column is_shippable set default true;
