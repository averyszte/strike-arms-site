/** Format an integer EUR-cents amount as a display price, e.g. 18900 -> "€189.00". */
export function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}
