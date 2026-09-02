/**
 * Pushes Alan's product photographs into the product-images bucket and records
 * the public URL for each product in image-urls.json, which build-csv.mjs then
 * writes into the Images column.
 *
 * Why a script and not the admin uploader: writes to that bucket are gated on
 * is_admin_aal2(), so a browser session would need a TOTP prompt behind every
 * one of sixty-odd uploads. This runs once, server side, with the service role.
 *
 * The path shape matches src/data/storage-repository.ts exactly -
 * products/<year>/<uuid>.<ext> - so the orphan sweeper and the admin uploader
 * keep seeing one kind of object, not two.
 *
 * Before the first run, paste the service role key into service-role-key.txt in
 * this folder. The project URL is read from the app's .env.local. Neither is
 * ever printed. See read-credentials.mjs.
 *
 * Usage:  node scripts/catalogue-import/upload-images.mjs
 *
 * It is safe to re-run. Products already in image-urls.json are skipped, so a
 * run that dies half way carries on where it stopped rather than orphaning the
 * objects it already wrote.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

import { CATALOGUE } from './catalogue.mjs';
import { readCredentials } from './read-credentials.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = join(HERE, 'images');
const URLS_FILE = join(HERE, 'image-urls.json');

const BUCKET = 'product-images';
const CACHE_CONTROL = '31536000';
const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const { url, key } = readCredentials();

/** Keeps the extension the bucket's MIME allowlist accepts, lower-cased. */
function extensionOf(filename) {
  const raw = extname(filename).toLowerCase();
  return raw === '.jpeg' ? '.jpg' : raw;
}

function storagePath(filename) {
  const year = new Date().getUTCFullYear();
  return `products/${year}/${crypto.randomUUID()}${extensionOf(filename)}`;
}

async function upload(item) {
  const source = join(IMAGES_DIR, item.folder, item.image);
  const body = readFileSync(source);
  const contentType = CONTENT_TYPES[extname(item.image).toLowerCase()];
  if (!contentType) throw new Error(`no MIME type for ${item.image}`);

  const path = storagePath(item.image);
  const response = await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${key}`,
      apikey: key,
      'content-type': contentType,
      'cache-control': `max-age=${CACHE_CONTROL}`,
      'x-upsert': 'false',
    },
    body,
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} - ${await response.text()}`);
  }
  return `${url}/storage/v1/object/public/${BUCKET}/${path}`;
}

const urls = existsSync(URLS_FILE) ? JSON.parse(readFileSync(URLS_FILE, 'utf8')) : {};
const todo = CATALOGUE.filter((item) => item.image && !urls[item.slug]);

process.stderr.write(
  `${todo.length} photos to upload, ${Object.keys(urls).length} already done.\n`,
);

let failures = 0;
for (const item of todo) {
  try {
    urls[item.slug] = await upload(item);
    writeFileSync(URLS_FILE, `${JSON.stringify(urls, null, 2)}\n`, 'utf8');
    process.stderr.write(`  ok   ${item.slug}\n`);
  } catch (error) {
    failures += 1;
    process.stderr.write(`  FAIL ${item.slug}: ${error.message}\n`);
  }
}

process.stderr.write(
  `\n${Object.keys(urls).length} URLs in image-urls.json, ${failures} failures.\n` +
    'Now run build-csv.mjs to write them into the Images column.\n',
);
process.exit(failures ? 1 : 0);
