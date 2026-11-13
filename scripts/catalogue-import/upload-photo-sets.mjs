/**
 * Replaces each product's images with its processed photo set.
 *
 * Reads images/processed/manifest.json (written by process-photo-sets.mjs),
 * uploads every file to the product-images bucket and then sets the product's
 * `images` array to the new URLs in photo order. Photo 1 is the main image.
 *
 * The old images are not deleted here. Dropping them from `images` fires the
 * migration 011 trigger, which queues them in orphaned_images, and the
 * sweep-orphan-images function removes them from the bucket. One cleanup path,
 * the same one the admin uses.
 *
 * Without --write it only checks: every slug must exist in the live catalogue,
 * and it prints what would change. Nothing is uploaded or updated.
 *
 * Paths match src/data/storage-repository.ts (products/<year>/<uuid>.webp).
 * Uploaded URLs are recorded in photo-set-urls.json, so a run that dies half way
 * re-uses what it already uploaded instead of orphaning it.
 *
 * Credentials come from read-credentials.mjs: paste the service role key into
 * service-role-key.txt in this folder first. Neither value is ever printed.
 *
 * Usage:  node scripts/catalogue-import/upload-photo-sets.mjs           (check)
 *         node scripts/catalogue-import/upload-photo-sets.mjs --write   (do it)
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { readCredentials } from './read-credentials.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROCESSED_DIR = join(HERE, 'images', 'processed');
const MANIFEST_FILE = join(PROCESSED_DIR, 'manifest.json');
const URLS_FILE = join(HERE, 'photo-set-urls.json');

const BUCKET = 'product-images';
const CACHE_CONTROL = '31536000';
const IS_WRITE = process.argv.includes('--write');

if (!existsSync(MANIFEST_FILE)) {
  process.stderr.write('No manifest. Run process-photo-sets.mjs first.\n');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(MANIFEST_FILE, 'utf8'));
const { url, key } = readCredentials();
const AUTH = { authorization: `Bearer ${key}`, apikey: key };

async function request(path, init = {}) {
  const response = await fetch(`${url}${path}`, {
    ...init,
    headers: { ...AUTH, ...init.headers },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} - ${await response.text()}`);
  }
  return response;
}

async function fetchProducts(slugs) {
  const list = slugs.map((slug) => `"${slug}"`).join(',');
  const response = await request(
    `/rest/v1/products?select=slug,name,images&slug=in.(${encodeURIComponent(list)})`,
  );
  return new Map((await response.json()).map((product) => [product.slug, product]));
}

async function uploadFile(file) {
  const year = new Date().getUTCFullYear();
  const path = `products/${year}/${crypto.randomUUID()}.webp`;
  await request(`/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'image/webp',
      'cache-control': `max-age=${CACHE_CONTROL}`,
      'x-upsert': 'false',
    },
    body: readFileSync(join(PROCESSED_DIR, file)),
  });
  return `${url}/storage/v1/object/public/${BUCKET}/${path}`;
}

/** Uploads what is not already recorded for this exact file, then saves. */
async function uploadSet(slug, photos, uploaded) {
  const urls = [];
  for (const photo of photos) {
    const recordKey = `${slug}/${photo.file}`;
    uploaded[recordKey] ??= await uploadFile(photo.file);
    writeFileSync(URLS_FILE, `${JSON.stringify(uploaded, null, 2)}\n`, 'utf8');
    urls.push(uploaded[recordKey]);
  }
  return urls;
}

async function setImages(slug, images) {
  const response = await request(`/rest/v1/products?slug=eq.${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', prefer: 'return=representation' },
    body: JSON.stringify({ images }),
  });
  const rows = await response.json();
  if (rows.length !== 1) throw new Error(`expected 1 row updated, got ${rows.length}`);
}

const slugs = Object.keys(manifest).sort();
const products = await fetchProducts(slugs);
const missing = slugs.filter((slug) => !products.has(slug));

process.stderr.write(`${slugs.length} products in the manifest:\n\n`);
for (const slug of slugs) {
  const product = products.get(slug);
  const before = product ? `${product.images.length} now` : 'NOT IN CATALOGUE';
  process.stderr.write(`  ${slug.padEnd(40)} ${before.padEnd(16)} -> ${manifest[slug].length}\n`);
}

if (missing.length) {
  process.stderr.write(`\n${missing.length} slugs are not in the live catalogue. Nothing done.\n`);
  process.exit(1);
}
if (!IS_WRITE) {
  process.stderr.write('\nCheck only. Run again with --write to upload and replace.\n');
  process.exit(0);
}

const uploaded = existsSync(URLS_FILE) ? JSON.parse(readFileSync(URLS_FILE, 'utf8')) : {};
let failures = 0;
process.stderr.write('\n');
for (const slug of slugs) {
  try {
    await setImages(slug, await uploadSet(slug, manifest[slug], uploaded));
    process.stderr.write(`  ok   ${slug}\n`);
  } catch (error) {
    failures += 1;
    process.stderr.write(`  FAIL ${slug}: ${error.message}\n`);
  }
}

process.stderr.write(
  `\n${slugs.length - failures} products updated, ${failures} failures.` +
    (failures ? ' Re-run with --write; uploaded files are re-used.\n' : '\n'),
);
process.exit(failures ? 1 : 0);
