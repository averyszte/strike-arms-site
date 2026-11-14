/**
 * The one money-formatting module (W-03). Every amount in the app is an integer
 * number of EUR cents; these turn it into text. Parsing the other way lives in
 * parse-euro-cents.ts.
 */

/** Format an integer EUR-cents amount as a display price, e.g. 18900 -> "€189.00". */
export function formatPrice(cents: number): string {
  return `€${formatCentsPlain(cents)}`;
}

/**
 * Cents as a plain two-decimal number with no currency sign, e.g. 18900 ->
 * "189.00". For machine-read places: structured data, meta tags, CSV cells and
 * the initial value of a euro input.
 */
export function formatCentsPlain(cents: number): string {
  return (cents / 100).toFixed(2);
}
