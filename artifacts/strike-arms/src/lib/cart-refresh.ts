import type { CartLine } from '@/types/cart';
import type { CartRefreshChanges, FreshCartDetails } from '@/types/cart-freshness';

export const NO_CART_CHANGES: CartRefreshChanges = {
  repriced: [],
  noLongerShippable: [],
  removed: [],
};

/**
 * Brings saved basket lines up to date with the catalogue, and says what
 * moved so the cart can tell the shopper rather than change the total under
 * them. Returns the same array when nothing changed, so applying it is a
 * no-op for React.
 */
export function refreshCartLines(
  lines: CartLine[],
  fresh: Map<string, FreshCartDetails>,
): { lines: CartLine[]; changes: CartRefreshChanges } {
  const changes: CartRefreshChanges = { repriced: [], noLongerShippable: [], removed: [] };
  const next: CartLine[] = [];

  for (const line of lines) {
    const current = fresh.get(line.productId);
    if (!current) {
      changes.removed.push(line.name);
      continue;
    }
    if (current.unitPriceCents !== line.unitPriceCents) changes.repriced.push(current.name);
    if (line.isShippable && !current.isShippable) changes.noLongerShippable.push(current.name);
    next.push({
      ...line,
      name: current.name,
      unitPriceCents: current.unitPriceCents,
      isShippable: current.isShippable,
    });
  }

  const isUnchanged =
    next.length === lines.length &&
    next.every(
      (line, index) =>
        line.name === lines[index].name &&
        line.unitPriceCents === lines[index].unitPriceCents &&
        line.isShippable === lines[index].isShippable,
    );

  return { lines: isUnchanged ? lines : next, changes };
}

export function hasCartChanges(changes: CartRefreshChanges): boolean {
  return (
    changes.repriced.length > 0 ||
    changes.noLongerShippable.length > 0 ||
    changes.removed.length > 0
  );
}
