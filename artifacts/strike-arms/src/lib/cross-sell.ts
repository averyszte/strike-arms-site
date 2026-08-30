import type { Category, Product } from '@/types/product';

/**
 * What a customer actually needs alongside the thing they are looking at.
 *
 * This is deliberately not "other products in the same aisle" -- that is what
 * the similar-products row is for. An AEG is unusable without a battery, a gas
 * gun is unusable without gas, and eye protection is mandatory at every site in
 * the country. Someone buying their first rifle and no BBs is going to have a
 * bad Saturday.
 *
 * Keys are `category/subcategory`, with a per-category fallback for
 * subcategories that have no entry of their own. The product's own subcategory
 * is dropped from its results, so a bottle of green gas does not suggest green
 * gas.
 *
 * Nothing here is a claim about the law. It is what the shop would hand you
 * over the counter.
 */

export type CrossSellTarget = { category: Category; subcategory: string };

const EYE_PROTECTION: CrossSellTarget = {
  category: 'gear',
  subcategory: 'eye-protection',
};
const BBS: CrossSellTarget = { category: 'consumables', subcategory: 'bbs' };
const BIO_BBS: CrossSellTarget = {
  category: 'consumables',
  subcategory: 'bio-bbs',
};
const BATTERIES: CrossSellTarget = {
  category: 'consumables',
  subcategory: 'batteries',
};
const CHARGERS: CrossSellTarget = {
  category: 'consumables',
  subcategory: 'chargers',
};
const GREEN_GAS: CrossSellTarget = {
  category: 'consumables',
  subcategory: 'green-gas',
};
const CO2: CrossSellTarget = { category: 'consumables', subcategory: 'co2' };
const SPEED_LOADERS: CrossSellTarget = {
  category: 'consumables',
  subcategory: 'speed-loaders',
};
const MAINTENANCE: CrossSellTarget = {
  category: 'consumables',
  subcategory: 'maintenance',
};
const LUBRICANTS: CrossSellTarget = {
  category: 'consumables',
  subcategory: 'lubricants',
};
const RIFLE_MAGS: CrossSellTarget = {
  category: 'rifles',
  subcategory: 'rifle-magazines',
};
const PISTOL_MAGS: CrossSellTarget = {
  category: 'pistols',
  subcategory: 'pistol-magazines',
};
const HOLSTERS: CrossSellTarget = {
  category: 'accessories',
  subcategory: 'holsters',
};
const MOUNTS: CrossSellTarget = {
  category: 'accessories',
  subcategory: 'mounts',
};
const RAILS: CrossSellTarget = {
  category: 'accessories',
  subcategory: 'rails',
};
const SCOPES: CrossSellTarget = {
  category: 'accessories',
  subcategory: 'scopes',
};
const OPTICS: CrossSellTarget = {
  category: 'accessories',
  subcategory: 'optics',
};
const LENS_PROTECTORS: CrossSellTarget = {
  category: 'accessories',
  subcategory: 'lens-protectors',
};
const BIPODS: CrossSellTarget = {
  category: 'accessories',
  subcategory: 'bipods',
};
const TRACERS: CrossSellTarget = {
  category: 'accessories',
  subcategory: 'tracers',
};
const TRACER_BBS: CrossSellTarget = {
  category: 'consumables',
  subcategory: 'tracer-bbs',
};
const CAMO: CrossSellTarget = { category: 'gear', subcategory: 'camo' };
const HELMETS: CrossSellTarget = { category: 'gear', subcategory: 'helmets' };

/** Runs on a battery: needs power, ammunition and something to see through. */
const ELECTRIC_GUN = [BATTERIES, CHARGERS, BBS, RIFLE_MAGS, EYE_PROTECTION];
/** Runs on gas: green gas and CO2 are not interchangeable, so both are offered. */
const GAS_GUN = [GREEN_GAS, CO2, BBS, RIFLE_MAGS, EYE_PROTECTION];

