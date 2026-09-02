/**
 * Alan's real stock, transcribed from the seven emails he sent 29 Aug - 1 Sep 2026.
 *
 * This file is the source of truth for the catalogue import, not the CSV. The
 * CSV is generated from it (build-csv.mjs) so that when Alan answers the open
 * questions the fix goes in one place and the file is regenerated.
 *
 * Prices are Alan's own retail prices, in euro, VAT inclusive. `image` is the
 * filename as it came out of the email and `folder` is the email it came from.
 * `flag` records anything I could not settle from the email alone -- those rows
 * need Alan before the product goes live. See README.md for the full list.
 */

const REVOLVER_DESCRIPTION =
  'This heavy weight revolver is made from full steel and is CO2 powered. It comes with 6 brass shells; one BB is placed in the tip of each shell.';

const AAP_01_DESCRIPTION =
  'This blowback semi and full auto pistol features a 25rd Glock green gas magazine.';

const SSG_69_DESCRIPTION =
  'This is a Steyr branded rifle. It is spring powered and holds 25rds in the magazine. Ideal for airsoft sniping or as a back garden plinker.';

export const PISTOLS = [
  {
    slug: 'asg-m9',
    name: 'ASG M9',
    subcategory: 'gbb-pistols',
    brand: 'ASG',
    price: '100.00',
    short: 'Green gas blowback pistol in ABS and steel.',
    description: 'Green gas blowback pistol made from ABS and steel.',
    tags: ['green-gas', 'blowback'],
    image: 'm9.jpg',
  },
  {
    slug: 'asg-1911-tac-master',
    name: 'ASG 1911 Tac Master',
    subcategory: 'gbb-pistols',
    brand: 'ASG',
    price: '140.00',
    short: 'Green gas blowback 1911 with a metal slide.',
    description:
      'Green gas blowback pistol with a metal slide. It can also take a CO2 magazine, not included.',
    tags: ['green-gas', 'co2', 'blowback', '1911'],
    image: 'tac master.jpg',
  },
  {
    slug: 'asg-hw-m9',
    name: 'ASG HW M9',
    subcategory: 'gbb-pistols',
    brand: 'ASG',
    price: '160.00',
    short: 'Full steel heavy weight blowback M9.',
    description:
      'Full steel heavy weight blowback pistol with a green gas magazine. It can also take a CO2 magazine, not included.',
    tags: ['green-gas', 'co2', 'blowback', 'full-metal'],
    image: 'm9 hv.jpg',
  },
  {
    slug: 'asg-cz-p-09',
    name: 'ASG CZ P-09',
    subcategory: 'gbb-pistols',
    brand: 'ASG',
    price: '180.00',
    short: 'Licensed CZ green gas blowback with a metal slide.',
    description:
      'Green gas blowback pistol with a metal slide, featuring CZ markings and supplied in a pistol case.',
    tags: ['green-gas', 'blowback', 'licensed', 'cz'],
    image: 'CZ PO9 BLACK.webp',
    flag: 'Alan wrote "CZ PO9" with a letter O. The product is the CZ P-09, so it is renamed here or nobody searching for it will find it.',
  },
  {
    slug: 'asg-cz-p-09-two-tone',
    name: 'ASG CZ P-09 Two Tone',
    subcategory: 'gbb-pistols',
    brand: 'ASG',
    price: '180.00',
    short: 'Two tone licensed CZ green gas blowback with a metal slide.',
    description:
      'Green gas blowback pistol with a metal slide, featuring CZ markings and supplied in a pistol case.',
    tags: ['green-gas', 'blowback', 'licensed', 'cz', 'two-tone'],
    image: 'CZ PO9 TAN.jpg',
    flag: 'Alan calls it Two Tone; the photo file is called TAN. Confirm the finish name.',
  },
  {
    slug: 'asg-cz-p10',
    name: 'ASG CZ P10',
    subcategory: 'gbb-pistols',
    brand: 'ASG',
    price: '140.00',
    short: 'Compact licensed CZ green gas pistol with a metal slide.',
    description: 'A nice compact green gas CZ pistol with trademarks and a metal slide.',
    tags: ['green-gas', 'licensed', 'cz', 'compact'],
    image: 'CZ P10 ASG.webp',
  },
  {
    slug: 'umarex-g17-gen-4',
    name: 'Umarex G17 Gen 4',
    subcategory: 'gbb-pistols',
    brand: 'Umarex',
    price: '180.00',
    short: 'Licensed Glock with a metal slide and a 25rd green gas magazine.',
    description:
      'This Glock features a metal slide and Glock trademarks. It has a 25rd green gas magazine.',
    tags: ['green-gas', 'blowback', 'licensed', 'glock'],
    image: 'Umarex Glock 17 Gen 4.webp',
  },
  {
    slug: 'asg-dan-wesson-6-inch',
    name: 'ASG Dan Wesson 6"',
    subcategory: 'revolvers',
    brand: 'ASG',
    price: '160.00',
    short: 'Full steel CO2 revolver with six brass shells.',
    description: REVOLVER_DESCRIPTION,
    tags: ['co2', 'revolver', 'full-metal'],
    image: 'Dan Wesson 6 inch chrome.webp',
  },
  {
    slug: 'asg-dan-wesson-2-inch',
    name: 'ASG Dan Wesson 2"',
    subcategory: 'revolvers',
    brand: 'ASG',
    price: '149.00',
    short: 'Full steel CO2 revolver with six brass shells.',
    description: REVOLVER_DESCRIPTION,
    tags: ['co2', 'revolver', 'full-metal'],
    image: 'DW 2.5INCH BL.jpg',
    flag: 'Alan wrote 2 inch; the photo file says 2.5 inch and ASG list a 2.5 inch. Confirm the barrel length before this one goes live.',
  },
  {
    slug: 'asg-715-chrome',
    name: 'ASG 715 Chrome',
    subcategory: 'revolvers',
    brand: 'ASG',
    price: '165.00',
    short: 'Full steel CO2 revolver with six brass shells.',
    description: REVOLVER_DESCRIPTION,
    tags: ['co2', 'revolver', 'full-metal', 'chrome'],
    image: 'DW 715 4INCH.jpg',
    flag: 'Photo file says 4 inch. Confirm the barrel length, and that the finish really is chrome.',
  },
  {
    slug: 'asg-mk23',
    name: 'ASG MK23',
    subcategory: 'gbb-pistols',
    brand: 'ASG',
    price: '100.00',
    short: 'Non-blowback green gas pistol with a removable silencer.',
    description:
      'This is a non-blowback green gas pistol and includes a removable silencer. It is a large pistol, but conserves gas because it is non-blowback.',
    tags: ['green-gas', 'non-blowback', 'suppressed'],
    image: 'MK23.jpg',
  },
  {
    slug: 'action-army-aap-01',
    name: 'Action Army AAP-01',
    subcategory: 'gbb-pistols',
    brand: 'Action Army',
    price: '135.00',
    short: 'Semi and full auto blowback pistol with a 25rd Glock magazine.',
    description: AAP_01_DESCRIPTION,
    tags: ['green-gas', 'blowback', 'full-auto'],
    image: 'AAP-01.jpg',
    flag: 'Alan wrote "AAOP-A1". The product is the Action Army AAP-01, so it is renamed here.',
  },
  {
    slug: 'action-army-aap-01-tan',
    name: 'Action Army AAP-01 Tan',
    subcategory: 'gbb-pistols',
    brand: 'Action Army',
    price: '135.00',
    short: 'Semi and full auto blowback pistol with a 25rd Glock magazine, in tan.',
    description: AAP_01_DESCRIPTION,
    tags: ['green-gas', 'blowback', 'full-auto', 'tan'],
    image: '.AAP-01-TAN..jpg',
    flag: 'Renamed from "AAOP-A1 Tan" for the same reason as the black one.',
  },
].map((item) => ({ ...item, category: 'pistols', folder: 'Website_Pages' }));

