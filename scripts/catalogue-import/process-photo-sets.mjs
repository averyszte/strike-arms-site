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
 * The steps live in photo-framing.mjs.
 *
 * Usage:  node scripts/catalogue-import/process-photo-sets.mjs [source-folder]
 *         (default source: scripts/catalogue-import/images/sets)
 */

import { mkdirSync, rmSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

import { collectPhotoSets, eraseRegionsFor } from './photo-sets.mjs';
import { processPhoto } from './photo-framing.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = process.argv[2] ?? join(HERE, 'images', 'sets');
const OUT_DIR = join(HERE, 'images', 'processed');

const sets = collectPhotoSets(SOURCE_DIR);
rmSync(OUT_DIR, { recursive: true, force: true });

const manifest = {};
let count = 0;
for (const [slug, photos] of [...sets].sort(([a], [b]) => a.localeCompare(b))) {
  mkdirSync(join(OUT_DIR, slug), { recursive: true });
  manifest[slug] = [];
  for (const [index, photo] of photos.entries()) {
    const file = `${slug}/${String(index + 1).padStart(2, '0')}.webp`;
    const result = await processPhoto(photo.path, join(OUT_DIR, file), {
      eraseRegions: eraseRegionsFor(photo.path),
    });
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
