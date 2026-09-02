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

/** Nothing goes live until Alan has seen it in the admin. */
export const IMPORT_PUBLISHED = false;

/**
 * Alan has not said which items he actually posts, so every row imports as
 * collect-in-store, which is the schema default. Guessing here would be a
 * shipping promise the shop has not made. README.md carries the tick list.
 */
export const IMPORT_SHIPPABLE = false;

export const PAGES = [
  { label: 'Pistols', items: PISTOLS },
  { label: 'New rifles', items: NEW_RIFLES },
  { label: 'Pre-loved', items: PRE_LOVED },
  { label: 'Consumables', items: CONSUMABLES },
  { label: 'Batteries and chargers', items: BATTERIES },
  { label: 'Masks and goggles', items: MASKS },
  { label: 'Jumble', items: JUMBLE },
];

export const CATALOGUE = PAGES.flatMap((page) => page.items);
