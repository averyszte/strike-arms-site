import type { Loadout } from '@/types/loadout';

// The curated kit bundles shown on the homepage. Hand-maintained: these are
// marketing groupings, not catalogue rows. Products are referenced by slug and
// their names and prices come from the catalogue. Hotspot x/y are percentages
// of the image box.
export const loadouts: Loadout[] = [
  {
    id: 'beginner',
    name: 'Beginner Setup',
    image: '/images/playstyles/beginner-setup.webp',
    hotspots: [
      { label: 'Specna Arms Half Tan', x: 59, y: 68 },
      { label: 'Red Dot Sight', x: 52, y: 47 },
      { label: 'Leather Gloves', x: 44, y: 58 },
    ],
    products: [
      {
        slug: 'specna-arms-half-tan',
        desc: 'Short, compact M4 with flip-up sights and rail ports. Runs best on a 7.4v LiPo, not included.',
      },
      {
        slug: 'red-dot-scope',
        desc: 'A 1x35 red dot sight for quicker target pickup than iron sights.',
      },
      {
        slug: 'viper-black-leather-gloves-small',
        desc: 'Viper black leather gloves in size small. Used, and a cheap way to protect your hands.',
      },
      {
        slug: 'asg-blaster-gamma-25g-bbs',
        desc: '4,000 .25g BBs, a common weight for AEGs.',
      },
    ],
  },
  {
    id: 'milsim',
    name: 'MIL-SIM',
    image: '/images/playstyles/mil-sim.webp',
    hotspots: [
      { label: 'SA F02 HAL ETU', x: 32, y: 55 },
      { label: 'Red Dot Sight', x: 51, y: 44 },
      { label: 'Halo Suppressor', x: 72, y: 51 },
    ],
    products: [
      {
        slug: 'specna-arms-sa-f02-hal-etu',
        desc: 'Lightweight carbon fibre M4 with the Specna Arms HAL ETU kit. Runs best on a 7.4v LiPo, not included.',
      },
      {
        slug: 'gemtech-boise-id-halo-suppressor-m4-muzzle',
        desc: 'Gemtech Boise ID Halo suppressor with an M4 muzzle attachment. Old stock.',
      },
      {
        slug: 'red-dot-scope',
        desc: 'A 1x35 red dot sight for quicker target pickup than iron sights.',
      },
    ],
  },
  {
    id: 'sniper',
    name: 'Sniper',
    image: '/images/playstyles/sniper.webp',
    hotspots: [
      { label: 'ASG SSG 69', x: 42, y: 52 },
      { label: '3-9x40 Scope', x: 36, y: 40 },
      { label: 'Mesh Mask', x: 28, y: 28 },
    ],
    products: [
      {
        slug: 'asg-ssg-69',
        desc: 'Steyr-branded spring sniper rifle with a 25-round magazine. No battery or gas needed. Comes without a scope or bipod.',
      },
      {
        slug: 'asg-3-9x40-telescopic-scope',
        desc: 'A 3-9x40 telescopic scope for picking out targets at range.',
      },
      {
        slug: 'mesh-half-mask-black',
        desc: 'Mesh half mask with ear protection, in black.',
      },
      {
        slug: 'asg-alpha-blaster-30g-bbs',
        desc: '3,300 .30g BBs. The heavier weight suits a sniper rifle.',
      },
    ],
  },
];

/** Every slug the showcase needs, so one query can fetch them all. */
export const LOADOUT_SLUGS: string[] = [
  ...new Set(loadouts.flatMap((loadout) => loadout.products.map((p) => p.slug))),
];
