/**
 * Re-maps a horizontal percentage on an image to the same spot inside a box
 * that shows the image with `object-cover`.
 *
 * When the image is wider than the box, cover scales it to the box height and
 * trims equal amounts off both sides, so a point at x% of the image moves.
 * Vertical positions are unaffected in that case. A box as wide as or wider
 * than the image would trim top and bottom instead; that is not handled here
 * and x is returned unchanged.
 */
export function coverCropX(x: number, imageAspect: number, boxAspect: number): number {
  if (imageAspect <= boxAspect) return x;
  const scale = imageAspect / boxAspect;
  return x * scale - (scale - 1) * 50;
}
