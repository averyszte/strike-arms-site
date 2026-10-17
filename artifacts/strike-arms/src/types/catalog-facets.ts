import type { ProductCondition } from '@/types/product';

/** The few columns of a published product the filter sidebar counts over. */
export type FacetRow = {
  id: string;
  category: string;
  subcategory: string;
  brand: string;
  condition: ProductCondition;
  priceCents: number;
  inStock: boolean;
  isOnSale: boolean;
};

export type BrandFacet = { slug: string; name: string; count: number };

/**
 * What the sidebar shows next to each control. Every count is "how many
 * products you would see if you picked this", so each facet is counted with
 * all the other filters applied but not its own (disjunctive faceting):
 * ticking one brand must not make every other brand read 0.
 */
export type CatalogFacets = {
  /** Most expensive product on the shelf, rounded up to the next EUR 100. */
  priceCeilingCents: number;
  /** Whole catalogue, keyed `rifles` and `rifles/aeg-rifles`. */
  shelfCounts: Record<string, number>;
  brands: BrandFacet[];
  conditionCounts: Record<ProductCondition, number>;
};
