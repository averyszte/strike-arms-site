/**
 * Stand-in data for the Evolution featured-section drafts (/drafts/evolution).
 * The real rifles are imported unpublished with no photos yet, so the drafts
 * read from here. Once they are live the chosen section switches to the
 * catalogue by slug, like the play style showcase does.
 */

export type EvolutionRange = 'recon' | 'steel-hybrid' | 'sniper';

export type EvolutionDraftRifle = {
  slug: string;
  name: string;
  short: string;
  /** Euro cents, as formatPrice expects. */
  priceCents: number;
  range: EvolutionRange;
  supplierCode: string;
  length?: '10"' | '10.8"' | '14.5"';
  colour?: 'Black' | 'Black and Tan' | 'OD';
};

export const EVOLUTION_RANGE_LABELS: Record<EvolutionRange, string> = {
  recon: 'Recon Carbontech',
  'steel-hybrid': 'Steel Hybrid',
  sniper: 'Sniper',
};

export const EVOLUTION_DRAFT_RIFLES: EvolutionDraftRifle[] = [
  { slug: 'evolution-recon-14-5-carbontech-black-tan', name: 'Evolution Recon 14.5" Carbontech Black and Tan', short: 'Lightweight 14.5" Recon M4 in black and tan.', priceCents: 18500, range: 'recon', supplierCode: 'SL-1005BT', length: '14.5"', colour: 'Black and Tan' },
  { slug: 'evolution-recon-10-carbontech-black-tan', name: 'Evolution Recon 10" Carbontech Black and Tan', short: 'Lightweight, compact 10" Recon M4 in black and tan.', priceCents: 17900, range: 'recon', supplierCode: 'SL-1000BT', length: '10"', colour: 'Black and Tan' },
  { slug: 'evolution-recon-14-5-carbontech-black', name: 'Evolution Recon 14.5" Carbontech Black', short: 'Lightweight 14.5" Recon M4 in black.', priceCents: 18500, range: 'recon', supplierCode: 'SL-1005', length: '14.5"', colour: 'Black' },
  { slug: 'evolution-recon-10-carbontech-black', name: 'Evolution Recon 10" Carbontech Black', short: 'Lightweight, compact 10" Recon M4 in black.', priceCents: 17900, range: 'recon', supplierCode: 'SL-1000', length: '10"', colour: 'Black' },
  { slug: 'evolution-recon-mk18-mod-1-metal-hybrid', name: 'Evolution Recon MK18 Mod 1 10.8" Metal Hybrid', short: 'MK18 Mod 1 with a Carbontech body and a CNC aluminium rail.', priceCents: 25000, range: 'steel-hybrid', supplierCode: 'MH-3000', length: '10.8"', colour: 'Black' },
  { slug: 'evolution-ak-e-104-tanker', name: 'Evolution AK E-104 Tanker', short: 'Full metal AK with a stamped receiver, real rivets and a folding stock.', priceCents: 25000, range: 'steel-hybrid', supplierCode: 'FM-5007' },
  { slug: 'evolution-m40-sniper-rifle-od', name: 'Evolution M40 Sniper Rifle OD', short: 'Spring powered bolt action M40 in olive drab.', priceCents: 19000, range: 'sniper', supplierCode: 'EC90SR-G', colour: 'OD' },
];

/** The shared Recon spec points, from the supplier's published spec list. */
export const RECON_SPEC_POINTS: string[] = [
  'Superlite Carbontech rail system',
  'Reinforced gearbox with steel gears',
  'Rotary hop up and 6.01 precision inner barrel',
  'Quick release spring guide',
  '320 round Matrixx high capacity magazine included',
];
