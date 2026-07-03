-- Strike Arms seed data — 56 catalogue products
-- Run AFTER the three migration files (001, 002, 003).
--
-- Admin user: create via Supabase Auth dashboard (Authentication → Users → Add user),
-- then run: INSERT INTO public.admins (id)
--           SELECT id FROM auth.users WHERE email = '<your-email>'
--           ON CONFLICT DO NOTHING;

-- ─── Products ─────────────────────────────────────────────────────────────────
INSERT INTO public.products
  (slug, name, category, subcategory, brand, price_cents, sale_price_cents,
   images, short_description, description,
   is_new, is_featured, is_published,
   stock_count, reserved_count, low_stock_threshold, tags, created_at)
VALUES

-- RIFLES — AEG
('specna-arms-sa-e03-edge-aeg', 'Specna Arms SA-E03 EDGE AEG', 'rifles', 'aeg-rifles', 'specna-arms', 18900, NULL,
 ARRAY['/images/category-rifles.png'],
 'Full-metal AEG with EDGE gearbox, ETU, and MOSFET. Shoots at ~380 FPS with 0.20g.',
 '', false, false, true, 10, 0, 5, ARRAY['aeg','full-metal','edge'], '2025-09-10T10:00:00Z'),

('specna-arms-sa-e09-edge-aeg', 'Specna Arms SA-E09 EDGE AEG', 'rifles', 'aeg-rifles', 'specna-arms', 22900, NULL,
 ARRAY['/images/category-rifles.png'],
 'M4 carbine platform with EDGE 2.0 gearbox and Quick-Spring-Change system.',
 '', false, false, true, 10, 0, 5, ARRAY['aeg','full-metal','qsc'], '2025-10-15T10:00:00Z'),

('gg-cm16-raider-aeg', 'G&G CM16 Raider AEG', 'rifles', 'aeg-rifles', 'gandg', 12900, NULL,
 ARRAY['/images/category-rifles.png'],
 'Reliable entry-level AEG with polymer body. Great first rifle for new players.',
 '', false, true, true, 10, 0, 5, ARRAY['aeg','beginner','value'], '2025-06-01T10:00:00Z'),

('gg-tr16-index-crb-aeg', 'G&G TR16 Index CRB AEG', 'rifles', 'aeg-rifles', 'gandg', 25900, NULL,
 ARRAY['/images/loadout-cqb.png'],
 'Metal AEG carbine with G2 gearbox and high-cycle internals for sustained fire.',
 '', false, false, true, 10, 0, 5, ARRAY['aeg','full-metal','high-cycle'], '2025-08-20T10:00:00Z'),

('ics-cxp-mmr-aeg', 'ICS CXP-MMR AEG', 'rifles', 'aeg-rifles', 'ics', 34900, NULL,
 ARRAY['/images/category-rifles.png'],
 'ICS split gearbox design for easy maintenance. MOSFET included, full-metal build.',
 '', false, false, true, 10, 0, 5, ARRAY['aeg','full-metal','mosfet'], '2025-07-05T10:00:00Z'),

('krytac-trident-crb-aeg', 'Krytac TRIDENT CRB AEG', 'rifles', 'aeg-rifles', 'krytac', 32900, NULL,
 ARRAY['/images/loadout-outdoor.png'],
 'Krytac''s reliable CRB platform. Known for consistent performance straight out of the box.',
 '', false, true, true, 10, 0, 5, ARRAY['aeg','full-metal'], '2025-05-15T10:00:00Z'),

('tokyo-marui-m4-sopmod-next-gen', 'Tokyo Marui M4 SOPMOD Next Gen.', 'rifles', 'aeg-rifles', 'tokyo-marui', 44900, NULL,
 ARRAY['/images/category-rifles.png'],
 'Recoil-shock system AEG. Unmatched TM quality with realistic bolt movement.',
 '', false, false, true, 0, 0, 5, ARRAY['aeg','recoil-shock','next-gen'], '2025-04-10T10:00:00Z'),

-- RIFLES — SMG
('asg-scorpion-evo-3-a1-aeg', 'ASG Scorpion EVO 3 A1 AEG', 'rifles', 'smgs', 'asg', 23900, NULL,
 ARRAY['/images/loadout-cqb.png'],
 'Compact CZ Scorpion EVO 3 A1. ETU, MOSFET, and polymer/metal hybrid construction.',
 '', false, false, true, 10, 0, 5, ARRAY['smg','etu','cqb'], '2025-11-01T10:00:00Z'),

