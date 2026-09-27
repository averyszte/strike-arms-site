/**
 * Two of Alan's pages from 19 Sep 2026: the gloves he added to Safety
 * Equipment (the page he renamed from Masks & Goggles), and his Wallhangers &
 * Props page.
 *
 * GLOVES. Alan says they come in small, medium and large. The shop has no size
 * picker, so each size is its own product: that way a customer chooses the
 * size they pay for and the stock count is per size. Quantities were not given.
 *
 * WALLHANGERS. Non-firing or written-off replicas, each a one-off, so each
 * opens with a stock of one and imports as pre-loved. Alan's warning about
 * them is the subcategory intro in src/lib/taxonomy.ts, shown at the top of
 * the page, not repeated here. He sent no photos for this page.
 */

const GLOVE_SIZES = ['Small', 'Medium', 'Large'];
const GLOVE_COLOURS = [
  { colour: 'Black', image: 'Viper Tac glove black.webp' },
  { colour: 'OD', image: 'Viper tac glove OD.webp' },
];

export const SAFETY_GLOVES = GLOVE_COLOURS.flatMap(({ colour, image }) =>
  GLOVE_SIZES.map((size) => {
    const short = `Viper tactical glove in ${colour === 'OD' ? 'olive drab' : 'black'}, size ${size.toLowerCase()}.`;
    return {
      slug: `viper-tactical-glove-${colour.toLowerCase()}-${size.toLowerCase()}`,
      name: `Viper Tactical Glove ${colour}, ${size}`,
      category: 'gear',
      subcategory: 'gloves',
      brand: 'Viper Tactical',
      price: '25.00',
      short,
      description: short,
      tags: ['safety', 'gloves'],
      image,
      folder: 'Safety_Equipment',
    };
  }),
);

const WALLHANGER_ROWS = [
  ['aap-01-wallhanger', 'AAP-01', 'Unbranded', '30.00', 'Side folding stock and a removable magazine.', 'Alan wrote "AAOP-A1"; corrected to AAP-01, as on the Pre-loved page.'],
  ['full-metal-dan-wesson-wallhanger', 'Full Metal Dan Wesson', 'Unbranded', '20.00', 'Includes six brass shells. A good prop.'],
  ['m92-plastic-wallhanger', 'M92, Plastic', 'Unbranded', '20.00', 'Plastic. Can be cocked back and the magazine is removable.'],
  ['beretta-rifle-wallhanger', 'Beretta Rifle', 'Unbranded', '70.00', 'Fully functioning as an airsoft rifle, but makes a better prop.'],
  ['famas-rifle-wallhanger', 'Famas Rifle', 'Unbranded', '70.00', 'Mostly plastic and slightly transparent. The magazine detaches.'],
  ['m4-eotech-sight-wallhanger', 'M4 with Eotech Sight', 'Unbranded', '40.00', 'Looks well worn and the sight is shattered. A nice rugged prop.'],
  ['m16-full-metal-wallhanger', 'M16 Full Metal', 'Unbranded', '200.00', 'Full steel replica, ideal for a collector or Vietnam re-enactor. Includes two detachable magazines with dummy rounds, and a Kalashnikov sling attached.'],
  ['mp5-fixed-stock-wallhanger', 'MP5 Fixed Stock', 'Unbranded', '50.00', 'Full metal and very heavy. The magazine detaches. Rugged and scratched, a great prop.'],
  ['mp5-retractable-stock-wallhanger', 'MP5 Retractable Stock', 'Unbranded', '50.00', 'Plastic and steel, with a detachable magazine and a retractable stock. Missing a selector on one side.'],
  ['plastic-m4-wallhanger', 'Plastic M4', 'Unbranded', '15.00', 'Very lightweight, suitable for a costume or cosplay.'],
  ['plastic-m4-suppressor-wallhanger', 'Plastic M4 with Suppressor', 'Unbranded', '20.00', 'Very lightweight, good for a costume or prop.'],
  ['tm-g36l-wallhanger', 'Tokyo Marui G36L', 'Tokyo Marui', '80.00', 'G36L with recoil. Sold as non-firing, but shoots intermittently. A great prop, wallhanger or parts gun. Includes a gun bag with some additional accessories.'],
];

export const WALLHANGERS = WALLHANGER_ROWS.map(([slug, name, brand, price, short, flag]) => ({
  slug,
  name,
  category: 'more',
  subcategory: 'wallhangers-props',
  brand,
  price,
  short,
  description: short,
  condition: 'pre-loved',
  stock: 1,
  tags: ['wallhanger'],
  folder: 'Wallhangers_Props',
  flag,
}));
