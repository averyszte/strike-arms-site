import type { Product } from '@/types/product';

/** A row of related products under a product, and whether any shelf is still on its first fetch. */
export interface RelatedRow {
  products: Product[];
  isLoading: boolean;
}
