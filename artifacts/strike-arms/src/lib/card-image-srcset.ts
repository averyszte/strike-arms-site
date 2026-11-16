/**
 * The srcset for a product photo shown smaller than full size (grids, the
 * Evolution rail, the cart, search results, gallery thumbnails).
 *
 * Photos in the product-images bucket are resized by Supabase's image
 * transformation endpoint (Pro plan): the same path under
 * /storage/v1/render/image/ with a width. That works for every photo,
 * including ones uploaded before the 800px card copies existed (M-044), so
 * those copies are no longer used for display. Supabase also serves WebP to
 * browsers that accept it.
 *
 * Anything else (the placeholder, a pasted external URL) gets no srcset. If a
 * resized copy fails to load, CardImage drops the srcset and the browser falls
 * back to the full photo in `src`.
 */

const OBJECT_PATH = '/storage/v1/object/public/product-images/';
const RENDER_PATH = '/storage/v1/render/image/public/product-images/';

/** Widths offered; the browser picks one from `sizes` and the screen density. */
export const PRODUCT_IMAGE_WIDTHS = [160, 320, 480, 640, 960] as const;
const QUALITY = 75;

/** The resized copy of a stored product photo at `width`. */
export function resizedProductImage(fullUrl: string, width: number): string {
  const [base] = fullUrl.split('?');
  return `${base.replace(OBJECT_PATH, RENDER_PATH)}?width=${width}&quality=${QUALITY}`;
}

export function cardImageSrcSet(fullUrl: string): string | undefined {
  if (!fullUrl.includes(OBJECT_PATH)) return undefined;
  return PRODUCT_IMAGE_WIDTHS.map((w) => `${resizedProductImage(fullUrl, w)} ${w}w`).join(', ');
}
