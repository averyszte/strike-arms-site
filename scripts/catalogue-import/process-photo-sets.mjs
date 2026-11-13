/**
 * Turns Phil's photo sets into the files the shop actually serves: one square,
 * white, consistently framed WebP per photo.
 *
 * The site shows every product image in a white square with object-contain,
 * so a photo with a lot of empty space, an off-centre item or a border looks
 * small and lopsided next to its neighbours. Every photo goes through the same
 * steps so they all sit the same way:
 *
 *   1. Shave a thin strip off every edge. That removes the hairline borders a
 *      few supplier photos carry; on a white studio shot it loses nothing.
 *   2. Look at the outer ring. Mostly white means a studio shot; anything else
 *      is a close-up or lifestyle photo.
 *   3. Studio shot: trim the white away, then centre the item on a white
 *      square with the same margin every time.
 *      Close-up: crop the centre to a square, so it fills the frame instead of
 *      sitting in a strip with white bars above and below.
 *   4. At most 1600px a side (never upscaled), WebP. Encoded here rather than
 *      in a browser canvas, so Safari's canvas WebP bugs do not apply.
 *
 * Output: images/processed/<slug>/<nn>.webp and images/processed/manifest.json,
 * which upload-photo-sets.mjs reads. Nothing here touches the network.
 *
 * Usage:  node scripts/catalogue-import/process-photo-sets.mjs [source-folder]
 *         (default source: scripts/catalogue-import/images/sets)
 */

import { mkdirSync, rmSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';
import sharp from 'sharp';

import { collectPhotoSets } from './photo-sets.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = process.argv[2] ?? join(HERE, 'images', 'sets');
const OUT_DIR = join(HERE, 'images', 'processed');

const MAX_SIDE = 1600;
/** Fraction of each edge shaved off before anything else. */
const SHAVE = 0.02;
/** Fraction of the square left empty on each side of a studio shot. */
const MARGIN = 0.05;
/** A channel at or above this counts as white. */
const WHITE_LEVEL = 235;
/** Share of the outer ring that must be white for a studio shot. */
const STUDIO_RING_SHARE = 0.85;
const TRIM_THRESHOLD = 25;
const WEBP = { quality: 82, effort: 6 };
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

/** Decodes to flat RGB, applying EXIF rotation and dropping transparency. */
async function loadFlat(path) {
  const { data, info } = await sharp(path)
    .rotate()
    .flatten({ background: WHITE })
    .removeAlpha()
    .toColourspace('srgb')
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function rawImage({ data, width, height }) {
  return sharp(data, { raw: { width, height, channels: 3 } });
}

async function shave(image) {
  const dx = Math.round(image.width * SHAVE);
  const dy = Math.round(image.height * SHAVE);
  const width = image.width - 2 * dx;
  const height = image.height - 2 * dy;
  const { data } = await rawImage(image)
    .extract({ left: dx, top: dy, width, height })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width, height };
}

/** Share of near-white pixels in a ring 2% of the short side deep. */
function whiteRingShare({ data, width, height }) {
  const depth = Math.max(1, Math.round(Math.min(width, height) * 0.02));
  let white = 0;
  let total = 0;
  for (let y = 0; y < height; y += 1) {
    const isEdgeRow = y < depth || y >= height - depth;
    for (let x = 0; x < width; x += 1) {
      if (!isEdgeRow && x >= depth && x < width - depth) continue;
      const i = (y * width + x) * 3;
      total += 1;
      if (data[i] >= WHITE_LEVEL && data[i + 1] >= WHITE_LEVEL && data[i + 2] >= WHITE_LEVEL) white += 1;
    }
  }
  return total ? white / total : 0;
}

async function frameStudioShot(image) {
  const { data, info } = await rawImage(image)
    .trim({ background: '#ffffff', threshold: TRIM_THRESHOLD })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const trimmed = { data, width: info.width, height: info.height };

  const natural = Math.round(Math.max(trimmed.width, trimmed.height) / (1 - 2 * MARGIN));
  const side = Math.min(natural, MAX_SIDE);
  const pad = Math.round(side * MARGIN);
  const inner = side - 2 * pad;
  return rawImage(trimmed)
    .resize({ width: inner, height: inner, fit: 'contain', background: WHITE })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: WHITE });
}

function cropCloseUp(image) {
  const side = Math.min(image.width, image.height, MAX_SIDE);
  return rawImage(image).resize({ width: side, height: side, fit: 'cover', position: 'centre' });
}

async function processPhoto(path, outPath) {
  const shaved = await shave(await loadFlat(path));
  const isStudio = whiteRingShare(shaved) >= STUDIO_RING_SHARE;
  const pipeline = isStudio ? await frameStudioShot(shaved) : cropCloseUp(shaved);
  const info = await pipeline.webp(WEBP).toFile(outPath);
  return { mode: isStudio ? 'studio' : 'close-up', side: info.width, kb: Math.round(info.size / 1024) };
}

const sets = collectPhotoSets(SOURCE_DIR);
rmSync(OUT_DIR, { recursive: true, force: true });

const manifest = {};
let count = 0;
for (const [slug, photos] of [...sets].sort(([a], [b]) => a.localeCompare(b))) {
  mkdirSync(join(OUT_DIR, slug), { recursive: true });
  manifest[slug] = [];
  for (const [index, photo] of photos.entries()) {
    const file = `${slug}/${String(index + 1).padStart(2, '0')}.webp`;
    const result = await processPhoto(photo.path, join(OUT_DIR, file));
    const sourceKb = Math.round(statSync(photo.path).size / 1024);
    manifest[slug].push({ file, source: relative(SOURCE_DIR, photo.path), ...result });
    process.stderr.write(
      `  ${file.padEnd(46)} ${result.mode.padEnd(8)} ${String(result.side).padStart(4)}px ` +
        `${String(sourceKb).padStart(4)} -> ${String(result.kb).padStart(4)} KB\n`,
    );
    count += 1;
  }
}

writeFileSync(join(OUT_DIR, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
process.stderr.write(`\n${count} photos for ${sets.size} products written to ${OUT_DIR}\n`);
