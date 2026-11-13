/**
 * Alan's Evolution range, batch 3. He listed seven rifles by supplier code and
 * price and said the photos and specifications "can be lifted from the
 * suppliers website": evolutioninternational.it, read on 13 Nov 2026.
 *
 * Specifications are the supplier's published spec lists, in our own words.
 * No photos yet: Phil is sourcing them, and they go on with the photo-set
 * pipeline once they arrive. Alan gave no quantities, so stock opens at 0.
 *
 * Every row carries the `evolution-range` tag, which is what the /evolution
 * shelf is built from. The brand alone would also pull in the Matrix magazines.
 */

const RECON_SPEC =
  'Superlite Carbontech rail system, flip up battle sights, a high torque motor and a 6.01 precision inner barrel. ' +
  'Reinforced gearbox with steel gears, a sector gear delayer, steel teeth piston and a quick release spring guide, ' +
  'a rotary hop up and a tool-less motor grip. Comes with a 320 round Matrixx high capacity magazine.';

const RECON_FLAG =
  'Alan wrote the code and length the other way round. By the supplier, SL-1000 is the 10" and SL-1005 the 14.5". ' +
  'Listed by the length and price he gave. Check the colour too: B is taken as black, against BT for black and tan.';

const RECON_TAGS = ['aeg', 'm4', 'carbontech', 'evolution-range'];

export const EVOLUTION = [
  {
    slug: 'evolution-ak-e-104-tanker',
    name: 'Evolution AK E-104 Tanker',
    subcategory: 'aeg-rifles',
    price: '250.00',
    short: 'Full metal AK with a stamped receiver, real rivets and a folding stock.',
    description:
      'Full metal AK with a stamped receiver, real rivets, a side mount rail and a folding stock. One piece outer barrel, ' +
      'metal hop up chamber, steel gears with a delayer, steel teeth piston and a 6.01 inner barrel. Comes with a 500 round magazine. Supplier code FM-5007.',
    tags: ['aeg', 'ak', 'full-metal', 'evolution-range'],
    flag: 'Alan lists this under "Steel Hybrid Range"; the supplier files it under Full Metal. Named as the supplier names it.',
  },
  {
    slug: 'evolution-recon-mk18-mod-1-metal-hybrid',
    name: 'Evolution Recon MK18 Mod 1 10.8" Metal Hybrid',
    subcategory: 'aeg-rifles',
    price: '250.00',
    short: 'MK18 Mod 1 with a Carbontech body and a CNC aluminium rail.',
    description:
      'MK18 Mod 1 with a 10.8" CNC aluminium rail, a Carbontech body and metal flip up sights. Reinforced gearbox with steel gears, ' +
      'a sector gear delayer, steel teeth piston and a quick release spring guide, a rotary hop up and a 6.01 inner barrel. ' +
      'Comes with a 140 round Matrixx mid capacity magazine. Supplier code MH-3000.',
    tags: ['aeg', 'm4', 'mk18', 'evolution-range'],
  },
  {
    slug: 'evolution-recon-14-5-carbontech-black-tan',
    name: 'Evolution Recon 14.5" Carbontech Black and Tan',
    subcategory: 'aeg-rifles',
    price: '185.00',
    short: 'Lightweight 14.5" Recon M4 in black and tan.',
    description: `${RECON_SPEC} Supplier code SL-1005BT.`,
    tags: [...RECON_TAGS, 'two-tone'],
  },
  {
    slug: 'evolution-recon-10-carbontech-black-tan',
    name: 'Evolution Recon 10" Carbontech Black and Tan',
    subcategory: 'aeg-rifles',
    price: '179.00',
    short: 'Lightweight, compact 10" Recon M4 in black and tan.',
    description: `${RECON_SPEC} Supplier code SL-1000BT.`,
    tags: [...RECON_TAGS, 'two-tone', 'compact'],
  },
  {
    slug: 'evolution-recon-14-5-carbontech-black',
    name: 'Evolution Recon 14.5" Carbontech Black',
    subcategory: 'aeg-rifles',
    price: '185.00',
    short: 'Lightweight 14.5" Recon M4 in black.',
    description: `${RECON_SPEC} Supplier code SL-1005.`,
    tags: RECON_TAGS,
    flag: `Alan wrote "SL-1000B Evolution Recon 14.5"". ${RECON_FLAG}`,
  },
  {
    slug: 'evolution-recon-10-carbontech-black',
    name: 'Evolution Recon 10" Carbontech Black',
    subcategory: 'aeg-rifles',
    price: '179.00',
    short: 'Lightweight, compact 10" Recon M4 in black.',
    description: `${RECON_SPEC} Supplier code SL-1000.`,
    tags: [...RECON_TAGS, 'compact'],
    flag: `Alan wrote "SL-1005B Evolution Recon 10"". ${RECON_FLAG}`,
  },
  {
    slug: 'evolution-m40-sniper-rifle-od',
    name: 'Evolution M40 Sniper Rifle OD',
    subcategory: 'sniper',
    price: '190.00',
    short: 'Spring powered bolt action M40 in olive drab.',
    description:
      'Spring powered bolt action M40 with a CNC machined aluminium outer barrel and a 6.03 precision inner barrel. ' +
      'Fibre reinforced polymer stock with an adjustable butt and cheek piece, 20mm rails, a textured grip and a QD sling attachment. ' +
      'Supplier code EC90SR-G.',
    tags: ['sniper', 'bolt-action', 'spring', 'evolution-range'],
  },
].map((item) => ({
  ...item,
  category: 'rifles',
  brand: 'Evolution',
  image: null,
  folder: 'Evolution',
  isNew: true,
}));
