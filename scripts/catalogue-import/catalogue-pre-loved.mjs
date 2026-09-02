/**
 * Alan's Pre-Loved page, from the email of 1 Sep 2026.
 *
 * These are secondhand one-offs. Alan's instruction, verbatim: "We will have to
 * stress that these rifles or pistols are sold as seen and are secondhand and
 * will require batteries and a charger." That sentence is appended to every
 * description here rather than left to a page banner, because a customer who
 * arrives on a product page from search never sees the banner.
 *
 * Each of these is a single item. The importer always writes stock 0 by design,
 * so after the import every row needs one adjust_stock to 1. See README.md.
 */

const SOLD_AS_SEEN =
  'Sold as seen. This is a secondhand item and will require batteries and a charger, which are not included.';

const PRE_LOVED_TAGS = ['pre-loved', 'secondhand', 'sold-as-seen'];

export const PRE_LOVED = [
  {
    slug: 'pre-loved-tm-aa12-shotgun',
    name: 'Tokyo Marui AA12 Shotgun',
    subcategory: 'shotguns',
    brand: 'Tokyo Marui',
    price: '190.00',
    short: 'As new in the box, mint condition.',
    description: 'As new in the box, mint condition.',
    image: 'AA12 SHOTGUN.jpeg',
  },
  {
    slug: 'pre-loved-cyma-aksu-74',
    name: 'CYMA AKSU 74',
    subcategory: 'aeg-rifles',
    brand: 'CYMA',
    price: '160.00',
    short: 'Full metal and real wood, with three magazines.',
    description: 'CYMA full metal and real wood, with 3 magazines.',
    extraTags: ['full-metal', 'ak'],
    image: 'AKSU full metal.jpeg',
  },
  {
    slug: 'pre-loved-asg-steyr-aug-a2',
    name: 'ASG Steyr AUG A2',
    subcategory: 'aeg-rifles',
    brand: 'ASG',
    price: '120.00',
    short: 'ASG AUG A2 in great condition.',
    description: 'ASG AUG A2 in great condition.',
    extraTags: ['bullpup'],
    image: 'AUG A2 BLACK.jpeg',
  },
  {
    slug: 'pre-loved-asg-steyr-aug-a2-suppressor-sight',
    name: 'ASG Steyr AUG A2 with Suppressor and Sight',
    subcategory: 'aeg-rifles',
    brand: 'ASG',
    price: '160.00',
    short: 'In its original box, with a suppressor and an ACOG sight.',
    description:
      'ASG AUG A2 in great condition, in its original box with a suppressor and an ACOG sight.',
    extraTags: ['bullpup', 'suppressed'],
    image: 'AUG A2 with scope and suppressor.jpeg',
    flag: 'Alan wrote "agog sight" - read as ACOG. Confirm.',
  },
  {
    slug: 'pre-loved-asg-steyr-aug-a1',
    name: 'ASG Steyr AUG A1',
    subcategory: 'aeg-rifles',
    brand: 'ASG',
    price: '180.00',
    short: 'Great condition with an original AUG sling. Field-repaired front grip.',
    description:
      'ASG AUG A1 in great condition with an original AUG sling. The front grip only folds upward, due to a field repair, but it is nice overall.',
    extraTags: ['bullpup'],
    image: 'STEYR AUG A1 with sling.jpeg',
  },
  {
    slug: 'pre-loved-asg-fal-sa-58',
    name: 'ASG FAL SA 58',
    subcategory: 'aeg-rifles',
    brand: 'ASG',
    price: '240.00',
    short: 'Full steel and very heavy, with grenade launcher, front grip, laser box and torch.',
    description:
      'Full steel and very heavy. Features a grenade launcher, front grip, laser box and torch.',
    extraTags: ['full-metal'],
    image: 'FAL SA58.jpeg',
  },
  {
    slug: 'pre-loved-cyma-hk-g3-bipod',
    name: 'CYMA HK G3 with Bipod',
    subcategory: 'aeg-rifles',
    brand: 'CYMA',
    price: '120.00',
    short: 'A very large rifle with a fold down bipod, in mint condition.',
    description: 'A very large rifle with a fold down bipod, in mint condition.',
    extraTags: ['bipod'],
    image: 'HK G3 with bipod.jpeg',
  },
  {
    slug: 'pre-loved-cyma-hk-g36l',
    name: 'CYMA HK G36L',
    subcategory: 'aeg-rifles',
    brand: 'CYMA',
    price: '180.00',
    short: 'Fitted with a red dot and a two point sling.',
    description: 'Features a red dot and is fitted with a two point sling.',
    extraTags: ['red-dot'],
    image: 'HK G6L.jpeg',
  },
  {
    slug: 'pre-loved-jg-m4',
    name: 'JG M4',
    subcategory: 'aeg-rifles',
    brand: 'JG',
    price: '120.00',
    short: 'An older JG M4 fitted with various accessories.',
    description: 'An old JG M4 fitted with various accessories. Not bad value.',
    extraTags: ['m4'],
    image: 'M4 with Accessories.jpeg',
  },
  {
    slug: 'pre-loved-we-m16-m203',
    name: 'WE M16 with M203',
    subcategory: 'gbbr',
    brand: 'WE',
    price: '245.00',
    short: 'Full steel M16 with a heat shield and two M203 green gas grenades.',
    description:
      'This full steel M16 by WE is fitted with a heat shield and includes 2 M203 green gas grenades, which may need to be resealed. A real bargain.',
    extraTags: ['full-metal', 'green-gas', 'm16'],
    image: 'M16 M203.jpeg',
    flag: 'Filed as GBBR because WE build gas rifles, but Alan did not say. Confirm it is gas and not electric before publishing.',
  },
  {
    slug: 'pre-loved-ssg-69-sniper',
    name: 'SSG 69 Sniper Rifle',
    subcategory: 'sniper',
    brand: 'ASG',
    price: '90.00',
    short: 'Spring powered with a bipod. Needs a scope.',
    description: 'A good spring SSG 69 rifle with a bipod. It just needs a scope. Spring powered.',
    extraTags: ['spring', 'bolt-action', 'bipod'],
    image: 'SSG 69 WITH BIPOD.jpeg',
  },
  {
    slug: 'pre-loved-mb-40a-sniper',
    name: 'MB 40A Sniper Rifle',
    subcategory: 'sniper',
    brand: 'Unbranded',
    price: '120.00',
    short: 'Heavy spring powered bolt action with three 25rd magazines.',
    description: 'A nice heavy spring powered bolt action with 3 x 25rd magazines.',
    extraTags: ['spring', 'bolt-action'],
    image: 'MB 40A SNIPER.jpg',
    flag: 'Alan did not name a maker. Brand left as Unbranded rather than guessed.',
  },
  {
    slug: 'pre-loved-russian-sr3-carbine',
    name: 'Russian SR3 Carbine',
    subcategory: 'aeg-rifles',
    brand: 'Unbranded',
    price: '190.00',
    short: 'Rare, heavily customised, with five hard to find magazines.',
    description:
      'A very rare, heavily customised piece built from a Val or Koer rifle. Includes 5 very hard to find magazines. Requires small stick LiPo batteries.',
    extraTags: ['custom', 'rare'],
    image: 'SR3.jpeg',
    flag: 'Alan did not name a maker. Brand left as Unbranded rather than guessed.',
  },
  {
    slug: 'pre-loved-sten-mk-2-s-silenced',
    name: 'STEN MK 2 S Silenced',
    subcategory: 'smgs',
    brand: 'Unbranded',
    price: '240.00',
    short: 'Heavy full metal British WWII piece with wooden grip, silencer and original sling.',
    description:
      'A great heavy full metal British Second World War piece of history, fitted with a wooden grip and silencer. Laced canvas heat shield and original Sten sling included. More magazines available.',
    extraTags: ['full-metal', 'suppressed', 'wwii'],
    image: 'STEN MK2 S.jpeg',
    flag: 'Alan did not name a maker. Brand left as Unbranded rather than guessed.',
  },
].map(({ extraTags = [], description, ...item }) => ({
  ...item,
  category: 'rifles',
  folder: 'Pre-Loved_Page',
  description: `${description} ${SOLD_AS_SEEN}`,
  tags: [...PRE_LOVED_TAGS, ...extraTags],
}));