export const NEW_RIFLES = [
  {
    slug: 'specna-arms-sa-f02-hal-etu',
    name: 'Specna Arms SA F02 with HAL ETU',
    subcategory: 'aeg-rifles',
    brand: 'Specna Arms',
    price: '240.00',
    short: 'Lightweight carbon fibre M4 with the Specna Arms HAL ETU kit.',
    description:
      'Lightweight carbon fibre M4 featuring the Specna Arms HAL ETU kit. Runs best on a 7.4v LiPo battery, not included.',
    tags: ['aeg', 'm4', 'carbon-fibre', 'etu'],
    image: 'Specna Arms SA-FO2 Gen 2 with HAL ETU Black.webp',
  },
  {
    slug: 'specna-arms-half-tan',
    name: 'Specna Arms Half Tan',
    subcategory: 'aeg-rifles',
    brand: 'Specna Arms',
    price: '200.00',
    short: 'Short compact M4 with flip up sights and rail ports.',
    description:
      'An ideal short compact M4 featuring flip up sights and rail ports for additional rail. Runs best on a 7.4v LiPo battery, not included.',
    tags: ['aeg', 'm4', 'compact', 'two-tone'],
    image: 'Specna Arms  ASR HALF TAN.webp',
  },
  {
    slug: 'asg-ssg-69-scope-and-bipod',
    name: 'ASG SSG 69 with Scope and Bipod',
    subcategory: 'sniper',
    brand: 'ASG',
    price: '',
    short: 'Steyr branded spring sniper rifle, supplied with a scope and bipod.',
    description: `${SSG_69_DESCRIPTION} This one comes with a scope and bipod. No battery or gas required, and one of our best sellers.`,
    tags: ['spring', 'sniper', 'bolt-action', 'licensed'],
    image: 'ASG SSG 69 SCOPE AND BIPOD.webp',
    flag: 'NO PRICE IN THE EMAIL. Alan listed the un-scoped version at 135.00 and left this row blank. Cannot import until he gives a figure.',
  },
  {
    slug: 'asg-ssg-69',
    name: 'ASG SSG 69',
    subcategory: 'sniper',
    brand: 'ASG',
    price: '135.00',
    short: 'Steyr branded spring sniper rifle, no scope or bipod.',
    description: `${SSG_69_DESCRIPTION} This one comes without a scope or bipod. No battery or gas required.`,
    tags: ['spring', 'sniper', 'bolt-action', 'licensed'],
    image: 'ASG SSG69.jpg',
  },
].map((item) => ({ ...item, category: 'rifles', folder: 'New_Rifles', isNew: true }));
