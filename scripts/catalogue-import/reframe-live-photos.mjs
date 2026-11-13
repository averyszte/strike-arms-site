/**
 * Re-frames photos that are already on the shop, for products whose pictures
 * were shot on a white sheet under uneven light: a grey, patchy background
 * sitting inside the site's white box, with the item small in a landscape
 * strip.
 *
 * Downloads each named product's current images, evens out the background,
 * trims and centres each one on a white square (photo-framing.mjs), and writes
 * images/reframed/<slug>/<nn>.webp plus a manifest in the same shape as
 * process-photo-sets.mjs. Look at them, then upload with
 *   node scripts/catalogue-import/upload-photo-sets.mjs --dir=reframed --write
 *
 * With --find and no slugs, it lists the products whose main image needs it:
 * a border that is not pure white, or a photo that is not square.
 *
 * Read-only against the database: it uses the public anon key.
 *
 * Usage:  node scripts/catalogue-import/reframe-live-photos.mjs --find
 *         node scripts/catalogue-import/reframe-live-photos.mjs <slug> [<slug> ...]
 */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

import { processPhoto } from './photo-framing.mjs';
import { readPublicCredentials } from './read-credentials.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, 'images', 'reframed');
/** Main images whose outer ring is at least this share pure white pass. */
const PASS_RING_SHARE = 0.95;
const PURE_WHITE = 245;
/** Clear packaging or a visor touches the sheet: the flood-fill would erase it. */
const SHEET_KEPT = new Set(['fast-helmet-camera-mount', 'eastern-bloc-police-riot-helmet']);

const args = process.argv.slice(2);
const IS_FIND = args.includes('--find');
const slugs = args.filter((arg) => !arg.startsWith('--'));
const { url, key } = readPublicCredentials();

async function fetchProducts(only) {
  const filter = only.length
    ? `&slug=in.(${encodeURIComponent(only.map((slug) => `"${slug}"`).join(','))})`
    : '';
  const response = await fetch(`${url}/rest/v1/products?select=slug,images${filter}&order=slug`, {
    headers: { apikey: key, authorization: `Bearer ${key}` },
  });
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
  return response.json();
}

async function download(src) {
  const response = await fetch(src);
  if (!response.ok) throw new Error(`${response.status} for ${src}`);
  return Buffer.from(await response.arrayBuffer());
}

/** Share of pure-white pixels in the outer ring, on a 200px thumbnail. */
async function ringShare(buffer) {
  const SIZE = 200;
  const DEPTH = 6;
  const { data } = await sharp(buffer)
    .rotate()
    .flatten({ background: '#ffffff' })
    .removeAlpha()
    .resize(SIZE, SIZE, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let white = 0;
  let total = 0;
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const isInside = y >= DEPTH && y < SIZE - DEPTH && x >= DEPTH && x < SIZE - DEPTH;
      if (isInside) continue;
      const i = (y * SIZE + x) * 3;
      total += 1;
      if (data[i] >= PURE_WHITE && data[i + 1] >= PURE_WHITE && data[i + 2] >= PURE_WHITE) white += 1;
    }
  }
  return white / total;
}

async function find() {
  const products = await fetchProducts([]);
  const found = [];
  for (const product of products) {
    const [main] = product.images ?? [];
    if (!main) continue;
    const buffer = await download(main);
    const { width, height } = await sharp(buffer).metadata();
    const share = await ringShare(buffer);
    if (share < PASS_RING_SHARE || width !== height) {
      found.push(product.slug);
      process.stderr.write(`  ${product.slug.padEnd(48)} ring ${share.toFixed(2)}  ${width}x${height}\n`);
    }
  }
  process.stderr.write(`\n${found.length} of ${products.length} products need re-framing.\n`);
  process.stdout.write(`${found.join(' ')}\n`);
}

async function reframe() {
  const products = await fetchProducts(slugs);
  const missing = slugs.filter((slug) => !products.some((product) => product.slug === slug));
  if (missing.length) throw new Error(`not in the catalogue: ${missing.join(', ')}`);

  rmSync(OUT_DIR, { recursive: true, force: true });
  const manifest = {};
  for (const product of products) {
    mkdirSync(join(OUT_DIR, product.slug), { recursive: true });
    manifest[product.slug] = [];
    for (const [index, src] of product.images.entries()) {
      const file = `${product.slug}/${String(index + 1).padStart(2, '0')}.webp`;
      const result = await processPhoto(await download(src), join(OUT_DIR, file), {
        isEvenBackground: true,
        isSheetKept: SHEET_KEPT.has(product.slug),
        isNeverCropped: true,
      });
      manifest[product.slug].push({ file, source: src, ...result });
      process.stderr.write(`  ${file.padEnd(56)} ${result.mode.padEnd(8)} ${result.side}px ${result.kb} KB\n`);
    }
  }
  writeFileSync(join(OUT_DIR, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  process.stderr.write(`\n${products.length} products written to ${OUT_DIR}\n`);
}

if (IS_FIND) await find();
else if (slugs.length) await reframe();
else process.stderr.write('Pass --find, or the slugs to re-frame.\n');
