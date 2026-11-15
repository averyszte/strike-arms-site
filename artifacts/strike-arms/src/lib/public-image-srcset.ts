/**
 * Srcsets for the shop's own photos in public/images. Each photo has smaller
 * copies beside it named `<name>-<width>.webp` (for example
 * `sniper-640.webp`), made with sharp from the original.
 */

/** "/images/a/b.webp", 640 -> "/images/a/b-640.webp". */
export function scaledImagePath(src: string, width: number): string {
  const dot = src.lastIndexOf(".");
  return dot === -1 ? `${src}-${width}` : `${src.slice(0, dot)}-${width}${src.slice(dot)}`;
}

/** The smaller copies at their widths, then the original at its full width. */
export function publicImageSrcSet(src: string, widths: readonly number[], fullWidth: number): string {
  const scaled = widths.map((w) => `${scaledImagePath(src, w)} ${w}w`);
  return [...scaled, `${src} ${fullWidth}w`].join(", ");
}

/** Copies made for the Evolution banner (2560 px original). */
export const EVOLUTION_BANNER_WIDTHS = [640, 1280, 1920] as const;
export const EVOLUTION_BANNER_FULL_WIDTH = 2560;

/** Copies made for every play-style photo (about 1900 px originals). */
export const LOADOUT_IMAGE_WIDTHS = [640, 1280] as const;
export const LOADOUT_IMAGE_FULL_WIDTH = 1900;
