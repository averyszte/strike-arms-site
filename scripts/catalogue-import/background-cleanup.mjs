/**
 * Cleans up photos shot on a white sheet under uneven light, so the sheet
 * disappears into the site's white box. Two steps, used by photo-framing.mjs:
 *
 *   evenBackground   lifts the sheet towards white where the light falls off,
 *                    and removes a warm or cool cast.
 *   whitenBackground fades everything reachable from the border through
 *                    bright, colourless pixels (the sheet and the item's
 *                    shadow) to pure white, with a soft edge.
 *
 * Images are { data, width, height } with 3-channel raw RGB data.
 */

import sharp from 'sharp';

/** Background estimate is worked out at this fraction of full size. */
const BG_SCALE = 1 / 8;
/** Max-filter radius at that scale: wider than the thickest part of the item. */
const BG_RADIUS = 7;
/** An estimate darker than this is the item, not the sheet: no lift. */
const BG_TRUST_FROM = 150;
/** An estimate at or above this is fully trusted as the sheet. */
const BG_TRUST_FULL = 210;
/** After evening, anything at or above this becomes pure white. */
const BG_WHITE_POINT = 236;

/** Flood-fill passes through pixels at least this bright... */
const SHEET_MIN_LEVEL = 180;
/** ...and with at most this much colour (max channel minus min channel). */
const SHEET_MAX_CHROMA = 28;
/** Blur on the filled mask, in pixels, for a soft edge against the item. */
const SHEET_FEATHER = 1.5;

function rawImage({ data, width, height }) {
  return sharp(data, { raw: { width, height, channels: 3 } });
}

/** Per-channel maximum over a square window, separable (rows then columns). */
function maxFilter(data, width, height, radius) {
  const pass = (src, isRows) => {
    const out = Buffer.alloc(src.length);
    const [outer, inner] = isRows ? [height, width] : [width, height];
    for (let o = 0; o < outer; o += 1) {
      for (let i = 0; i < inner; i += 1) {
        for (let c = 0; c < 3; c += 1) {
          let best = 0;
          for (let k = Math.max(0, i - radius); k <= Math.min(inner - 1, i + radius); k += 1) {
            const index = isRows ? (o * width + k) * 3 + c : (k * width + o) * 3 + c;
            if (src[index] > best) best = src[index];
          }
          out[isRows ? (o * width + i) * 3 + c : (i * width + o) * 3 + c] = best;
        }
      }
    }
    return out;
  };
  return pass(pass(data, true), false);
}

async function estimateBackground(image) {
  const small = {
    width: Math.max(8, Math.round(image.width * BG_SCALE)),
    height: Math.max(8, Math.round(image.height * BG_SCALE)),
  };
  const { data } = await rawImage(image)
    .resize(small.width, small.height, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const filtered = maxFilter(data, small.width, small.height, BG_RADIUS);
  const { data: background } = await sharp(filtered, { raw: { ...small, channels: 3 } })
    .blur(BG_RADIUS / 2)
    .resize(image.width, image.height, { fit: 'fill', kernel: 'cubic' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return background;
}

/**
 * The background is estimated as the local brightest colour (a max filter
 * wide enough to step over the item), smoothed. Each channel is lifted by the
 * gap to white, weighted by how close the pixel is to that estimate, so the
 * sheet reaches white and dark parts barely move. Where the estimate is dark
 * it has landed on the item itself, so the lift fades out there rather than
 * blowing out the middle of a large black pouch.
 */
export async function evenBackground(image) {
  const background = await estimateBackground(image);
  const out = Buffer.alloc(image.data.length);
  for (let i = 0; i < out.length; i += 1) {
    const value = image.data[i];
    const bg = Math.max(1, background[i]);
    const trust = Math.min(1, Math.max(0, (bg - BG_TRUST_FROM) / (BG_TRUST_FULL - BG_TRUST_FROM)));
    const closeness = Math.min(1, value / bg);
    const lifted = value + (255 - bg) * closeness * closeness * trust;
    out[i] = Math.min(255, Math.round((lifted * 255) / BG_WHITE_POINT));
  }
  return { data: out, width: image.width, height: image.height };
}

function isSheet(data, pixel) {
  const i = pixel * 3;
  const low = Math.min(data[i], data[i + 1], data[i + 2]);
  const high = Math.max(data[i], data[i + 1], data[i + 2]);
  return low >= SHEET_MIN_LEVEL && high - low <= SHEET_MAX_CHROMA;
}

/** 1 for every sheet pixel connected to the border, 0 elsewhere. */
function floodFromBorder({ data, width, height }) {
  const mask = new Uint8Array(width * height);
  const stack = [];
  const visit = (pixel) => {
    if (mask[pixel] || !isSheet(data, pixel)) return;
    mask[pixel] = 1;
    stack.push(pixel);
  };
  for (let x = 0; x < width; x += 1) {
    visit(x);
    visit((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    visit(y * width);
    visit(y * width + width - 1);
  }
  while (stack.length) {
    const pixel = stack.pop();
    const x = pixel % width;
    if (x > 0) visit(pixel - 1);
    if (x < width - 1) visit(pixel + 1);
    if (pixel >= width) visit(pixel - width);
    if (pixel < (height - 1) * width) visit(pixel + width);
  }
  return mask;
}

/**
 * Fades the sheet and the item's shadow to pure white. Only pixels reachable
 * from the border count, so light parts enclosed by the item (white camo
 * patches, a label) are kept.
 */
export async function whitenBackground(image) {
  const { width, height } = image;
  const mask = floodFromBorder(image);
  for (let p = 0; p < mask.length; p += 1) mask[p] *= 255;
  const { data: soft } = await sharp(Buffer.from(mask), { raw: { width, height, channels: 1 } })
    .blur(SHEET_FEATHER)
    .extractChannel(0)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = Buffer.from(image.data);
  for (let p = 0; p < soft.length; p += 1) {
    const weight = soft[p] / 255;
    for (let c = 0; c < 3; c += 1) {
      const i = p * 3 + c;
      out[i] = Math.round(out[i] + (255 - out[i]) * weight);
    }
  }
  return { data: out, width, height };
}