('ics-cxp-predator-smg-aeg', 'ICS CXP Predator SMG AEG', 'rifles', 'smgs', 'ics', 28900, NULL,
 ARRAY['/images/loadout-cqb.png'],
 'Compact PDW-style AEG from ICS. Full metal, split gearbox, great for CQB.',
 '', false, false, true, 10, 0, 5, ARRAY['smg','full-metal','cqb'], '2025-09-28T10:00:00Z'),

('specna-arms-sa-j02-core-smg', 'Specna Arms SA-J02 CORE SMG', 'rifles', 'smgs', 'specna-arms', 8900, 7500,
 ARRAY['/images/loadout-cqb.png'],
 'Budget-friendly SMG with CORE gearbox. Value pick for new CQB players.',
 '', false, false, true, 10, 0, 5, ARRAY['smg','budget','cqb'], '2025-03-15T10:00:00Z'),

-- RIFLES — GBBR
('tokyo-marui-mws-gbbr', 'Tokyo Marui MWS GBBR', 'rifles', 'gbbr', 'tokyo-marui', 59900, NULL,
 ARRAY['/images/category-rifles.png'],
 'The benchmark gas blowback rifle. Mil-spec aluminium upper, full-power recoil.',
 '', false, true, true, 10, 0, 5, ARRAY['gbbr','gas','recoil'], '2025-08-01T10:00:00Z'),

('we-m4-gbbr-open-bolt', 'WE M4 GBBR Open Bolt', 'rifles', 'gbbr', 'we', 32900, NULL,
 ARRAY['/images/loadout-outdoor.png'],
 'Full-metal open-bolt GBBR from WE. Compatible with most real-steel M4 parts.',
 '', false, false, true, 10, 0, 5, ARRAY['gbbr','gas','full-metal'], '2025-07-12T10:00:00Z'),

('vfc-hk416-gbbr', 'VFC HK416 GBBR', 'rifles', 'gbbr', 'vfc', 69900, NULL,
 ARRAY['/images/category-rifles.png'],
 'Licensed HK416 GBBR by VFC. Exceptional build quality and recoil performance.',
 '', false, false, true, 0, 0, 5, ARRAY['gbbr','gas','licensed'], '2025-05-20T10:00:00Z'),

-- RIFLES — Sniper
('specna-arms-sa-s02-core-sniper', 'Specna Arms SA-S02 CORE Sniper', 'rifles', 'sniper', 'specna-arms', 14900, 12900,
 ARRAY['/images/loadout-outdoor.png'],
 'Budget bolt-action sniper with metal body. Upgradeable and accurate out of the box.',
 '', false, false, true, 10, 0, 5, ARRAY['sniper','bolt-action','budget'], '2025-02-10T10:00:00Z'),

('asg-mcmillan-m40a3-sniper', 'ASG McMillan M40A3 Sniper', 'rifles', 'sniper', 'asg', 18900, NULL,
 ARRAY['/images/loadout-outdoor.png'],
 'Licensed McMillan M40A3 spring sniper. Heavy polymer stock, realistic proportions.',
 '', true, false, true, 10, 0, 5, ARRAY['sniper','bolt-action','licensed'], '2026-04-01T10:00:00Z'),

-- PISTOLS — GBB
('tokyo-marui-hi-capa-51-gbb', 'Tokyo Marui Hi-Capa 5.1 GBB', 'pistols', 'gbb-pistols', 'tokyo-marui', 16900, NULL,
 ARRAY['/images/category-pistols.png'],
 'The most popular competition pistol in airsoft. TM''s legendary build quality.',
 '', false, true, true, 10, 0, 5, ARRAY['gbb','competition','hi-capa'], '2025-08-05T10:00:00Z'),

('tokyo-marui-glock-17-gbb', 'Tokyo Marui Glock 17 GBB', 'pistols', 'gbb-pistols', 'tokyo-marui', 14900, NULL,
 ARRAY['/images/category-pistols.png'],
 'Iconic Glock 17 in TM quality. Smooth trigger, consistent performance with green gas.',
 '', false, false, true, 10, 0, 5, ARRAY['gbb','glock'], '2025-06-20T10:00:00Z'),

('we-glock-17-gen4-gbb', 'WE Glock 17 Gen4 GBB', 'pistols', 'gbb-pistols', 'we', 8900, NULL,
 ARRAY['/images/category-pistols.png'],
 'Full-metal Glock 17 Gen4 from WE. Great value sidearm, takes WE/TM compatible mags.',
 '', false, false, true, 10, 0, 5, ARRAY['gbb','glock','value'], '2025-05-10T10:00:00Z'),

