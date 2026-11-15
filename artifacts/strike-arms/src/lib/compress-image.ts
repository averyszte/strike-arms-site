/**
 * Browser-side image compression, run before anything is uploaded.
 *
 * Alan photographs stock on a phone, so the raw files are 4–8 MB and several
 * thousand pixels wide, for a card that renders at 400px. Uploading them as-is
 * spends his bandwidth, the bucket's storage and every shopper's data
 * allowance on detail no one sees.
 *
 * Output is WebP, which is smaller than JPEG and keeps PNG transparency. Some
 * browsers (older Safari) cannot encode WebP from a canvas; toBlob then hands
 * back a PNG instead of failing, so the blob's type is checked and the photo is
 * encoded again as JPEG (or PNG, for a PNG source, so transparency survives).
 *
 * Every photo is always re-encoded, never uploaded as the original file: the
 * canvas drops EXIF and other metadata (camera, date, possibly GPS location).
 *
 * Layer note: this uses browser canvas APIs, so it is not pure. It stays in lib/
 * because it touches no network or storage; only data/storage-repository calls it.
 */

export type CompressedImage = {
  blob: Blob;
  contentType: string;
  /** Without the dot, ready to append to a generated file name. */
  extension: string;
};

/** Longest edge, in pixels. Twice the largest size the catalogue renders. */
const MAX_EDGE = 1600;
/**
 * The card copy (M-044): product cards render at about 400px, so 800 covers a
 * 2x screen. The storefront picks it through srcset; see product-image-variants.
 */
const CARD_EDGE = 800;
const QUALITY = 0.82;

type ImageFormat = { contentType: string; extension: string };

const WEBP: ImageFormat = { contentType: 'image/webp', extension: 'webp' };
const PNG: ImageFormat = { contentType: 'image/png', extension: 'png' };
const JPEG: ImageFormat = { contentType: 'image/jpeg', extension: 'jpg' };

/** The dimensions to draw at: unchanged unless the longest edge is over MAX_EDGE. */
function scaleToFit(width: number, height: number, maxEdge: number): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };
  const ratio = maxEdge / longest;
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        // toBlob reports failure by handing back null rather than throwing.
        if (blob) resolve(blob);
        else reject(new Error('The browser could not encode this image.'));
      },
      type,
      quality,
    );
  });
}

async function encodeAt(bitmap: ImageBitmap, maxEdge: number, contentType: string): Promise<Blob> {
  const { width, height } = scaleToFit(bitmap.width, bitmap.height, maxEdge);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('The browser could not process this image.');
  context.drawImage(bitmap, 0, 0, width, height);
  return canvasToBlob(canvas, contentType, QUALITY);
}

export type CompressedImageSizes = { full: CompressedImage; card: CompressedImage };

async function encodeBoth(bitmap: ImageBitmap, format: ImageFormat): Promise<CompressedImageSizes> {
  const full = await encodeAt(bitmap, MAX_EDGE, format.contentType);
  const card = await encodeAt(bitmap, CARD_EDGE, format.contentType);
  return { full: { blob: full, ...format }, card: { blob: card, ...format } };
}

/**
 * The full-size photo and the smaller card copy, from one decode. Both are
 * always the same format, because the card's path is derived from the full
 * photo's (see product-image-variants).
 */
export async function compressImageSizes(file: File): Promise<CompressedImageSizes> {
  const bitmap = await createImageBitmap(file);
  try {
    const webp = await encodeBoth(bitmap, WEBP);
    if (webp.full.blob.type === WEBP.contentType && webp.card.blob.type === WEBP.contentType) {
      return webp;
    }
    // This browser cannot encode WebP from a canvas.
    return await encodeBoth(bitmap, file.type === 'image/png' ? PNG : JPEG);
  } finally {
    bitmap.close();
  }
}
