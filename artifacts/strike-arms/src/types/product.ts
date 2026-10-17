export type Category =
  | 'rifles'
  | 'pistols'
  | 'consumables'
  | 'accessories'
  | 'gear'
  | 'more';

/**
 * New stock, or a secondhand one-off.
 *
 * A real column since migration 018, not a slug prefix and a tag that somebody
 * has to remember to type. Alan's instruction was that secondhand items are
 * stressed as sold as seen -- which needs something the shop can badge, filter
 * and put in structured data, not a sentence at the bottom of a description.
 */
export type ProductCondition = 'new' | 'pre-loved';

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  subcategory: string;        // matches mega-menu sub-slugs e.g. 'aeg-rifles', 'sniper'
  brand: string;              // lowercase slug e.g. 'specna-arms'
  // Not the same thing as isNew. isNew is a marketing badge meaning "newly
  // listed"; this is what the customer is actually buying.
  condition: ProductCondition;
  price: number;              // EUR in cents (integer)
  salePrice?: number;         // EUR in cents
  images: string[];           // relative paths for now, absolute URLs later
  shortDescription: string;
  description?: string | null;
  // Set by hand in the admin (038). A sale does not change it.
  inStock: boolean;
  // Guns are collect-in-store only. False is the safe default: an item is
  // never posted unless someone has explicitly said it may be.
  isShippable: boolean;
  isPublished?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  // Archived stands in for delete (026): off the shop and out of the admin
  // list, but its order links are kept.
  isArchived?: boolean;
  tags?: string[];
  createdAt: string;          // ISO date — used for sort-by-newest
};

export type ProductFilters = {
  category?: Category;
  subcategory?: string;
  brands?: string[];          // OR within the facet; URL `brand=a,b`
  q?: string;                 // free-text search query (store search results)
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  isNewOnly?: boolean;
  condition?: ProductCondition;
  tag?: string;               // a shelf built from a tag, e.g. 'jumble'
  excludeTags?: string[];     // keeps those shelves off a broader one
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
/** The products list's stock filter. */
export type ProductStockFilter = 'all' | 'in' | 'out';

export type AdminProductListFilters = {
  search?: string;
  stock?: ProductStockFilter;
  /** Archived products are a separate view, never mixed in with live ones. */
  isArchived?: boolean;
  page?: number;
  pageSize?: number;
};

/**
 * The fields a bulk action may change.
 *
 * Deliberately narrow: the flags a shopkeeper flips across a range at once.
 * Prices and names are not here because a bulk edit of them is a CSV import
 * with a preview, not a button.
 */
export type ProductBulkPatch = {
  isPublished?: boolean;
  inStock?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
};

/**
 * A partial product for an update.
 *
 * salePrice widens to null because clearing a sale is a real edit: undefined
 * means "the caller said nothing about it", null means "take the sale off".
 * Product itself keeps the narrower optional number, because a product either
 * has a sale price or has none.
 */
export type ProductPatch = Partial<Omit<Product, 'salePrice' | 'isArchived'>> & {
  salePrice?: number | null;
};

/** What the product form sends to create a row. */
export type NewProduct = Omit<Product, 'id' | 'createdAt'>;