('we-m9a1-full-metal-gbb', 'WE M9A1 Full Metal GBB', 'pistols', 'gbb-pistols', 'we', 9900, NULL,
 ARRAY['/images/category-pistols.png'],
 'Full-metal M9A1 Beretta GBB. Heavyweight sidearm with classic military aesthetic.',
 '', false, false, true, 10, 0, 5, ARRAY['gbb','beretta','full-metal'], '2025-04-22T10:00:00Z'),

('vorsk-eu17-gbb', 'Vorsk EU17 GBB', 'pistols', 'gbb-pistols', 'vorsk', 7900, 6500,
 ARRAY['/images/category-pistols.png'],
 'Value GBB pistol from Vorsk. Compatible with TM Hi-Capa magazines.',
 '', false, false, true, 10, 0, 5, ARRAY['gbb','value','hi-capa-compatible'], '2025-03-01T10:00:00Z'),

('asg-cz-p09-gbb', 'ASG CZ P-09 GBB', 'pistols', 'gbb-pistols', 'asg', 11900, NULL,
 ARRAY['/images/category-pistols.png'],
 'Licensed CZ P-09 GBB pistol. Excellent grip ergonomics and consistent shooting.',
 '', true, false, true, 10, 0, 5, ARRAY['gbb','cz','licensed'], '2026-03-15T10:00:00Z'),

('nuprol-raven-r3-gbb', 'Nuprol Raven Series R3 GBB', 'pistols', 'gbb-pistols', 'nuprol', 6900, NULL,
 ARRAY['/images/category-pistols.png'],
 'Nuprol Raven R3 entry GBB. Lightweight, reliable, ideal as a backup sidearm.',
 '', false, false, true, 10, 0, 5, ARRAY['gbb','beginner','backup'], '2025-02-05T10:00:00Z'),

('vfc-glock-45-gbb', 'VFC Glock 45 GBB', 'pistols', 'gbb-pistols', 'vfc', 19900, NULL,
 ARRAY['/images/category-pistols.png'],
 'Licensed Glock 45 by VFC. Compact Gen5 frame with full-size slide. Premium GBB.',
 '', true, false, true, 10, 0, 5, ARRAY['gbb','glock','licensed','premium'], '2026-02-10T10:00:00Z'),

('tokyo-marui-m9a1-biohazard', 'Tokyo Marui M9A1 Biohazard', 'pistols', 'gbb-pistols', 'tokyo-marui', 22900, NULL,
 ARRAY['/images/category-pistols.png'],
 'Collector edition M9A1 from TM. Biohazard markings, flawless gas efficiency.',
 '', false, false, true, 0, 0, 5, ARRAY['gbb','beretta','limited-edition'], '2024-12-01T10:00:00Z'),

('gg-gtp9-gbb', 'G&G GTP9 GBB', 'pistols', 'gbb-pistols', 'gandg', 12900, NULL,
 ARRAY['/images/category-pistols.png'],
 'G&G GTP9 with polymer frame and metal slide. Solid mid-range GBB sidearm.',
 '', false, false, true, 10, 0, 5, ARRAY['gbb','mid-range'], '2025-07-30T10:00:00Z'),

-- PISTOLS — Revolvers
('asg-dan-wesson-715-revolver', 'ASG Dan Wesson 715 Revolver', 'pistols', 'revolvers', 'asg', 9900, NULL,
 ARRAY['/images/category-pistols.png'],
 'Licensed Dan Wesson 715 CO2 revolver. 6-inch barrel, realistic weight and look.',
 '', false, false, true, 10, 0, 5, ARRAY['revolver','co2','licensed'], '2025-01-15T10:00:00Z'),

-- PISTOLS — Electric
('nuprol-delta-whisper-electric-pistol', 'Nuprol Delta Whisper Electric Pistol', 'pistols', 'electric-pistols', 'nuprol', 4900, NULL,
 ARRAY['/images/category-pistols.png'],
 'Compact electric pistol for beginners and children. Safe, reliable, easy to use.',
 '', false, false, true, 10, 0, 5, ARRAY['electric','beginner','compact'], '2025-10-05T10:00:00Z'),

-- CONSUMABLES — BBs
('valken-accelerate-020g-bbs-5000', 'Valken Accelerate 0.20g BBs — 5000 Pack', 'consumables', 'bbs', 'valken', 1900, NULL,
 ARRAY['/images/category-bbs.png'],
 'High-quality 6mm 0.20g BBs for AEG rifles. Seamless, polished, consistent weight.',
 '', false, true, true, 10, 0, 5, ARRAY['bbs','0.20g','value'], '2025-09-01T10:00:00Z'),

