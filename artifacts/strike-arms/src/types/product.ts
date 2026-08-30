export type Category =
  | 'rifles'
  | 'pistols'
  | 'consumables'
  | 'accessories'
  | 'gear'
  | 'parts'
  | 'more';

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  subcategory: string;        // matches mega-menu sub-slugs e.g. 'aeg-rifles', 'sniper'
  brand: string;              // lowercase slug e.g. 'specna-arms'
  price: number;              // EUR in cents (integer)
  salePrice?: number;         // EUR in cents
  images: string[];           // relative paths for now, absolute URLs later
  shortDescription: string;
  description?: string | null;
  inStock: boolean;
  // Guns are collect-in-store only. False is the safe default: an item is
  // never posted unless someone has explicitly said it may be.
  isShippable: boolean;
  isPublished?: boolean;
  stockCount?: number;
  // Held by checkouts in flight. What is actually sellable is
  // stockCount - reservedCount: someone mid-payment has already been promised
  // the difference.
  reservedCount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  createdAt: string;          // ISO date — used for sort-by-newest
};

export type ProductFilters = {
  category?: Category;
  subcategory?: string;
  brand?: string;
  q?: string;                 // free-text search query (store search results)
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  isNewOnly?: boolean;
  sort?: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name-asc';
  page?: number;
  pageSize?: number;
};

export type ProductListResult = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
};

/**
 * The fields a bulk action may change.
 *
 * Deliberately narrow: the flags a shopkeeper flips across a range at once.
 * Prices and names are not here because a bulk edit of them is a CSV import
 * with a preview, not a button. Stock is not here because writing stock_count
 * straight would step around adjust_stock and leave the inventory ledger
 * claiming a number the shelf does not have.
 */
export type ProductBulkPatch = {
  isPublished?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
};
