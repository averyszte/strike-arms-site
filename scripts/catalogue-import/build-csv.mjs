/**
 * Turns the catalogue modules into products.csv, in the exact column shape the
 * admin importer answers to (artifacts/strike-arms/src/lib/products-csv.ts).
 *
 * It validates before it writes, because the importer's own preview is the last
 * line of defence and a bad category there costs a round trip. A row with no
 * price is left out of the CSV and named in the report rather than shipped with
 * a guessed figure.
 *
 * Usage:  node scripts/catalogue-import/build-csv.mjs
 *
 * Image URLs are filled in by upload-images.mjs, which writes image-urls.json
 * next to this file. If that file is present its URLs are used; if not, the
 * Images column comes out empty and the report says so.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { CATALOGUE, PAGES, IMPORT_PUBLISHED, IMPORT_SHIPPABLE } from './catalogue.mjs';
import { brandSlug } from './brands.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..');
const TAXONOMY_FILE = join(REPO, 'artifacts', 'strike-arms', 'src', 'lib', 'taxonomy.ts');
const IMAGES_DIR = join(HERE, 'images');
const URLS_FILE = join(HERE, 'image-urls.json');
const OUT_FILE = join(HERE, 'products.csv');

const COLUMNS = [
  'Slug',
  'Name',
  'Category',
  'Subcategory',
  'Brand',
  'Condition',
  'Price',
  'Sale price',
  'Short description',
  'Description',
  'Images',
  'Tags',
  'Published',
  'Featured',
  'New',
  'Can be posted',
  'Stock',
];

const CATEGORY_SLUGS = ['rifles', 'pistols', 'consumables', 'accessories', 'gear', 'parts', 'more'];

/**
 * Reads the real taxonomy rather than keeping a second copy of it. Slugs appear
 * in source order, and no subcategory shares a name with a category, so a slug
 * that is a category name opens a new bucket and everything after it belongs to
 * that bucket.
 */
function readTaxonomy() {
  const source = readFileSync(TAXONOMY_FILE, 'utf8');
  const slugs = [...source.matchAll(/\bslug: '([a-z0-9-]+)'/g)].map((match) => match[1]);
  const byCategory = new Map();
  let current = null;
  for (const slug of slugs) {
    if (CATEGORY_SLUGS.includes(slug)) {
      current = slug;
      byCategory.set(current, new Set());
    } else if (current) {
      byCategory.get(current).add(slug);
    }
  }
  return byCategory;
}

function validate(taxonomy) {
  const problems = [];
  const seen = new Set();

  for (const item of CATALOGUE) {
    const where = item.slug || item.name;
    if (seen.has(item.slug)) problems.push(`${where}: duplicate slug`);
    seen.add(item.slug);

    for (const field of ['slug', 'name', 'category', 'subcategory', 'brand', 'short']) {
      if (!item[field]) problems.push(`${where}: missing ${field}`);
    }

    const subcategories = taxonomy.get(item.category);
    if (!subcategories) {
      problems.push(`${where}: category "${item.category}" is not in taxonomy.ts`);
    } else if (!subcategories.has(item.subcategory)) {
      problems.push(`${where}: "${item.subcategory}" is not a subcategory of ${item.category}`);
    }

    if (item.brand && !brandSlug(item.brand)) {
      problems.push(`${where}: brand "${item.brand}" has no slug in brands.mjs`);
    }

    if (item.image && !existsSync(join(IMAGES_DIR, item.folder, item.image))) {
      problems.push(`${where}: photo not found - ${item.folder}/${item.image}`);
    }
  }

  return problems;
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function row(item, urls) {
  return [
    item.slug,
    item.name,
    item.category,
    item.subcategory,
    brandSlug(item.brand),
    // Everything except the Pre-Loved page is new stock.
    item.condition === 'pre-loved' ? 'Pre-loved' : 'New',
    item.price,
    '',
    item.short,
    item.description ?? item.short,
    urls[item.slug] ?? '',
    (item.tags ?? []).join(';'),
    IMPORT_PUBLISHED ? 'Yes' : 'No',
    'No',
    item.isNew ? 'Yes' : 'No',
    IMPORT_SHIPPABLE ? 'Yes' : 'No',
    '',
  ].map(csvCell);
}

function report(withPrice, withoutPrice, urls) {
  const missingPhoto = withPrice.filter((item) => !item.image).map((item) => item.slug);
  const flagged = CATALOGUE.filter((item) => item.flag);

  const lines = [
    `Wrote ${withPrice.length} rows to ${OUT_FILE}`,
    ...PAGES.map((page) => `  ${page.label}: ${page.items.length}`),
    '',
    Object.keys(urls).length
      ? `Images column filled from image-urls.json (${Object.keys(urls).length} URLs).`
      : 'Images column is EMPTY - run upload-images.mjs first if you want photos on import.',
  ];

  if (withoutPrice.length) {
    lines.push('', "LEFT OUT, no price in Alan's email:");
    lines.push(...withoutPrice.map((item) => `  ${item.slug} - ${item.name}`));
  }
  if (missingPhoto.length) {
    lines.push('', 'IN THE CSV BUT WITH NO PHOTO:');
    lines.push(...missingPhoto.map((slug) => `  ${slug}`));
  }
  lines.push('', `${flagged.length} rows carry a flag for Alan. See README.md.`);
  return lines.join('\n');
}

const taxonomy = readTaxonomy();
const problems = validate(taxonomy);
if (problems.length) {
  process.stderr.write(
    `${problems.length} problems:\n${problems.map((p) => `  ${p}`).join('\n')}\n`,
  );
  process.exit(1);
}

const urls = existsSync(URLS_FILE) ? JSON.parse(readFileSync(URLS_FILE, 'utf8')) : {};
const withPrice = CATALOGUE.filter((item) => item.price);
const withoutPrice = CATALOGUE.filter((item) => !item.price);

const csv = [COLUMNS, ...withPrice.map((item) => row(item, urls))]
  .map((cells) => cells.join(','))
  .join('\r\n');
writeFileSync(OUT_FILE, `${csv}\r\n`, 'utf8');

process.stderr.write(`${report(withPrice, withoutPrice, urls)}\n`);
