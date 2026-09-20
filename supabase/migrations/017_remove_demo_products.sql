-- Remove the 56 demo products seeded by supabase/seed.sql.
--
-- Alan's real stock is in (A1.2), so the placeholder catalogue is now the only
-- thing the shop would show a customer that is not true. seed.sql warns about
-- itself at the top: the brands were invented before we knew the real range,
-- and it lists G&G, Krytac, VFC and ICS, which Strike Arms does not sell.
--
-- Deleting by the exact seeded slug list rather than by a heuristic -- "looks
-- like demo data" is a guess, and a wrong guess here deletes real stock. The
-- 56 slugs below are read straight out of seed.sql and were checked against
-- the 64 imported slugs: no overlap, so nothing real can match.
--
-- Safe to delete rather than unpublish because of how the schema was built:
--   order_items.product_id  is ON DELETE SET NULL, and the row keeps its own
--                           slug, name, image, brand and unit price -- so a
--                           past order still prints correctly afterwards.
--   inventory_adjustments   is ON DELETE CASCADE (audit rows for a product
--                           that no longer exists).
--   checkout_reservations   is ON DELETE CASCADE (30-minute holds).
-- No foreign key can block this and no order history is lost.
--
-- Re-runnable: a second run matches nothing.

do $$
declare
  removed int;
begin
  delete from public.products
  where slug in (
    'specna-arms-sa-e03-edge-aeg',
    'specna-arms-sa-e09-edge-aeg',
    'gg-cm16-raider-aeg',
    'gg-tr16-index-crb-aeg',
    'ics-cxp-mmr-aeg',
    'krytac-trident-crb-aeg',
    'tokyo-marui-m4-sopmod-next-gen',
    'asg-scorpion-evo-3-a1-aeg',
    'ics-cxp-predator-smg-aeg',
    'specna-arms-sa-j02-core-smg',
    'tokyo-marui-mws-gbbr',
    'we-m4-gbbr-open-bolt',
    'vfc-hk416-gbbr',
    'specna-arms-sa-s02-core-sniper',
    'asg-mcmillan-m40a3-sniper',
    'tokyo-marui-hi-capa-51-gbb',
    'tokyo-marui-glock-17-gbb',
    'we-glock-17-gen4-gbb',
    'we-m9a1-full-metal-gbb',
    'vorsk-eu17-gbb',
    'asg-cz-p09-gbb',
    'nuprol-raven-r3-gbb',
    'vfc-glock-45-gbb',
    'tokyo-marui-m9a1-biohazard',
    'gg-gtp9-gbb',
    'asg-dan-wesson-715-revolver',
    'nuprol-delta-whisper-electric-pistol',
    'valken-accelerate-020g-bbs-5000',
    'valken-accelerate-bio-025g-bbs',
    'nuprol-028g-precision-bbs-4000',
    'asg-blaster-020g-bbs-2000',
    'nuprol-20-green-gas-500ml',
    'nuprol-40-ultra-green-gas-500ml',
    'asg-12g-co2-capsules-x12',
    'valken-lipo-74v-1300mah-battery',
    'specna-arms-t2-red-dot',
    'asg-3-9x40-scope',
    'nuprol-nx-series-flashlight',
    'valken-v-tactical-suppressor',
    'asg-evo-magazine-110rd',
    'krytac-qd-sling-mount',
    'valken-2-point-sling',
    'nuprol-molle-pistol-holster',
    'nuprol-pmc-chest-rig',
    'valken-battle-belt',
    'asg-strike-balaclava',
    'nuprol-battle-helmet',
    'valken-zulu-tactical-goggles',
    'nuprol-pmc-plate-carrier',
    'asg-strike-combat-gloves',
    'zci-602mm-tightbore-inner-barrel-363mm',
    'shs-18-1-high-torque-steel-gear-set',
    'perun-v2-optical-mosfet',
    'acetech-ac6000-chronograph',
    'airsoft-cleaning-rod-kit',
    'compact-folding-camp-stool'
  );

  get diagnostics removed = row_count;
  raise notice 'Removed % demo product(s) seeded by seed.sql', removed;
end $$;
