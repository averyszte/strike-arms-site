/**
 * Alan's Masks and Goggles page and his Jumble page, from the emails of
 * 31 Aug and 1 Sep 2026.
 *
 * Alan sent no description copy for either page, only a name and a price, so
 * the descriptions below restate the product plainly rather than invent
 * features. Eye protection is the one thing on the site a customer can be hurt
 * by getting wrong, so no protection rating is claimed that Alan did not state.
 *
 * The mesh half masks sit under gear/headwear because the taxonomy has no face
 * protection subcategory. See README.md - that is a taxonomy question, not
 * something to fix quietly in a data file.
 */

const NO_COPY = 'Alan sent a name and a price only, no description copy.';

export const MASKS = [
  {
    slug: 'mesh-low-profile-goggle-od',
    name: 'Mesh Low Profile Goggle OD',
    subcategory: 'eye-protection',
    price: '14.00',
    short: 'Low profile mesh goggle in olive drab.',
    description: 'Low profile mesh goggle in olive drab.',
    tags: ['eye-protection', 'mesh', 'od'],
    image: 'LOW PROFILE MESH GOGGLE OD.webp',
  },
  {
    slug: 'mesh-low-profile-goggle-black',
    name: 'Mesh Low Profile Goggle Black',
    subcategory: 'eye-protection',
    price: '14.00',
    short: 'Low profile mesh goggle in black.',
    description: 'Low profile mesh goggle in black.',
    tags: ['eye-protection', 'mesh', 'black'],
    image: 'BLACK LOW PROFILE MESH GOGGLE.webp',
  },
  {
    slug: 'black-mesh-visor',
    name: 'Black Mesh Visor',
    subcategory: 'eye-protection',
    price: '19.00',
    short: 'Mesh visor type eye protection in black.',
    description: 'Mesh visor type eye protection in black.',
    tags: ['eye-protection', 'mesh', 'visor', 'black'],
    image: 'BLACK MESH VISOR.webp',
  },
  {
    slug: 'od-mesh-visor',
    name: 'OD Mesh Visor',
    subcategory: 'eye-protection',
    price: '19.00',
    short: 'Mesh visor type eye protection in olive drab.',
    description: 'Mesh visor type eye protection in olive drab.',
    tags: ['eye-protection', 'mesh', 'visor', 'od'],
    image: 'OD MESH VISOR.webp',
  },
  {
    slug: 'bolle-cobra-tpr-clear-lens',
    name: 'Bolle Cobra TPR Clear Lens',
    subcategory: 'eye-protection',
    brand: 'Bolle',
    price: '25.00',
    short: 'Bolle Cobra TPR goggle with a clear lens.',
    description: 'Bolle Cobra TPR goggle with a clear lens.',
    tags: ['eye-protection', 'clear-lens', 'bolle'],
    image: 'BOLLE COBRA TPR.webp',
    flag: 'Bolle publish an impact rating for the Cobra. Do not put one on the page until Alan confirms which model and rating he stocks.',
  },
  {
    slug: 'mesh-half-mask-black',
    name: 'Mesh Half Mask Black with Ear Protection',
    subcategory: 'headwear',
    price: '19.00',
    short: 'Mesh half mask with ear protection, in black.',
    description: 'Mesh half mask with ear protection, in black.',
    tags: ['face-protection', 'mesh', 'black'],
    image: 'HALF MASK WITH EAR PROTECTION.webp',
  },
  {
    slug: 'mesh-half-mask-multicam',
    name: 'Mesh Half Mask Multicam with Ear Protection',
    subcategory: 'headwear',
    price: '19.00',
    short: 'Mesh half mask with ear protection, in multicam.',
    description: 'Mesh half mask with ear protection, in multicam.',
    tags: ['face-protection', 'mesh', 'multicam'],
    image: 'MULTICAM HALF MASK WITH EAR PROTECTION.webp',
  },
  {
    slug: 'mesh-half-mask-od',
    name: 'Mesh Half Mask OD with Ear Protection',
    subcategory: 'headwear',
    price: '19.00',
    short: 'Mesh half mask with ear protection, in olive drab.',
    description: 'Mesh half mask with ear protection, in olive drab.',
    tags: ['face-protection', 'mesh', 'od'],
    image: 'MESH HALF MASK OD.jpeg',
  },
].map((item) => ({
  brand: 'Unbranded',
  ...item,
  // Alan renamed this page Safety Equipment on 19 Sep 2026; the tag puts
  // these on /safety-equipment. build-safety-tags.mjs retags the live rows.
  tags: [...item.tags, 'safety'],
  category: 'gear',
  folder: 'Masks_and_Goggles_Page',
  note: NO_COPY,
}));

