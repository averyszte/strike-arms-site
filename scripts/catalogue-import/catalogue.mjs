/**
 * The whole of Alan's stock in one list, assembled from the per-page modules.
 *
 * Import defaults live here because they are decisions, not data: every product
 * arrives unpublished and collect-in-store, and is promoted deliberately.
 */

import { PISTOLS, NEW_RIFLES } from './catalogue-guns.mjs';
import { PRE_LOVED } from './catalogue-pre-loved.mjs';
import { CONSUMABLES, BATTERIES } from './catalogue-consumables.mjs';
import { MASKS, JUMBLE } from './catalogue-gear.mjs';
import { MAGAZINES } from './catalogue-magazines.mjs';
import { SAFETY_GLOVES, WALLHANGERS } from './catalogue-props-safety.mjs';
import { JUMBLE_BATCH_2 } from './catalogue-jumble-batch-2.mjs';

/** Nothing goes live until Alan has seen it in the admin. */
export const IMPORT_PUBLISHED = false;

/**
 * Alan has not said which items he actually posts, so every row imports as
 * collect-in-store, which is the schema default. Guessing here would be a
 * shipping promise the shop has not made. README.md carries the tick list.
 */
export const IMPORT_SHIPPABLE = false;

/**
 * `batch` is the email round a page arrived in. Batch 1 is already in the
 * database; `build-csv.mjs --batch=2` writes only the newer pages, so an import
 * never re-sends rows Alan has since published or edited.
 */
export const PAGES = [
  { label: 'Pistols', batch: 1, items: PISTOLS },
  { label: 'New rifles', batch: 1, items: NEW_RIFLES },
  { label: 'Pre-loved', batch: 1, items: PRE_LOVED },
  { label: 'Consumables', batch: 1, items: CONSUMABLES },
  { label: 'Batteries and chargers', batch: 1, items: BATTERIES },
  { label: 'Masks and goggles', batch: 1, items: MASKS },
  { label: 'Jumble', batch: 1, items: JUMBLE },
  { label: 'Magazines', batch: 2, items: MAGAZINES },
  { label: 'Safety equipment gloves', batch: 2, items: SAFETY_GLOVES },
  { label: 'Wallhangers and props', batch: 2, items: WALLHANGERS },
  { label: 'Jumble, second batch', batch: 2, items: JUMBLE_BATCH_2 },
];

export const CATALOGUE = PAGES.flatMap((page) => page.items);
