/**
 * Alan's second Jumble batch, from his emails of 27 Sep 2026 ("Jumble Page
 * items", "Jumble page items B", "Jumble Page C"). Photos are named by his
 * item code, A1.jpeg to C24.jpeg.
 *
 * One line per item, because there are seventy-odd of them:
 *   [code, slug, name, 'category/subcategory', price, short, options]
 *
 * Alan's rule of thumb is read literally: an item he calls "used" or
 * "pre-owned" imports as pre-loved, and everything else as new. Every row is a
 * one-off, so it opens with a stock of one; where Alan listed the same thing
 * twice under two codes they are two designs, so each is its own product.
 *
 * His code goes into the description, which only the admin shows, so he can
 * match a product back to his list.
 */

const USED = { used: true };
/** Helmets and masks also go on Alan's Safety Equipment page. */
const SAFETY = { safety: true };

const ROWS = [
  ['A1', 'ghillie-partial-suit-wool', 'Ghillie Partial Suit, Wool Type', 'gear/ghillie', '30.00', 'Partial ghillie suit, head dress and torso, wool type. Used.', USED],
  ['A2', 'smg-magazine-pouches-webb-belt', 'SMG Magazine Pouches with Webb Belt', 'gear/pouches', '35.00', 'Magazine pouches on a webb belt, suits the longer SMG type magazines.'],
  ['A3', 'water-canteen-webb-belt', 'Water Canteen and Webb Belt', 'more/outdoor', '25.00', 'Water canteen and webb belt, a surplus item.', USED],
  ['A4', 'ww2-replica-german-gas-mask-container', 'WW2 Replica German Gas Mask Container', 'gear/headwear', '45.00', 'Replica WW2 German steel gas mask container.', SAFETY],
  ['A5', 'small-shoulder-bag-od', 'Small Shoulder Bag OD', 'gear/pouches', '5.00', 'Small olive drab shoulder bag with a velcro fastener.'],
  ['A6', 'viper-black-leather-gloves-small', 'Viper Black Leather Gloves, Small', 'gear/gloves', '5.00', 'Black leather gloves by Viper, size small. Used.', { used: true, brand: 'Viper Tactical' }],
  ['A7', 'camo-dump-pouch', 'Camo Dump Pouch', 'gear/pouches', '10.00', 'Camo dump pouch.'],
  ['A8', 'invader-gear-black-dump-pouch', 'Invader Gear Black Dump Pouch', 'gear/pouches', '15.00', 'Black dump pouch by Invader Gear.', { brand: 'Invader Gear' }],
  ['A9', 'black-molle-grenade-pouch', 'Black MOLLE Grenade Pouch', 'gear/pouches', '10.00', 'Black grenade pouch with MOLLE attachments.'],
  ['A10', 'black-molle-m4-magazine-pouch', 'Black MOLLE M4 Magazine Pouch', 'gear/pouches', '8.00', 'Black M4 magazine pouch with MOLLE attachment.'],
  ['A11', 'black-camo-molle-m4-magazine-pouch', 'Black Camo MOLLE M4 Magazine Pouch', 'gear/pouches', '8.00', 'Black camo M4 magazine pouch with MOLLE attachment.'],
  ['A12', 'black-universal-holster', 'Black Universal Holster', 'gear/holsters', '10.00', 'Black universal holster. Used, in great condition.', USED],
  ['A13', 'black-water-canteen-webb-belt', 'Black Water Canteen with Belt Attachment', 'more/outdoor', '10.00', 'Black water canteen with a webb belt attachment. Used.', USED],
  ['A14', 'od-holster-shoulder-strap', 'OD Holster with Shoulder Strap', 'gear/holsters', '10.00', 'Olive drab holster with shoulder strap, marked U.S.'],
  ['A15', 'gas-cooking-stove', 'Gas Cooking Stove', 'more/camping', '10.00', 'Pre-owned gas cooking stove for camping, in mint condition.', USED],
  ['A16', 'woodland-camo-waist-bag', 'Woodland Camo Waist Bag', 'gear/pouches', '8.00', 'Woodland camo waist bag with zips.'],
  ['A17', 'black-molle-right-leg-panel', 'Black MOLLE Right Leg Panel', 'gear/pouches', '10.00', 'Black MOLLE right leg panel for attachments.'],
  ['A18', 'black-plate-carrier-chest-molle-panel', 'Black Plate Carrier Chest MOLLE Panel', 'gear/plate-carriers', '5.00', 'Black plate carrier chest MOLLE panel with clips.'],
  ['A19', 'flecktarn-waist-pouch', 'Flecktarn Waist Pouch, Large', 'gear/pouches', '15.00', 'Large Flecktarn waist pouch with zipped pouches. Used.', USED],
  ['A20', 'od-molle-belt-pouch', 'OD MOLLE Belt Pouch', 'gear/pouches', '8.00', 'Olive drab MOLLE pouch for a belt.'],
  ['A21', 'tan-twin-pistol-magazine-pouch', 'Tan Twin Pistol Magazine Pouch', 'gear/pouches', '15.00', 'Tan twin pistol magazine pouch, universal fit.'],
  ['A22', 'black-mesh-mask-nose-teeth', 'Black Mesh Mask', 'gear/headwear', '10.00', 'Black mesh mask covering the nose and teeth.', SAFETY],
  ['A23', 'eastern-bloc-police-riot-helmet', 'Eastern Bloc Police Riot Helmet', 'gear/helmets', '40.00', 'Vintage Eastern Bloc police riot helmet. Used.', { used: true, safety: true }],
  ['A24', 'molle-shotgun-shell-holder', 'MOLLE Shotgun Shell Holder', 'gear/pouches', '10.00', 'Hard plastic shotgun shell dispenser with MOLLE attachments.'],
  ['A25', 'black-kydex-pistol-magazine-holder', 'Black Kydex Pistol Magazine Holder', 'gear/pouches', '5.00', 'Black Kydex pistol magazine holder that clips to a belt. Loose fit.'],

  ['B1', 'g36-magazine-loader', 'G36 Magazine Loader', 'consumables/speed-loaders', '5.00', 'G36 magazine loader. Used.', USED],
  ['B2', '25mm-low-scope-ring', '25mm Low Scope Ring', 'accessories/mounts', '3.00', 'Single 25mm scope ring, low mount type. Used.', USED],
  ['B3', 'm4-hi-cap-magazine-decorative', 'M4 Hi-Cap Magazine, Decorative', 'rifles/rifle-magazines', '10.00', 'M4 hi-cap magazine, decorative. Used, nice.', USED],
  ['B4', 'ak-200rd-steel-magazine', 'AK 200rd Steel Magazine', 'rifles/rifle-magazines', '10.00', 'AK 200 round steel magazine. Used.', USED],
  ['B5', 'm4-magpul-style-fore-end', 'M4 Magpul Style Fore End', 'accessories/rails', '10.00', 'M4 Magpul style fore end. Used.', USED],
  ['B6', 'bipod-20mm-ris', 'Bipod for 20mm RIS', 'accessories/bipods', '20.00', 'Bipod for 20mm RIS attachment.'],
  ['B7', 'm4a1-style-stock-smooth', 'M4A1 Style Stock, Smooth', 'accessories/rails', '5.00', 'M4A1 style stock with smooth sides. Used.', USED],
  ['B8', 'm4a1-style-stock-ribbed', 'M4A1 Style Stock, Ribbed', 'accessories/rails', '5.00', 'M4A1 style stock with ribbed sides. Used.', USED],
  ['B9', 'spotting-scope', 'Spotting Scope', 'accessories/optics', '15.00', 'Spotting scope, good, missing its tripod. Used.', USED],
  ['B10', 'wrist-band-compass', 'Compass on Velcro Wrist Band', 'more/outdoor', '5.00', 'Compass on a velcro wrist band. Used.', USED],
  ['B11', 'military-style-compass-pouch', 'Military Style Compass with Pouch', 'more/outdoor', '10.00', 'Military style compass with pouch. Used, nice.', USED],
  ['B12', 'spring-shotgun-magazines-pair', 'Spring Shotgun Magazines, Pair', 'rifles/rifle-magazines', '5.00', 'Two spring shotgun magazines. Used.', USED],
  ['B13', 'plastic-red-dot-sight', 'Plastic Red Dot Sight', 'accessories/optics', '20.00', 'Red dot scope, plastic type, new in packet.'],
  ['B14', '3-9x40-scope-no-rings', '3-9x40 Scope, No Rings', 'accessories/scopes', '20.00', '3-9x40 scope, good, missing its rings. Used.', USED],
  ['B15', 'bushnell-3-9x32-scope-rings', 'Bushnell 3-9x32 Scope with Rings', 'accessories/scopes', '40.00', 'Bushnell 3-9x32 scope with rings. Used, great.', { used: true, brand: 'Bushnell' }],
  ['B16', '3-9x40-scope-rings-boxed', '3-9x40 Scope with Rings, Boxed', 'accessories/scopes', '50.00', '3-9x40 scope in the box, with rings.'],
  ['B17', 'od-tactical-belt', 'OD Tactical Belt', 'gear/battle-belts', '10.00', 'Olive drab tactical belt.'],
  ['B18', 'black-adjustable-webb-belt', 'Black Adjustable Webb Belt', 'gear/battle-belts', '10.00', 'Black webb belt, adjustable, fits all. Used, good.', USED],
  ['B19', 'camo-adjustable-webb-belt', 'Camo Adjustable Webb Belt', 'gear/battle-belts', '10.00', 'Camo webb belt, adjustable, fits all. Used, good.', USED],
  ['B20', 'od-single-point-sling-used', 'OD Single Point Sling, Used', 'accessories/slings', '10.00', 'Olive drab single point sling. Used.', USED],
  ['B21', 'black-single-point-sling-used', 'Black Single Point Sling, Used', 'accessories/slings', '10.00', 'Black single point sling. Used.', USED],
  ['B22', 'm4-front-ris-rail-boxed', 'M4 Front RIS Rail, Boxed', 'accessories/rails', '20.00', 'M4 front RIS rail, new in box.'],
  ['B23', 'm4-front-ris-rail-used', 'M4 Front RIS Rail, Used', 'accessories/rails', '15.00', 'M4 front RIS rail. Used.', USED],
  ['B24', 'gemtech-boise-id-halo-suppressor-m4-muzzle', 'Gemtech Boise ID Halo Suppressor with M4 Muzzle Attachment', 'accessories/suppressors', '20.00', 'Gemtech Boise ID Halo suppressor with M4 muzzle attachment, old stock.', { brand: 'Gemtech' }],
  ['B25', 'stock-sling-d-attachment', 'Rifle Stock Sling D Attachment', 'accessories/slings', '5.00', 'Rifle stock sling D attachment for a single point sling.'],

  ['C1', 'large-carbine-clips-3', 'Large Carbine Clips, Pack of 3', 'gear/pouches', '3.50', 'Three large carbine clips, for tac vest attachment.'],
  ['C2', 'woodland-camo-tape', 'Woodland Camo Tape', 'gear/camo', '9.00', 'Woodland camo tape.'],
  ['C3', 'm4-stubby-ris-front-rail', 'M4 Stubby RIS Front Rail', 'accessories/rails', '5.00', 'M4 stubby RIS front rail system. Used.', USED],
  ['C4', 'fast-helmet-camera-mount', 'FAST Helmet Camera Mount', 'accessories/mounts', '5.00', 'FAST helmet camera attachment, for a GoPro and similar.'],
  ['C5', 'ak-74-rear-sight-assembly', 'AK 74 Rear Sight Assembly', 'accessories/rails', '19.00', 'AK 74 rear sight assembly.'],
  ['C6', 'od-single-point-sling', 'OD Single Point Sling', 'accessories/slings', '18.00', 'Olive drab single point sling.'],
  ['C7', 'black-two-point-sling', 'Black Two Point Sling', 'accessories/slings', '18.00', 'Black two point sling.'],
  ['C8', 'green-one-hole-balaclava', 'Green One Hole Balaclava', 'gear/headwear', '9.00', 'Green one hole balaclava.'],
  ['C10', 'green-ninja-light-balaclava', 'Green Ninja Type Light Balaclava', 'gear/headwear', '9.00', 'Green ninja type light balaclava.'],
  ['C11', 'black-one-hole-balaclava', 'Black One Hole Balaclava', 'gear/headwear', '9.00', 'Black one hole balaclava.'],
  ['C12', 'black-snood', 'Black Snood', 'gear/headwear', '3.00', 'Black snood, old stock.'],
  ['C13', 'urban-camo-peaked-cap', 'Urban Camo Peaked Cap', 'gear/headwear', '9.00', 'Peaked cap in urban camo. Used.', USED],
  ['C14', 'camo-baseball-cap', 'Camo Baseball Cap', 'gear/headwear', '15.00', 'Camo baseball style cap, adjustable.'],
  ['C15', 'camo-golfer-hat', 'Camo Golfer Style Hat', 'gear/headwear', '5.00', 'Camo golfer style hat with the letter B. Used.', USED],
  ['C16', 'black-boonie-hat-brass-eyelets', 'Black Boonie Hat, Brass Eyelets', 'gear/headwear', '8.00', 'Black boonie hat with brass eyelets, adult size. Used.', USED],
  ['C17', 'black-boonie-hat-foliage-loops', 'Black Boonie Hat, Foliage Loops', 'gear/headwear', '8.00', 'Black boonie hat with foliage loops, adult size. Used.', USED],
  ['C18', 'south-african-style-tac-vest-desert', 'South African Style Tac Vest, Desert Camo', 'gear/chest-rigs', '40.00', 'South African style tac vest in desert camo. Used.', USED],
  ['C19', 'od-tac-vest-holster-m4-pouches', 'OD Tac Vest with Holster and M4 Pouches', 'gear/chest-rigs', '40.00', 'Olive drab tac vest with a holster and M4 pouches. Used.', USED],
  ['C20', 'leaf-print-ghillie-suit-large', 'Leaf Print Ghillie Suit, Large', 'gear/ghillie', '25.00', 'Ghillie suit in a bag, large adult size, leaf print. Used.', USED],
  ['C21', 'woollen-ghillie-suit-stuff-sack', 'Woollen Ghillie Suit with Stuff Sack', 'gear/ghillie', '50.00', 'Woollen type ghillie suit in a stuff sack, adult size. Used.', USED],
  ['C22', 'camo-bag-extra-pouch', 'Camo Bag with Extra Pouch', 'more/outdoor', '15.00', 'Camo schoolbag type bag with an extra pouch attached. Used.', USED],
  ['C23', 'digital-plate-carrier-3-pouches-style-1', 'Digital Pattern Plate Carrier with 3 Pouches, Style 1', 'gear/plate-carriers', '40.00', 'Digital pattern plate carrier with three pouches, in good used condition.', USED],
  ['C24', 'digital-plate-carrier-3-pouches-style-2', 'Digital Pattern Plate Carrier with 3 Pouches, Style 2', 'gear/plate-carriers', '40.00', 'Digital pattern plate carrier with three pouches, in good used condition.', USED],
];

export const JUMBLE_BATCH_2 = ROWS.map(([code, slug, name, path, price, short, options = {}]) => {
  const [category, subcategory] = path.split('/');
  return {
    slug,
    name,
    category,
    subcategory,
    brand: options.brand ?? 'Unbranded',
    price,
    short,
    description: `${short} Alan's jumble list ref ${code}.`,
    condition: options.used ? 'pre-loved' : 'new',
    stock: 1,
    tags: options.safety ? ['jumble', 'safety'] : ['jumble'],
    image: `${code}.jpeg`,
    folder: 'Jumble_Batch_2',
    flag: options.flag,
  };
});