const BY_SUBCATEGORY: Record<string, CrossSellTarget[]> = {
  'rifles/aeg-rifles': ELECTRIC_GUN,
  'rifles/smgs': ELECTRIC_GUN,
  'rifles/lmgs': ELECTRIC_GUN,
  'rifles/dmr': [BATTERIES, BBS, SCOPES, RIFLE_MAGS, EYE_PROTECTION],
  'rifles/gbbr': GAS_GUN,
  'rifles/shotguns': [BBS, GREEN_GAS, EYE_PROTECTION],
  'rifles/spring-rifles': [BBS, BIO_BBS, EYE_PROTECTION],
  // Bolt-action rifles live or die on heavy, well-graded BBs and glass.
  'rifles/sniper': [BBS, SCOPES, BIPODS, EYE_PROTECTION],
  'rifles/rifle-magazines': [BBS, SPEED_LOADERS, BATTERIES],
  'rifles/rifle-accessories': [MOUNTS, RAILS, OPTICS],

  'pistols/gbb-pistols': [GREEN_GAS, CO2, BBS, PISTOL_MAGS, HOLSTERS],
  'pistols/electric-pistols': [BATTERIES, BBS, PISTOL_MAGS, HOLSTERS],
  'pistols/spring-pistols': [BBS, HOLSTERS, EYE_PROTECTION],
  'pistols/revolvers': [CO2, BBS, HOLSTERS],
  'pistols/machine-pistols': [GREEN_GAS, BBS, PISTOL_MAGS],
  'pistols/pistol-magazines': [GREEN_GAS, CO2, BBS],
  'pistols/pistol-parts': [LUBRICANTS, MAINTENANCE],
  'pistols/holsters': [PISTOL_MAGS, GREEN_GAS],

  'consumables/bbs': [SPEED_LOADERS, RIFLE_MAGS, BIO_BBS],
  'consumables/bio-bbs': [SPEED_LOADERS, RIFLE_MAGS, BBS],
  'consumables/tracer-bbs': [TRACERS, SPEED_LOADERS, BBS],
  'consumables/green-gas': [LUBRICANTS, MAINTENANCE, PISTOL_MAGS],
  'consumables/co2': [LUBRICANTS, MAINTENANCE, PISTOL_MAGS],
  'consumables/batteries': [CHARGERS, MAINTENANCE],
  'consumables/chargers': [BATTERIES],
  'consumables/speed-loaders': [BBS, BIO_BBS],
  'consumables/lubricants': [MAINTENANCE, GREEN_GAS],
  'consumables/maintenance': [LUBRICANTS, BBS],
  'consumables/grenades': [GREEN_GAS, BBS],

  'accessories/optics': [MOUNTS, LENS_PROTECTORS, RAILS],
  'accessories/scopes': [MOUNTS, LENS_PROTECTORS, BIPODS],
  'accessories/lens-protectors': [OPTICS, SCOPES],
  'accessories/flashlights': [MOUNTS, RAILS],
  'accessories/lasers': [MOUNTS, RAILS],
  'accessories/tracers': [TRACER_BBS, BBS],
  'accessories/holsters': [PISTOL_MAGS, GREEN_GAS],
  'accessories/rifle-magazines': [BBS, SPEED_LOADERS],
  'accessories/gas-adapters': [GREEN_GAS, CO2],
  'accessories/cases': [MAINTENANCE, LUBRICANTS],

  'gear/eye-protection': [HELMETS, LENS_PROTECTORS, CAMO],
  'gear/helmets': [EYE_PROTECTION, CAMO],
  'gear/ghillie': [CAMO, EYE_PROTECTION],
  'gear/uniforms': [CAMO, EYE_PROTECTION],
};

const BY_CATEGORY: Record<Category, CrossSellTarget[]> = {
  rifles: [BBS, BATTERIES, EYE_PROTECTION],
  pistols: [BBS, HOLSTERS, EYE_PROTECTION],
  consumables: [BBS, MAINTENANCE],
  accessories: [MOUNTS, RAILS],
  gear: [EYE_PROTECTION, CAMO],
  parts: [LUBRICANTS, MAINTENANCE],
  more: [BBS, EYE_PROTECTION],
};

/**
 * Where to look for things that go with this product. Never includes the
 * product's own shelf, so the row cannot fill up with near-identical items the
 * similar-products row is already showing.
 */
export function crossSellTargets(product: Product): CrossSellTarget[] {
  const targets =
    BY_SUBCATEGORY[`${product.category}/${product.subcategory}`] ?? BY_CATEGORY[product.category];
  return targets.filter(
    (target) =>
      !(target.category === product.category && target.subcategory === product.subcategory),
  );
}
