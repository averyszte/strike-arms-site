/**
 * The image steps shared by process-photo-sets.mjs and reframe-live-photos.mjs.
 *
 * Every photo ends up as a square, white, consistently framed image:
 *
 *   1. Paint out any listed watermark regions.
 *   2. Optionally clean up a white sheet shot under uneven light
 *      (background-cleanup.mjs).
 *   3. Shave a thin strip off every edge, which removes the hairline borders a
 *      few supplier photos carry.
 *   4. Look at the outer ring. Mostly white means a studio shot: trim the white
 *      away and centre the item on a white square with the same margin every
 *      time. Anything else is a close-up: crop the centre to a square.
 *   5. At most 1600px a side (never upscaled), WebP.
 */

import sharp from 'sharp';

import { evenBackground, whitenBackground } from './background-cleanup.mjs';

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

/** Only even out photos whose border is less white than this. */
const EVEN_BELOW_RING_SHARE = 0.95;

/** Decodes to flat RGB, applying EXIF rotation and dropping transparency. */
export async function loadFlat(input) {
  const { data, info } = await sharp(input)
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

/** Paints the given fractional rectangles white, in place. */
export function eraseRegions(image, regions) {
  for (const region of regions) {
    const x0 = Math.floor(region.left * image.width);
    const y0 = Math.floor(region.top * image.height);
    const x1 = Math.min(image.width, Math.ceil((region.left + region.width) * image.width));
    const y1 = Math.min(image.height, Math.ceil((region.top + region.height) * image.height));
    for (let y = y0; y < y1; y += 1) {
      image.data.fill(255, (y * image.width + x0) * 3, (y * image.width + x1) * 3);
    }
  }
  return image;
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

/**
 * Runs the full pipeline on a file path or buffer and writes WebP to outPath.
 * Options:
 *   eraseRegions      fractional rectangles to paint white first
 *   isEvenBackground  clean up the sheet, but only when the border is not
 *                     already white (a photo the item fills is left alone)
 *   isSheetKept       even the light but skip the border flood-fill, for
 *                     clear packaging or visors it would wash out
 *   isNeverCropped    always fit the whole photo on the square, never crop
 */
export async function processPhoto(input, outPath, options = {}) {
  let image = eraseRegions(await loadFlat(input), options.eraseRegions ?? []);
  const isEvened = Boolean(options.isEvenBackground) && whiteRingShare(image) < EVEN_BELOW_RING_SHARE;
  if (isEvened) image = await evenBackground(image);
  if (isEvened && !options.isSheetKept) image = await whitenBackground(image);
  const shaved = await shave(image);
  const isStudio = options.isNeverCropped || whiteRingShare(shaved) >= STUDIO_RING_SHARE;
  const pipeline = isStudio ? await frameStudioShot(shaved) : cropCloseUp(shaved);
  const info = await pipeline.webp(WEBP).toFile(outPath);
  return {
    mode: `${isStudio ? 'studio' : 'close-up'}${isEvened ? '+evened' : ''}`,
    side: info.width,
    kb: Math.round(info.size / 1024),
  };
}
