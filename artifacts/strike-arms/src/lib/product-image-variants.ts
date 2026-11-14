/**
 * The card-sized copy stored next to each uploaded product photo (M-044).
 *
 * products/2026/<uuid>.jpg has products/2026/<uuid>-card.jpg beside it, 800px
 * on the long edge. Only the full path is saved on the product; the card path
 * is always derived, so there is nothing extra to keep in step. Photos
 * uploaded before this change have no card copy, so a page using it needs to
 * fall back to the full image.
 */

const CARD_SUFFIX = '-card';

/** The card copy's path or URL, from the full one. Unchanged when there is no extension. */
export function cardVariantOf(pathOrUrl: string): string {
  const [base, query] = pathOrUrl.split('?');
  const dot = base.lastIndexOf('.');
  if (dot <= base.lastIndexOf('/')) return pathOrUrl;
  const card = `${base.slice(0, dot)}${CARD_SUFFIX}${base.slice(dot)}`;
  return query === undefined ? card : `${card}?${query}`;
}
