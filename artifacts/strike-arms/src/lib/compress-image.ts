/**
 * Browser-side image compression, run before anything is uploaded.
 *
 * Alan photographs stock on a phone, so the raw files are 4–8 MB and several
 * thousand pixels wide, for a card that renders at 400px. Uploading them as-is
 * spends his bandwidth, the bucket's storage and every shopper's data
 * allowance on detail no one sees.
 *
 * Output is JPEG, except when the source is a PNG, which is kept as PNG so
 * transparency survives — a logo or a cut-out on a white background is the one
 * case where it matters. WebP would be smaller than both, and is deliberately
 * not used: Safari's canvas WebP encoding has been unreliable across versions,
 * and an encoder that silently produces an empty blob on one browser is worse
 * than a file that is 30% larger everywhere.
 */

export type CompressedImage = {
  blob: Blob;
  contentType: string;
  /** Without the dot, ready to append to a generated file name. */
  extension: string;
};

/** Longest edge, in pixels. Twice the largest size the catalogue renders. */
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;

const PNG = { contentType: 'image/png', extension: 'png' } as const;
const JPEG = { contentType: 'image/jpeg', extension: 'jpg' } as const;

/** The dimensions to draw at: unchanged unless the longest edge is over MAX_EDGE. */
function scaleToFit(width: number, height: number): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= MAX_EDGE) return { width, height };
  const ratio = MAX_EDGE / longest;
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

export async function compressImage(file: File): Promise<CompressedImage> {
  const target = file.type === 'image/png' ? PNG : JPEG;

  const bitmap = await createImageBitmap(file);
  try {
    const { width, height } = scaleToFit(bitmap.width, bitmap.height);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('The browser could not process this image.');
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, target.contentType, JPEG_QUALITY);

    // Re-encoding an already-optimised file can make it bigger. When it does,
    // and the original is a format we would have produced anyway, keep the
    // original: it is smaller and it has not been through a lossy pass twice.
    if (blob.size >= file.size && file.type === target.contentType) {
      return { blob: file, contentType: target.contentType, extension: target.extension };
    }

    return { blob, contentType: target.contentType, extension: target.extension };
  } finally {
    bitmap.close();
  }
}
