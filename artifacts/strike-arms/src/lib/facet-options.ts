/** How many brands show before "Show more", and the list length that earns one. */
export const BRAND_PREVIEW_COUNT = 6;
export const BRAND_COLLAPSE_AT = 8;

/**
 * Options worth offering: anything with products under the other filters,
 * plus anything already ticked, so a choice never vanishes while it is on.
 */
export function visibleFacetOptions<T extends { slug: string; count: number }>(
  options: T[],
  selected: readonly string[],
): T[] {
  return options.filter((option) => option.count > 0 || selected.includes(option.slug));
}

/**
 * The collapsed brand list: ticked brands always make the cut, then the
 * biggest, so collapsing never hides what is filtering the grid.
 */
export function previewFacetOptions<T extends { slug: string }>(
  options: T[],
  selected: readonly string[],
  isExpanded: boolean,
): { shown: T[]; hiddenCount: number } {
  if (isExpanded || options.length <= BRAND_COLLAPSE_AT) return { shown: options, hiddenCount: 0 };
  const picked = options.filter((o) => selected.includes(o.slug));
  const rest = options.filter((o) => !selected.includes(o.slug));
  const shown = [...picked, ...rest.slice(0, Math.max(0, BRAND_PREVIEW_COUNT - picked.length))];
  return { shown, hiddenCount: options.length - shown.length };
}

/** A brand ticked on or off, as the sorted list the URL stores. */
export function toggleFacetValue(
  selected: readonly string[] | undefined,
  value: string,
  isOn: boolean,
): string[] | undefined {
  const rest = (selected ?? []).filter((v) => v !== value);
  const next = isOn ? [...rest, value].sort() : rest;
  return next.length ? next : undefined;
}
