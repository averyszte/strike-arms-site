// Relative, with the extension, so node --test can load this file (see
// admin-dashboard-metrics.ts for the same pattern).
import { cardVariantOf } from './product-image-variants.ts';

/**
 * The srcset for a product photo shown at card size (M-044).
 *
 * Only photos uploaded to the product-images bucket have an 800px card copy
 * beside them. Anything else (the placeholder, a pasted external URL) gets no
 * srcset, so the browser never asks for a card file that cannot exist. Photos
 * uploaded before the card copies existed still match here; the image's
 * onError drops the srcset so the browser falls back to the full photo.
 */

const STORED_PRODUCT_PHOTO = '/storage/v1/object/public/product-images/';
/** Width of the stored card copy, on its long edge. */
const CARD_WIDTH = 800;
/** A width the browser treats as "bigger than the card", for the full photo. */
const FULL_WIDTH = 1600;

export function cardImageSrcSet(fullUrl: string): string | undefined {
  if (!fullUrl.includes(STORED_PRODUCT_PHOTO)) return undefined;
  const card = cardVariantOf(fullUrl);
  if (card === fullUrl) return undefined;
  return `${card} ${CARD_WIDTH}w, ${fullUrl} ${FULL_WIDTH}w`;
}
