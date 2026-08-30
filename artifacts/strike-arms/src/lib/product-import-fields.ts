import { LIST_SEPARATOR } from '@/lib/products-csv';
import type { Category } from '@/types/product';

/**
 * Turning one spreadsheet cell into one product field, or saying why not.
 *
 * Everything here validates the characters that were typed rather than what
 * Number() makes of them. Number('1e3') is 1000 and Number('0x10') is 16, so a
 * pasted "1e3" in a price column would set a product to a thousand euro and
 * look like a perfectly ordinary import while doing it.
 *
 * Nothing here corrects anything. A cell that is wrong stops its row, and the
 * preview names the row and the reason. Silently lower-casing a brand or
 * rounding a price to something plausible is how an import "succeeds" and the
 * shop is wrong afterwards.
 */

export type ParseResult<T> = { ok: true; value: T } | { ok: false; message: string };

const EUROS = /^\d+(\.\d{1,2})?$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const CATEGORIES: Category[] = [
  'rifles',
  'pistols',
  'consumables',
  'accessories',
  'gear',
  'parts',
  'more',
];

const TRUE_WORDS = new Set(['yes', 'y', 'true', '1']);
const FALSE_WORDS = new Set(['no', 'n', 'false', '0']);

export function parseSlugLike(label: string, raw: string): ParseResult<string> {
  const value = raw.trim();
  if (!SLUG.test(value)) {
    return {
      ok: false,
      message: `${label} must be lower case letters, numbers and hyphens, e.g. specna-arms (got "${value}")`,
    };
  }
  return { ok: true, value };
}

export function parseCategory(raw: string): ParseResult<Category> {
  const value = raw.trim().toLowerCase();
  const match = CATEGORIES.find((category) => category === value);
  if (!match) {
    return { ok: false, message: `Category must be one of ${CATEGORIES.join(', ')} (got "${raw.trim()}")` };
  }
  return { ok: true, value: match };
}

/** Euro amount to cents. Math.round, because 6.50 is 649.9999... in binary. */
export function parseEuros(label: string, raw: string): ParseResult<number> {
  const value = raw.trim();
  if (!EUROS.test(value)) {
    return { ok: false, message: `${label} must be an amount in euro, e.g. 129.00 (got "${value}")` };
  }
  return { ok: true, value: Math.round(Number(value) * 100) };
}

/** Same, but an empty cell means "no sale price" rather than an error. */
export function parseOptionalEuros(label: string, raw: string): ParseResult<number | null> {
  if (raw.trim() === '') return { ok: true, value: null };
  const parsed = parseEuros(label, raw);
  return parsed.ok ? { ok: true, value: parsed.value } : parsed;
}

export function parseBoolean(label: string, raw: string): ParseResult<boolean> {
  const value = raw.trim().toLowerCase();
  if (TRUE_WORDS.has(value)) return { ok: true, value: true };
  if (FALSE_WORDS.has(value)) return { ok: true, value: false };
  return { ok: false, message: `${label} must be Yes or No (got "${raw.trim()}")` };
}

export function parseRequiredText(label: string, raw: string): ParseResult<string> {
  const value = raw.trim();
  if (value === '') return { ok: false, message: `${label} cannot be empty` };
  return { ok: true, value };
}

/** Semicolon-separated cell to a list, with the blanks dropped. */
export function parseList(raw: string): string[] {
  return raw
    .split(LIST_SEPARATOR)
    .map((part) => part.trim())
    .filter((part) => part !== '');
}
