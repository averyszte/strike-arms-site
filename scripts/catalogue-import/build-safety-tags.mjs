/**
 * Writes safety-tags.csv: the masks and goggles already in the database, with
 * their tags plus 'safety', so they show on /safety-equipment (Alan renamed
 * his Masks & Goggles page on 19 Sep 2026).
 *
 * The file has only Slug and Tags. The importer never touches a column the
 * file does not carry, so this changes tags and nothing else -- published
 * state, stock and prices stay as Alan left them.
 *
 * Usage:  node scripts/catalogue-import/build-safety-tags.mjs
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { MASKS } from './catalogue-gear.mjs';

const OUT_FILE = join(dirname(fileURLToPath(import.meta.url)), 'safety-tags.csv');

const lines = ['Slug,Tags', ...MASKS.map((item) => `${item.slug},${item.tags.join(';')}`)];
writeFileSync(OUT_FILE, `${lines.join('\r\n')}\r\n`, 'utf8');
process.stderr.write(`Wrote ${MASKS.length} rows to ${OUT_FILE}\n`);
