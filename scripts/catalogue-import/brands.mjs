/**
 * Display name -> brand slug, for the Brand column of the import CSV.
 *
 * Alan writes brands the way he says them ("Action Army", "G&G"). The products
 * table stores a slug, and the admin importer refuses anything else rather than
 * lower-casing it for you — silently correcting a brand is how two spellings of
 * one maker end up as two brand pages.
 *
 * So the mapping is written down once, here, and build-csv.mjs fails on a brand
 * that is not in it. A new maker in a future email stops the build and gets a
 * deliberate slug, instead of being guessed at by a regex.
 *
 * Every slug added here must also go into
 * artifacts/strike-arms/src/lib/brands.ts, which maps it back to the label the
 * site renders. A slug missing from that map falls back to the de-hyphenated
 * slug, so "cyma" would appear on product cards in lower case.
 */
export const BRAND_SLUGS = {
  ASG: 'asg',
  Abbey: 'abbey',
  'Action Army': 'action-army',
  Bolle: 'bolle',
  Bushnell: 'bushnell',
  CYMA: 'cyma',
  'Double Bell': 'double-bell',
  Evolution: 'evolution',
  'Invader Gear': 'invader-gear',
  JG: 'jg',
  'Specna Arms': 'specna-arms',
  'Tokyo Marui': 'tokyo-marui',
  Umarex: 'umarex',
  Unbranded: 'unbranded',
  'Viper Tactical': 'viper-tactical',
  WE: 'we',
  Well: 'well',
};

export function brandSlug(displayName) {
  return BRAND_SLUGS[displayName] ?? null;
}
