/**
 * The price slider's scale.
 *
 * Prices bunch at the cheap end (consumables at EUR 10, rifles at EUR 400), so
 * a straight line spends most of the track on a few expensive items and makes
 * the range people actually shop in a few pixels wide. Squaring the position
 * gives the bottom half of the track to the bottom quarter of the prices.
 */

/** Slider positions run 0..SLIDER_STEPS; the track maps them onto prices. */
export const SLIDER_STEPS = 1000;

const EURO = 100;

/** Whole euros up to EUR 100, then EUR 5 steps, so handles land on round prices. */
function roundPrice(cents: number): number {
  const step = cents < 100 * EURO ? EURO : 5 * EURO;
  return Math.round(cents / step) * step;
}

export function positionToCents(position: number, ceilingCents: number): number {
  const ratio = Math.min(1, Math.max(0, position / SLIDER_STEPS));
  return Math.min(ceilingCents, roundPrice(ceilingCents * ratio * ratio));
}

export function centsToPosition(cents: number, ceilingCents: number): number {
  if (ceilingCents <= 0) return 0;
  const ratio = Math.min(1, Math.max(0, cents / ceilingCents));
  return Math.round(Math.sqrt(ratio) * SLIDER_STEPS);
}

/**
 * A typed or dragged pair as filter values: clamped to the shelf, swapped when
 * the minimum is above the maximum, and left out at either end so the URL only
 * carries a bound that actually narrows the shelf.
 */
export function normalizePriceRange(
  minCents: number | undefined,
  maxCents: number | undefined,
  ceilingCents: number,
): { minPrice?: number; maxPrice?: number } {
  const clamp = (c: number) => Math.min(ceilingCents, Math.max(0, c));
  let low = clamp(minCents ?? 0);
  let high = clamp(maxCents ?? ceilingCents);
  if (low > high) [low, high] = [high, low];
  return {
    minPrice: low > 0 ? low : undefined,
    maxPrice: high < ceilingCents ? high : undefined,
  };
}

/** "189" or "189.50" from a text box into cents; blank or junk is undefined. */
export function parseEuroInput(raw: string): number | undefined {
  const cleaned = raw.replace(/[€\s,]/g, '');
  if (!cleaned) return undefined;
  const euros = Number(cleaned);
  return Number.isFinite(euros) && euros >= 0 ? Math.round(euros * EURO) : undefined;
}

/** Cents as the text a price box shows: whole euros without decimals. */
export function centsToEuroInput(cents: number): string {
  return cents % EURO === 0 ? String(cents / EURO) : (cents / EURO).toFixed(2);
}
