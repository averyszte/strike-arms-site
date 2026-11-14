/**
 * Which product each of Phil's photo-set files belongs to, and in what order.
 *
 * The photos arrive named after the product, not the slug, with a trailing
 * number for the order: "Specna Arms Half Tan 3.webp", "AKSU 74 (2).webp".
 * Spacing and case are inconsistent, so names are normalised before matching,
 * and the longest matching prefix wins ("ASG CZ PO9 Two Tone" beats
 * "ASG CZ PO9"). Whatever is left after the prefix must be empty or a number;
 * anything else is an error rather than a guess.
 *
 * Photo 1 (or the only photo) becomes the product's main image.
 */

import { readdirSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

/** Normalised file-name prefix -> catalogue slug. */
export const PHOTO_SET_SLUGS = {
  // pistols
  'asg 1911 tac master': 'asg-1911-tac-master',
  'asg 715 chrome': 'asg-715-chrome',
  'asg cz p10': 'asg-cz-p10',
  'asg cz po9': 'asg-cz-p-09',
  'asg cz po9 two tone': 'asg-cz-p-09-two-tone',
  'asg dan wesson 2': 'asg-dan-wesson-2-inch',
  'asg dan wesson6': 'asg-dan-wesson-6-inch',
  'asg hw m9': 'asg-hw-m9',
  'asg m9': 'asg-m9',
  'asg mk23': 'asg-mk23',
  'action army aaop-a1': 'action-army-aap-01',
  'action army aaop-a1 tan': 'action-army-aap-01-tan',
  'umarex g17 gen 4': 'umarex-g17-gen-4',
  // consumables
  "asg alpha blaster .30g bb's": 'asg-alpha-blaster-30g-bbs',
  "asg blaster gamma .20g bb's": 'asg-blaster-gamma-20g-bbs',
  "asg blaster gamma .25g bb's": 'asg-blaster-gamma-25g-bbs',
  "asg blaster gamma .28g bb's": 'asg-blaster-gamma-28g-bbs',
  "asg blaster tracer .20g bb's": 'asg-blaster-tracer-20g-bbs',
  "blaster devils .20g bb's": 'blaster-devils-20g-bbs',
  "blaster devils .25g bb's": 'blaster-devils-25g-bbs',
  'abbey silicone grease': 'abbey-silicone-grease',
  '5 x co2 bulbs': 'co2-bulbs-5-pack',
  'co2 bulbs 25': 'co2-bulbs-25-pack',
  'ultrair green gas': 'asg-ultrair-green-gas-1000ml',
  'ultrair silicone oil': 'asg-ultrair-silicone-oil',
  // new rifles
  'asg ssg 69 bolt action rifle': 'asg-ssg-69',
  'specna arms half tan': 'specna-arms-half-tan',
  'specna arms sa f02 with hal etu': 'specna-arms-sa-f02-hal-etu',
  // Evolution range (batch 3). The supplier's MK18 photos come in black and a
  // tan "BB" variant; MH-3000 has no colour suffix, so the black set is used.
  'evolution ak e-104 tanker': 'evolution-ak-e-104-tanker',
  'evolution m40 od': 'evolution-m40-sniper-rifle-od',
  'evolution mk18 black': 'evolution-recon-mk18-mod-1-metal-hybrid',
  'evolution recon 10 black tan': 'evolution-recon-10-carbontech-black-tan',
  'evolution recon 14.5 black tan': 'evolution-recon-14-5-carbontech-black-tan',
  // pre-loved
  'aksu 74': 'pre-loved-cyma-aksu-74',
  'steyr aug a1': 'pre-loved-asg-steyr-aug-a1',
  'steyr aug a2': 'pre-loved-asg-steyr-aug-a2',
  'tokyo-marui-aa-12': 'pre-loved-tm-aa12-shotgun',
};

/**
 * Areas painted white before processing, as fractions of the source photo.
 * Keyed by normalised file name. For other shops' watermarks on supplier
 * photos, which must not appear on ours.
 */
export const ERASE_REGIONS = {
  // airsofteire.com logo, bottom left
  'asg 715 chrome 1': [{ left: 0, top: 0.92, width: 0.23, height: 0.08 }],
};

/** Regions to white out for this file, or an empty list. */
export function eraseRegionsFor(filename) {
  return ERASE_REGIONS[normalise(filename)] ?? [];
}

const IMAGE_EXTENSIONS = new Set(['.webp', '.jpg', '.jpeg', '.png']);
const PREFIXES = Object.keys(PHOTO_SET_SLUGS).sort((a, b) => b.length - a.length);

function normalise(filename) {
  return basename(filename, extname(filename))
    .toLowerCase()
    .replace(/[()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Returns { slug, order } or throws with the file name in the message. */
export function matchPhoto(filename) {
  const name = normalise(filename);
  const prefix = PREFIXES.find((p) => name === p || name.startsWith(`${p} `));
  if (!prefix) throw new Error(`no product matches "${filename}"`);
  const rest = name.slice(prefix.length).trim();
  if (rest && !/^\d+$/.test(rest)) {
    throw new Error(`"${filename}" matched "${prefix}" but "${rest}" is not a photo number`);
  }
  return { slug: PHOTO_SET_SLUGS[prefix], order: rest ? Number(rest) : 1 };
}

function listImages(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return listImages(path);
    return IMAGE_EXTENSIONS.has(extname(entry).toLowerCase()) ? [path] : [];
  });
}

/**
 * Walks the source folder and groups files by product, ordered by photo
 * number. Two files claiming the same number for one product is an error.
 */
export function collectPhotoSets(sourceDir) {
  const sets = new Map();
  for (const path of listImages(sourceDir)) {
    const { slug, order } = matchPhoto(path);
    const set = sets.get(slug) ?? [];
    const clash = set.find((photo) => photo.order === order);
    if (clash) throw new Error(`${slug} has two photo ${order}s: ${clash.path} and ${path}`);
    set.push({ path, order });
    sets.set(slug, set);
  }
  for (const set of sets.values()) set.sort((a, b) => a.order - b.order);
  return sets;
}
