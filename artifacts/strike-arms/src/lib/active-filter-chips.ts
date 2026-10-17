import { BRAND_NAMES } from '@/lib/brands';
import { CONDITION_LABELS } from '@/lib/product-condition';
import { centsToEuroInput } from '@/lib/price-scale';
import { toggleFacetValue } from '@/lib/facet-options';
import type { ProductFilters } from '@/types/product';

/** One applied filter above the grid, with the patch that takes it off. */
export type ActiveFilterChip = {
  key: string;
  label: string;
  remove: Partial<ProductFilters>;
};

const euros = (cents: number) => `€${centsToEuroInput(cents)}`;

function priceLabel(min?: number, max?: number): string | undefined {
  if (min !== undefined && max !== undefined) return `${euros(min)} – ${euros(max)}`;
  if (max !== undefined) return `Under ${euros(max)}`;
  if (min !== undefined) return `Over ${euros(min)}`;
  return undefined;
}

/** Every filter narrowing the shelf, in sidebar order. Category is the path, not a chip. */
export function buildActiveFilterChips(filters: ProductFilters): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];
  if (filters.inStockOnly) {
    chips.push({ key: 'stock', label: 'In stock', remove: { inStockOnly: false } });
  }
  if (filters.onSaleOnly) {
    chips.push({ key: 'sale', label: 'On sale', remove: { onSaleOnly: false } });
  }
  const price = priceLabel(filters.minPrice, filters.maxPrice);
  if (price) {
    chips.push({
      key: 'price',
      label: price,
      remove: { minPrice: undefined, maxPrice: undefined },
    });
  }
  for (const slug of filters.brands ?? []) {
    chips.push({
      key: `brand-${slug}`,
      label: BRAND_NAMES[slug] ?? slug,
      remove: { brands: toggleFacetValue(filters.brands, slug, false) },
    });
  }
  if (filters.condition) {
    chips.push({
      key: 'condition',
      label: CONDITION_LABELS[filters.condition],
      remove: { condition: undefined },
    });
  }
  return chips;
}

/** The patch behind "Clear all": every filter off, the shelf and search kept. */
export const CLEAR_ALL_FILTERS: Partial<ProductFilters> = {
  brands: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  inStockOnly: false,
  onSaleOnly: false,
  condition: undefined,
};
