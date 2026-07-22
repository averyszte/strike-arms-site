-- Subcategories table
-- Stores the editable subcategory taxonomy per top-level category.
-- The 7 top-level categories (rifles, pistols, etc.) are fixed in the app;
-- subcategories are admin-managed from the Categories page.

create table if not exists subcategories (
  id         uuid        primary key default gen_random_uuid(),
  category   text        not null,
  slug       text        not null,
  name       text        not null,
  sort_order int         not null default 0,
  created_at timestamptz not null default now(),
  unique(category, slug)
);

alter table subcategories enable row level security;

create policy "admins_all" on subcategories
  for all
  to authenticated
  using (exists (select 1 from admins where id = auth.uid()))
  with check (exists (select 1 from admins where id = auth.uid()));

create policy "public_read" on subcategories
  for select
  to anon, authenticated
  using (true);

-- Seed with subcategories matching current products
insert into subcategories (category, slug, name, sort_order) values
  ('rifles',       'aeg-rifles',        'AEG Rifles',        10),
  ('rifles',       'smgs',              'SMGs',              20),
  ('rifles',       'gbbr',              'GBBR',              30),
  ('rifles',       'sniper',            'Sniper',            40),
  ('pistols',      'gbb-pistols',       'GBB Pistols',       10),
  ('pistols',      'electric-pistols',  'Electric Pistols',  20),
  ('pistols',      'revolvers',         'Revolvers',         30),
  ('consumables',  'bbs',               'BBs',               10),
  ('consumables',  'green-gas',         'Green Gas',         20),
  ('consumables',  'bio-bbs',           'Bio BBs',           30),
  ('consumables',  'co2',               'CO2',               40),
  ('consumables',  'batteries',         'Batteries',         50),
  ('accessories',  'slings',            'Slings',            10),
  ('accessories',  'rifle-magazines',   'Rifle Magazines',   20),
  ('accessories',  'optics',            'Optics',            30),
  ('accessories',  'scopes',            'Scopes',            40),
  ('accessories',  'flashlights',       'Flashlights',       50),
  ('accessories',  'suppressors',       'Suppressors',       60),
  ('accessories',  'holsters',          'Holsters',          70),
  ('gear',         'helmets',           'Helmets',           10),
  ('gear',         'chest-rigs',        'Chest Rigs',        20),
  ('gear',         'battle-belts',      'Battle Belts',      30),
  ('gear',         'eye-protection',    'Eye Protection',    40),
  ('gear',         'plate-carriers',    'Plate Carriers',    50),
  ('gear',         'gloves',            'Gloves',            60),
  ('gear',         'headwear',          'Headwear',          70),
  ('parts',        'mosfets',           'MOSFETs',           10),
  ('parts',        'barrels',           'Barrels',           20),
  ('parts',        'gearboxes',         'Gearboxes',         30),
  ('more',         'chronographs',      'Chronographs',      10),
  ('more',         'tools',             'Tools',             20),
  ('more',         'camping',           'Camping',           30)
on conflict (category, slug) do nothing;