export const JUMBLE = [
  {
    slug: 'rifle-bag',
    name: 'Rifle Bag',
    category: 'gear',
    subcategory: 'gun-bags',
    price: '30.00',
    short: 'Padded bag for carrying a rifle.',
    description: 'Padded bag for carrying a rifle.',
    extraTags: ['bag'],
    image: 'Gun bag.jpg',
  },
  {
    slug: 'pistol-case',
    name: 'Pistol Case',
    category: 'accessories',
    subcategory: 'cases',
    price: '18.00',
    short: 'Case for carrying a pistol.',
    description: 'Case for carrying a pistol.',
    extraTags: ['case'],
    image: 'pistol case.jpg',
  },
  {
    slug: 'multicam-helmet',
    name: 'Multicam Helmet',
    category: 'gear',
    subcategory: 'helmets',
    price: '59.00',
    short: 'Multicam helmet, one size fits all.',
    description: 'Multicam helmet, one size fits all.',
    extraTags: ['multicam', 'helmet'],
    image: 'MULTICAM FMA FAST HELMET.webp',
    flag: 'Photo file names it an FMA FAST helmet. Confirm the maker and model before setting the brand.',
  },
  {
    slug: 'multicam-vest',
    name: 'Multicam Vest',
    category: 'gear',
    subcategory: 'plate-carriers',
    price: '65.00',
    short: 'Multicam vest, one size fits all.',
    description: 'Multicam vest, one size fits all.',
    extraTags: ['multicam', 'vest'],
    image: 'MULTICAM PLATE CARRIER.webp',
    flag: 'Alan calls it a vest; the photo file calls it a plate carrier. Filed under plate carriers. Confirm.',
  },
  {
    slug: 'red-dot-scope',
    name: 'Red Dot Scope',
    category: 'accessories',
    subcategory: 'optics',
    price: '45.00',
    short: 'Red dot sight.',
    description: 'Red dot sight.',
    extraTags: ['red-dot', 'optic'],
    image: 'RED DOT 1X35.jpg',
    flag: 'Photo file says 1x35. Confirm the model so the name can be specific.',
  },
  {
    slug: 'asg-3-9x40-telescopic-scope',
    name: 'ASG 3-9x40 Telescopic Scope',
    category: 'accessories',
    subcategory: 'scopes',
    brand: 'ASG',
    price: '50.00',
    short: '3-9x40 telescopic rifle scope.',
    description: '3-9x40 telescopic rifle scope.',
    extraTags: ['scope', 'optic'],
    image: '3X9X40.jpg',
    flag: 'Alan wrote "3-9-40"; read as 3-9x40.',
  },
  {
    slug: 'asg-4x32-mini-telescopic-scope',
    name: 'ASG 4x32 Mini Telescopic Scope',
    category: 'accessories',
    subcategory: 'scopes',
    brand: 'ASG',
    price: '55.00',
    short: '4x32 mini telescopic rifle scope.',
    description: '4x32 mini telescopic rifle scope.',
    extraTags: ['scope', 'optic', 'compact'],
    image: '3X32.jpg',
    flag: 'Alan says 4x32; the photo file says 3x32. It is also priced above the larger 3-9x40, which is worth a second look.',
  },
].map(({ extraTags = [], ...item }) => ({
  brand: 'Unbranded',
  ...item,
  folder: 'Our_Jumble_Page',
  tags: ['jumble', ...extraTags],
  note: NO_COPY,
}));