('valken-accelerate-bio-025g-bbs', 'Valken Accelerate Bio 0.25g BBs — 3570 Pack', 'consumables', 'bio-bbs', 'valken', 2900, NULL,
 ARRAY['/images/category-bbs.png'],
 'Biodegradable 0.25g BBs. Required for most outdoor fields in Ireland.',
 '', false, false, true, 10, 0, 5, ARRAY['bbs','bio','0.25g'], '2025-09-05T10:00:00Z'),

('nuprol-028g-precision-bbs-4000', 'Nuprol 0.28g Precision BBs — 4000 Pack', 'consumables', 'bbs', 'nuprol', 2400, NULL,
 ARRAY['/images/category-bbs.png'],
 'Premium 0.28g BBs for upgraded AEGs and sniper rifles. Tight tolerances.',
 '', false, false, true, 10, 0, 5, ARRAY['bbs','0.28g','precision'], '2025-08-12T10:00:00Z'),

('asg-blaster-020g-bbs-2000', 'ASG Blaster 0.20g BBs — 2000 Pack', 'consumables', 'bbs', 'asg', 1200, NULL,
 ARRAY['/images/category-bbs.png'],
 'Entry-level BBs from ASG. Good consistency for CQB and practice sessions.',
 '', false, false, true, 10, 0, 5, ARRAY['bbs','0.20g','budget'], '2025-06-10T10:00:00Z'),

-- CONSUMABLES — Gas
('nuprol-20-green-gas-500ml', 'Nuprol 2.0 Green Gas — 500ml', 'consumables', 'green-gas', 'nuprol', 1400, NULL,
 ARRAY['/images/category-bbs.png'],
 'Standard green gas for GBB pistols and rifles. UK-compliant pressure rating.',
 '', false, false, true, 10, 0, 5, ARRAY['gas','gbb'], '2025-07-20T10:00:00Z'),

('nuprol-40-ultra-green-gas-500ml', 'Nuprol 4.0 Ultra Green Gas — 500ml', 'consumables', 'green-gas', 'nuprol', 1700, NULL,
 ARRAY['/images/category-bbs.png'],
 'High-performance green gas for cold-weather shooting. Maintains consistency in low temps.',
 '', true, false, true, 10, 0, 5, ARRAY['gas','gbb','cold-weather'], '2026-04-10T10:00:00Z'),

-- CONSUMABLES — CO2
('asg-12g-co2-capsules-x12', 'ASG 12g CO₂ Capsules — Pack of 12', 'consumables', 'co2', 'asg', 900, NULL,
 ARRAY['/images/category-bbs.png'],
 'Standard 12g CO2 capsules for revolvers and CO2 pistols. 12 per pack.',
 '', false, false, true, 10, 0, 5, ARRAY['co2','capsules'], '2025-05-01T10:00:00Z'),

-- CONSUMABLES — Batteries
('valken-lipo-74v-1300mah-battery', 'Valken LiPo 7.4v 1300mAh Battery', 'consumables', 'batteries', 'valken', 2900, 2400,
 ARRAY['/images/category-bbs.png'],
 '7.4v LiPo stick battery for AEGs. Compact form-factor, suitable for most M4-style AEGs.',
 '', false, false, true, 10, 0, 5, ARRAY['battery','lipo','7.4v'], '2025-04-15T10:00:00Z'),

-- ACCESSORIES — Optics
('specna-arms-t2-red-dot', 'Specna Arms T2 Red Dot Sight', 'accessories', 'optics', 'specna-arms', 3900, NULL,
 ARRAY['/images/category-accessories.png'],
 'T2-style red dot with 11 brightness settings. Fits any 20mm Picatinny rail.',
 '', false, false, true, 10, 0, 5, ARRAY['optics','red-dot','rail-mount'], '2025-08-25T10:00:00Z'),

('asg-3-9x40-scope', 'ASG 3-9×40 Rifle Scope', 'accessories', 'scopes', 'asg', 5900, NULL,
 ARRAY['/images/category-accessories.png'],
 'Adjustable 3-9×40 scope with illuminated reticle. Ideal for sniper rifles and DMRs.',
 '', false, false, true, 10, 0, 5, ARRAY['optics','scope','sniper'], '2025-07-18T10:00:00Z'),

