export type CategorySlug =
  | 'rifles'
  | 'pistols'
  | 'consumables'
  | 'accessories'
  | 'gear'
  | 'parts'
  | 'more';

export type SubcategoryDef = {
  slug: string;
  label: string;
  /**
   * Optional — when present, this subcategory becomes its own canonical SEO page
   * instead of canonicalising to its parent category. Use this to promote a
   * subcategory once it has unique content and traffic worth ranking on its own.
   */
  seo?: {
    title?: string;
    description: string;
    intro?: string;
  };
};

export type CategoryDef = {
  slug: CategorySlug;
  label: string;       // "Airsoft Rifles" — used in breadcrumbs and h1
  shortLabel: string;  // "Rifles" — used in nav
  subcategories: SubcategoryDef[];
};

export const TAXONOMY: CategoryDef[] = [
  {
    slug: 'rifles',
    label: 'Airsoft Rifles',
    shortLabel: 'Rifles',
    subcategories: [
      { slug: 'aeg-rifles', label: 'AEG Rifles' },
      { slug: 'smgs', label: 'SMGs' },
      { slug: 'lmgs', label: 'Support Guns / LMGs' },
      { slug: 'dmr', label: 'DMR Rifles' },
      { slug: 'gbbr', label: 'Gas Rifles / GBBR' },
      { slug: 'sniper', label: 'Sniper Rifles' },
      { slug: 'shotguns', label: 'Shotguns' },
      { slug: 'spring-rifles', label: 'Spring Rifles' },
      { slug: 'rifle-magazines', label: 'Rifle Magazines' },
      { slug: 'rifle-accessories', label: 'Rifle Accessories' },
    ],
  },
  {
    slug: 'pistols',
    label: 'Airsoft Pistols',
    shortLabel: 'Pistols',
    subcategories: [
      { slug: 'gbb-pistols', label: 'Gas Blowback Pistols' },
      { slug: 'electric-pistols', label: 'Electric Pistols' },
      { slug: 'spring-pistols', label: 'Spring Pistols' },
      { slug: 'revolvers', label: 'Revolvers' },
      { slug: 'machine-pistols', label: 'Machine Pistols' },
      { slug: 'pistol-magazines', label: 'Pistol Magazines' },
      { slug: 'pistol-parts', label: 'Pistol Parts' },
      { slug: 'holsters', label: 'Holsters' },
    ],
  },
  {
    slug: 'consumables',
    label: 'Consumables',
    shortLabel: 'Consumables',
    subcategories: [
      { slug: 'bbs', label: 'BBs' },
      { slug: 'bio-bbs', label: 'Bio BBs' },
      { slug: 'tracer-bbs', label: 'Tracer BBs' },
      { slug: 'speed-loaders', label: 'Speed Loaders' },
      { slug: 'grenades', label: 'Grenades' },
      { slug: 'green-gas', label: 'Green Gas' },
      { slug: 'co2', label: 'CO₂' },
      { slug: 'batteries', label: 'Batteries' },
      { slug: 'chargers', label: 'Chargers' },
      { slug: 'lubricants', label: 'Lubricants' },
      { slug: 'maintenance', label: 'Maintenance' },
    ],
  },
  {
    slug: 'accessories',
    label: 'Accessories',
    shortLabel: 'Accessories',
    subcategories: [
      { slug: 'optics', label: 'Optics' },
      { slug: 'scopes', label: 'Scopes' },
      { slug: 'lens-protectors', label: 'Lens Protectors' },
      { slug: 'flashlights', label: 'Flashlights' },
      { slug: 'lasers', label: 'Lasers' },
      { slug: 'tracers', label: 'Tracers' },
      { slug: 'grips', label: 'Grips' },
      { slug: 'muzzle-devices', label: 'Muzzle Devices' },
      { slug: 'suppressors', label: 'Suppressors' },
      { slug: 'mounts', label: 'Mounts' },
      { slug: 'rails', label: 'Rails & Attachments' },
      { slug: 'hpa', label: 'HPA Accessories' },
      { slug: 'slings', label: 'Slings' },
      { slug: 'bipods', label: 'Bipods' },
      { slug: 'cases', label: 'Gun Bags / Cases' },
      { slug: 'holsters', label: 'Holsters' },
      { slug: 'rifle-magazines', label: 'Magazines' },
      { slug: 'gas-adapters', label: 'Gas Adapters' },
    ],
  },
  {
    slug: 'gear',
    label: 'Tactical Gear',
    shortLabel: 'Gear',
    subcategories: [
      { slug: 'plate-carriers', label: 'Plate Carriers / Vests' },
      { slug: 'chest-rigs', label: 'Chest Rigs' },
      { slug: 'battle-belts', label: 'Battle Belts' },
      { slug: 'uniforms', label: 'Uniforms' },
      { slug: 'ghillie', label: 'Ghillie Suits' },
      { slug: 'camo', label: 'Camo Accessories' },
      { slug: 'helmets', label: 'Helmets' },
      { slug: 'eye-protection', label: 'Face & Eye Protection' },
      { slug: 'gloves', label: 'Gloves' },
      { slug: 'footwear', label: 'Footwear' },
      { slug: 'headwear', label: 'Headwear' },
      { slug: 'comms', label: 'Comms' },
      { slug: 'pouches', label: 'Pouches' },
      { slug: 'holsters', label: 'Holsters' },
      { slug: 'gun-bags', label: 'Gun Bags / Transport' },
      { slug: 'gun-covers', label: 'Gun Covers' },
      { slug: 'patches', label: 'Patches' },
    ],
  },
  {
    slug: 'parts',
    label: 'Parts & Internals',
    shortLabel: 'Parts',
    subcategories: [
      { slug: 'aeg-parts', label: 'AEG Internal Parts' },
      { slug: 'gbb-parts', label: 'GBB / Pistol Parts' },
      { slug: 'sniper-parts', label: 'Sniper Parts' },
      { slug: 'hop-up', label: 'Hop-Up Units & Buckings' },
      { slug: 'barrels', label: 'Barrels' },
      { slug: 'motors', label: 'Motors' },
      { slug: 'gearboxes', label: 'Gearboxes' },
      { slug: 'springs', label: 'Springs' },
      { slug: 'pistons', label: 'Pistons' },
      { slug: 'mosfets', label: 'MOSFETs / ETUs' },
      { slug: 'hpa-upgrades', label: 'HPA Upgrades' },
      { slug: 'external-parts', label: 'External Parts' },
    ],
  },
  {
    slug: 'more',
    label: 'Equipment & Outdoor',
    shortLabel: 'More',
    subcategories: [
      { slug: 'chronographs', label: 'Chronographs' },
      { slug: 'targets', label: 'Targets' },
      { slug: 'tools', label: 'Tools' },
      { slug: 'maintenance-kits', label: 'Maintenance Kits' },
      { slug: 'camping', label: 'Camping Gear' },
      { slug: 'outdoor', label: 'Outdoor Gear' },
    ],
  },
];

export function getCategory(slug: string): CategoryDef | undefined {
  return TAXONOMY.find((c) => c.slug === slug);
}

export function getSubcategory(
  categorySlug: string,
  subSlug: string,
): SubcategoryDef | undefined {
  return getCategory(categorySlug)?.subcategories.find((s) => s.slug === subSlug);
}

export function isValidCategorySlug(slug: string): slug is CategorySlug {
  return TAXONOMY.some((c) => c.slug === slug);
}
