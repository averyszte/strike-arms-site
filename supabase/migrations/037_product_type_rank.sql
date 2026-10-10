-- ═══════════════════════════════════════════════════════════════
-- 037 — Product type rank
--
-- The shop's default "Featured" sort was is_featured, then newest. Nothing
-- is featured and the catalogue import gave every product nearly the same
-- created_at, so every listing came out in an order that looked random.
--
-- type_rank orders products by how much demand their type has in an
-- airsoft shop: the main guns, BBs, gas and batteries first, then the
-- other guns, then magazines, gear and parts, wallhangers last. Every gun
-- type sits before magazines so a category page leads with guns. It is
-- one global list, keyed on subcategory, so "All products" interleaves the
-- big sellers from every category and each category page keeps the same
-- relative order. Lower ranks show first.
--
-- PostgREST cannot order by an expression, so the CASE is a generated
-- column (the same reason as effective_price_cents in 009). An unknown
-- subcategory ranks 1000, after every listed type. To change the order,
-- drop and re-add the column in a new migration.
-- ═══════════════════════════════════════════════════════════════

alter table products
  add column if not exists type_rank smallint
  generated always as (
    case subcategory
      when 'aeg-rifles'        then 10
      when 'gbb-pistols'       then 20
      when 'bbs'               then 30
      when 'green-gas'         then 40
      when 'batteries'         then 50
      when 'eye-protection'    then 60
      when 'smgs'              then 70
      when 'electric-pistols'  then 80
      when 'sniper'            then 90
      when 'gbbr'              then 100
      when 'shotguns'          then 110
      when 'revolvers'         then 120
      when 'rifle-magazines'   then 130
      when 'pistol-magazines'  then 140
      when 'co2'               then 150
      when 'chargers'          then 160
      when 'bio-bbs'           then 170
      when 'tracer-bbs'        then 180
      when 'gloves'            then 190
      when 'headwear'          then 200
      when 'plate-carriers'    then 210
      when 'chest-rigs'        then 220
      when 'pouches'           then 230
      when 'optics'            then 240
      when 'scopes'            then 250
      when 'helmets'           then 260
      when 'battle-belts'      then 270
      when 'slings'            then 280
      when 'holsters'          then 290
      when 'lubricants'        then 300
      when 'speed-loaders'     then 310
      when 'suppressors'       then 320
      when 'flashlights'       then 330
      when 'mounts'            then 340
      when 'rails'             then 350
      when 'bipods'            then 360
      when 'mosfets'           then 370
      when 'barrels'           then 380
      when 'gearboxes'         then 390
      when 'chronographs'      then 400
      when 'tools'             then 410
      when 'gun-bags'          then 420
      when 'cases'             then 430
      when 'camo'              then 440
      when 'ghillie'           then 450
      when 'camping'           then 460
      when 'outdoor'           then 470
      when 'wallhangers-props' then 480
      else 1000
    end
  ) stored;

create index if not exists idx_products_published_type_rank
  on products (is_published, type_rank, created_at desc);