-- ACCESSORIES — Flashlights
('nuprol-nx-series-flashlight', 'Nuprol NX Series Tactical Flashlight', 'accessories', 'flashlights', 'nuprol', 4900, 3900,
 ARRAY['/images/category-accessories.png'],
 '800-lumen tactical flashlight with pressure pad. Fits Picatinny and KeyMod rails.',
 '', false, false, true, 10, 0, 5, ARRAY['flashlight','tactical'], '2025-06-05T10:00:00Z'),

-- ACCESSORIES — Suppressors
('valken-v-tactical-suppressor', 'Valken V-Tactical 14mm Suppressor', 'accessories', 'suppressors', 'valken', 2900, NULL,
 ARRAY['/images/category-accessories.png'],
 'Mock suppressor for 14mm CCW threaded barrels. Adds length and aesthetics to any rifle.',
 '', false, false, true, 10, 0, 5, ARRAY['suppressor','mock','14mm-ccw'], '2025-05-28T10:00:00Z'),

-- ACCESSORIES — Magazines
('asg-evo-magazine-110rd', 'ASG Scorpion EVO 3 110-Round Magazine', 'accessories', 'rifle-magazines', 'asg', 1800, NULL,
 ARRAY['/images/category-accessories.png'],
 'Genuine ASG Scorpion EVO 3 A1 mid-cap magazine. 110-round capacity.',
 '', false, false, true, 10, 0, 5, ARRAY['magazine','evo3','mid-cap'], '2025-09-15T10:00:00Z'),

-- ACCESSORIES — Slings
('krytac-qd-sling-mount', 'Krytac QD Sling Mount', 'accessories', 'slings', 'krytac', 1200, NULL,
 ARRAY['/images/category-accessories.png'],
 'Quick-detach sling mount for Krytac rifles. Fits standard barrel nut profiles.',
 '', true, false, true, 10, 0, 5, ARRAY['sling','qd','mount'], '2026-03-01T10:00:00Z'),

('valken-2-point-sling', 'Valken 2-Point Tactical Sling', 'accessories', 'slings', 'valken', 2200, NULL,
 ARRAY['/images/category-accessories.png'],
 'Adjustable 2-point padded sling. Universal swivel clips, works with any AEG or GBBR.',
 '', false, false, true, 10, 0, 5, ARRAY['sling','2-point'], '2025-04-01T10:00:00Z'),

-- ACCESSORIES — Holsters
('nuprol-molle-pistol-holster', 'Nuprol MOLLE Pistol Holster', 'accessories', 'holsters', 'nuprol', 3400, NULL,
 ARRAY['/images/category-accessories.png'],
 'MOLLE-compatible universal holster. Fits most full-size GBB pistols including Glock.',
 '', false, false, true, 10, 0, 5, ARRAY['holster','molle'], '2025-03-20T10:00:00Z'),

-- GEAR — Chest Rigs
('nuprol-pmc-chest-rig', 'Nuprol PMC Chest Rig', 'gear', 'chest-rigs', 'nuprol', 4900, NULL,
 ARRAY['/images/category-gear.png'],
 'Lightweight MOLLE chest rig with M4 mag pouches. Fits over most plate carriers.',
 '', false, false, true, 10, 0, 5, ARRAY['chest-rig','molle'], '2025-10-20T10:00:00Z'),

-- GEAR — Battle Belts
('valken-battle-belt', 'Valken Tactical Battle Belt', 'gear', 'battle-belts', 'valken', 6900, NULL,
 ARRAY['/images/loadout-beginner.png'],
 'Padded inner/outer battle belt with MOLLE outer. Stiff platform for heavy loadouts.',
 '', false, false, true, 10, 0, 5, ARRAY['battle-belt','molle'], '2025-09-22T10:00:00Z'),

-- GEAR — Headwear
('asg-strike-balaclava', 'ASG Strike Systems Balaclava', 'gear', 'headwear', 'asg', 1400, 1100,
 ARRAY['/images/category-gear.png'],
 'Breathable polyester balaclava. One-size-fits-most, face protection in cold conditions.',
 '', false, false, true, 10, 0, 5, ARRAY['balaclava','headwear'], '2024-11-10T10:00:00Z'),

-- GEAR — Helmets
('nuprol-battle-helmet', 'Nuprol Battle Helmet', 'gear', 'helmets', 'nuprol', 7900, NULL,
 ARRAY['/images/category-gear.png'],
 'Adjustable ABS tactical helmet with NVG mount and rail system. Fits Wendy-style pads.',
 '', true, false, true, 10, 0, 5, ARRAY['helmet','tactical'], '2026-01-15T10:00:00Z'),

