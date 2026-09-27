/**
 * Alan's Magazines page, from his email "Two more page titles and photos" of
 * 19 Sep 2026. He sent a name, a price and a photo for each, no copy, so the
 * short line restates the name rather than claim a fit Alan did not state.
 *
 *   [slug, name, 'category/subcategory', brand, price, short, image, options]
 *
 * Alan gave no quantities, so these open at stock 0 and need Adjust stock.
 */

const ROWS = [
  ['ak-47-600rd-high-capacity-magazine', 'AK 47 600rd High Capacity Magazine', 'rifles/rifle-magazines', 'Unbranded', '18.00', '600 round high capacity magazine, AK 47 pattern.', 'AK 47 600rd High Capacity Magazine.webp'],
  ['ak-74-mid-capacity-magazine', 'AK 74 Mid Capacity Magazine', 'rifles/rifle-magazines', 'Unbranded', '15.00', 'Mid capacity magazine, AK 74 pattern.', 'AK 74 Mid Capacity Magazine.webp'],
  ['aug-300rd-magazine', 'AUG 300rd Magazine', 'rifles/rifle-magazines', 'Unbranded', '18.00', '300 round magazine, AUG pattern.', 'AUG 300rd magazine.webp'],
  ['evolution-m4-matrix-300rd-hi-cap-magazine', 'Evolution M4 Matrix 300rd Hi Capacity Magazine', 'rifles/rifle-magazines', 'Evolution', '20.00', 'Evolution Matrix 300 round high capacity magazine, M4 pattern.', 'Evolution M4 Matrix High Cap 300rd Magazine.jpg'],
  ['evolution-m4-matrix-120rd-mid-cap-magazine', 'Evolution M4 Matrix 120rd Mid Capacity Magazine', 'rifles/rifle-magazines', 'Evolution', '18.00', 'Evolution Matrix 120 round mid capacity magazine, M4 pattern.', 'Evolution M4 Matrix Mid Cap 120rd Magazine.jpg'],
  ['fn-fal-58-mid-capacity-magazine', 'FN FAL 58 Mid Capacity Magazine', 'rifles/rifle-magazines', 'Unbranded', '15.00', 'Mid capacity magazine, FN FAL 58 pattern.', 'FN FAL 58 Mid Capacity Magazine.webp'],
  ['fn-fal-58-high-capacity-magazine', 'FN FAL 58 High Capacity Magazine', 'rifles/rifle-magazines', 'Unbranded', '18.00', 'High capacity magazine, FN FAL 58 pattern.', 'FN FAL High Capacity Magazine.webp'],
  ['g36c-450rd-high-capacity-magazine', 'G36C 450rd High Capacity Magazine', 'rifles/rifle-magazines', 'Unbranded', '18.00', '450 round high capacity magazine, G36C pattern.', 'G36 470 rd Magazine.webp'],
  ['kriss-vector-high-capacity-magazine', 'Kriss Vector High Capacity Magazine', 'rifles/rifle-magazines', 'Unbranded', '15.00', 'High capacity magazine, Kriss Vector pattern.', 'Kriss Vector High Capacity Magazine.jpg'],
  ['m4-300rd-high-capacity-magazine', 'M4 300rd High Capacity Magazine', 'rifles/rifle-magazines', 'Unbranded', '18.00', '300 round high capacity magazine, M4 pattern.', 'M4 300rd High Capacity 300rd Magazine.webp'],
  ['m4-120rd-mid-capacity-magazine', 'M4 120rd Mid Capacity Magazine', 'rifles/rifle-magazines', 'Unbranded', '15.00', '120 round mid capacity magazine, M4 pattern.', 'M4 Mid Capacity Magazine..jpg'],
  ['mp40-sten-ww2-120rd-mid-capacity-magazine', 'MP40 & Sten WW2 120rd Mid Capacity Magazine', 'rifles/rifle-magazines', 'Unbranded', '10.00', '120 round mid capacity magazine for the MP40 and Sten.', 'MP40 & STEN WW2 120rd Mid Capacity Magazine.jpg'],
  ['r4-mp7-mid-capacity-magazine', 'R4 MP7 Mid Capacity Magazine', 'rifles/rifle-magazines', 'Unbranded', '10.00', 'Mid capacity magazine, R4 MP7 pattern.', 'R4 MP7 Mid Capacity Magazine.jpg'],
  ['well-mac-11-green-gas-magazine', 'Well Mac 11 Green Gas Magazine', 'pistols/pistol-magazines', 'Well', '30.00', 'Green gas magazine for the Well Mac 11.', 'WELL MAC 11 Green Gas Magazine.jpg'],
  ['umarex-glock-17-green-gas-magazine', 'Umarex Glock 17 Green Gas Magazine', 'pistols/pistol-magazines', 'Umarex', '45.00', 'Green gas magazine for the Umarex Glock 17.', 'Umarex Glock Green Gas Magazine.webp'],
  ['pre-loved-we-m92-co2-magazine', 'WE M92 CO2 Magazine', 'pistols/pistol-magazines', 'WE', '15.00', 'CO2 magazine for the WE M92. Pre-owned.', 'WE M9 CO2 Magazine ( Pre-Owned ).jpg', { used: true }],
  ['double-bell-sig-p226-green-gas-magazine', 'Double Bell Sig P226 Green Gas Magazine', 'pistols/pistol-magazines', 'Double Bell', '15.00', 'Green gas magazine for the Double Bell Sig P226.', 'Double Bell Brand SIG 226 Green Gas Magazine.webp'],
  ['makarov-nbb-co2-magazine-twin-pack', 'Makarov NBB CO2 Pistol Magazine, Twin Pack', 'pistols/pistol-magazines', 'Unbranded', '20.00', 'Twin pack of magazines for a non-blowback CO2 Makarov pistol.', 'Makorov Magazine for NBB CO2 pistol.jpeg'],
];

export const MAGAZINES = ROWS.map(([slug, name, path, brand, price, short, image, options = {}]) => {
  const [category, subcategory] = path.split('/');
  return {
    slug,
    name,
    category,
    subcategory,
    brand,
    price,
    short,
    description: short,
    condition: options.used ? 'pre-loved' : 'new',
    tags: ['magazine'],
    image,
    folder: 'Magazines',
    flag: options.flag,
  };
});
