/**
 * Whether a shelf earns a link: it has published products, or it is the one
 * being viewed. Unknown counts (still loading) show everything.
 */
export function isShelfVisible(
  counts: Record<string, number> | undefined,
  key: string,
  isActive: boolean,
): boolean {
  if (!counts || isActive) return true;
  return (counts[key] ?? 0) > 0;
}