-- GEAR — Eye Protection
('valken-zulu-tactical-goggles', 'Valken Zulu Tactical Goggles', 'gear', 'eye-protection', 'valken', 5900, NULL,
 ARRAY['/images/category-gear.png'],
 'ANSI Z87.1-rated tactical goggles with anti-fog and UV400 lenses. Full-seal protection.',
 '', false, false, true, 10, 0, 5, ARRAY['goggles','eye-protection','ansi'], '2025-08-08T10:00:00Z'),

-- GEAR — Plate Carriers
('nuprol-pmc-plate-carrier', 'Nuprol PMC Plate Carrier', 'gear', 'plate-carriers', 'nuprol', 12900, NULL,
 ARRAY['/images/loadout-beginner.png'],
 'Adjustable plate carrier with front and back plate pockets and MOLLE cummerbund.',
 '', false, true, true, 10, 0, 5, ARRAY['plate-carrier','molle'], '2025-07-01T10:00:00Z'),

-- GEAR — Gloves
('asg-strike-combat-gloves', 'ASG Strike Systems Combat Gloves', 'gear', 'gloves', 'asg', 2900, NULL,
 ARRAY['/images/category-gear.png'],
 'Half-finger tactical gloves with knuckle protection. Available in S/M/L/XL.',
 '', false, false, true, 10, 0, 5, ARRAY['gloves','half-finger'], '2025-06-15T10:00:00Z'),

-- PARTS — Barrels
('zci-602mm-tightbore-inner-barrel-363mm', 'ZCI 6.02mm Tightbore Inner Barrel (363mm)', 'parts', 'barrels', 'zci', 2900, NULL,
 ARRAY['/images/rifle-annotated.png'],
 'Precision 6.02mm stainless steel inner barrel. 363mm length for standard M4 AEGs.',
 '', false, false, true, 10, 0, 5, ARRAY['barrel','tightbore','upgrade'], '2025-10-01T10:00:00Z'),

-- PARTS — Gearboxes
('shs-18-1-high-torque-steel-gear-set', 'SHS 18:1 High Torque Steel Gear Set', 'parts', 'gearboxes', 'shs', 3200, NULL,
 ARRAY['/images/rifle-annotated.png'],
 'Heat-treated steel 18:1 ratio gear set for V2/V3 gearboxes. Improves torque and durability.',
 '', false, false, true, 10, 0, 5, ARRAY['gears','v2','v3','upgrade'], '2025-08-18T10:00:00Z'),

-- PARTS — MOSFETs
('perun-v2-optical-mosfet', 'Perun V2 Optical MOSFET', 'parts', 'mosfets', 'perun', 5900, NULL,
 ARRAY['/images/rifle-annotated.png'],
 'Drop-in optical MOSFET for V2 gearboxes. Active braking, burst fire, and precocking modes.',
 '', true, false, true, 10, 0, 5, ARRAY['mosfet','etu','v2','perun'], '2026-02-20T10:00:00Z'),

-- MORE — Chronographs
('acetech-ac6000-chronograph', 'Acetech AC6000 Chronograph', 'more', 'chronographs', 'acetech', 8900, NULL,
 ARRAY['/images/category-accessories.png'],
 'Professional-grade airsoft chronograph. Measures BB velocity in FPS and m/s with high accuracy.',
 '', false, true, true, 10, 0, 5, ARRAY['chronograph','fps','measurement'], '2025-11-15T10:00:00Z'),

-- MORE — Tools
('airsoft-cleaning-rod-kit', 'Airsoft Barrel Cleaning Rod Kit', 'more', 'tools', 'nuprol', 800, NULL,
 ARRAY['/images/category-accessories.png'],
 'Essential barrel cleaning kit with rod, patches, and silicon cloth. Keeps your inner barrel clear.',
 '', false, false, true, 10, 0, 5, ARRAY['cleaning','maintenance','tools'], '2025-07-08T10:00:00Z'),

-- MORE — Camping
('compact-folding-camp-stool', 'Compact Folding Camp Stool', 'more', 'camping', 'valken', 1500, NULL,
 ARRAY['/images/loadout-outdoor.png'],
 'Lightweight aluminium folding stool. 100kg load capacity, folds flat for transport.',
 '', false, false, true, 10, 0, 5, ARRAY['camping','outdoor','stool'], '2025-05-05T10:00:00Z')

ON CONFLICT (slug) DO NOTHING;
