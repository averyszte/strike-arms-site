import type { CrossSellTarget } from '@/lib/cross-sell';
import type { CustomerLinkType } from '@/types/customer-account';
import type { InquiryStatus } from '@/types/inquiry';
import type { FulfillmentStatus, OrderListFilters } from '@/types/order';
import type { AdminProductListFilters, Category, ProductFilters } from '@/types/product';

/**
 * Every React Query key the app uses, in one place (W-02).
 *
 * Keys are a contract between hooks: a mutation invalidates by prefix, so a
 * key renamed in one hook and not the other silently stops the refresh. Each
 * factory returns exactly the array the hook used before this file existed,
 * so the cache entries, and every prefix that invalidates them, are unchanged.
 *
 * The `*_ROOT` entries are the prefixes to invalidate. An admin edit to a
 * product should, for example, invalidate PRODUCT_KEYS.root and the other
 * catalogue roots listed in CATALOGUE_ROOT_KEYS.
 */

export const PRODUCT_KEYS = {
  /** Prefix for every product list. Admin edits already invalidate this. */
  root: ['products'] as const,
  list: (filters: ProductFilters) => ['products', filters] as const,
  detail: (slug: string | undefined) => ['product', slug] as const,
  detailRoot: ['product'] as const,
  search: (term: string) => ['product-search', term] as const,
  searchRoot: ['product-search'] as const,
  shelf: (target: CrossSellTarget, limit: number) =>
    ['shelf', target.category, target.subcategory, limit] as const,
  shelfRoot: ['shelf'] as const,
  evolutionBand: ['evolution-band-products'] as const,
  loadout: (slugs: readonly string[]) => ['loadout-products', slugs] as const,
  loadoutRoot: ['loadout-products'] as const,
} as const;

export const CATALOGUE_KEYS = {
  brands: (category: Category | undefined) => ['brands', category] as const,
  brandsRoot: ['brands'] as const,
  brandCategories: (brand: string) => ['brand-categories', brand] as const,
  brandCategoriesRoot: ['brand-categories'] as const,
  /** Prefix for the subcategory lists. Admin category edits invalidate this. */
  subcategoriesRoot: ['subcategories'] as const,
  subcategories: (category: Category | undefined) =>
    ['subcategories', category ?? 'all'] as const,
  facetRows: ['facet-rows'] as const,
  facetSearchIds: (q: string | undefined) => ['facet-search-ids', q] as const,
  shelfCounts: ['shelf-counts'] as const,
} as const;

/**
 * Every catalogue prefix a product or category edit can make stale. The admin
 * pass should invalidate each of these after a product write (A3-06), so the
 * shop does not show the old product until its stale time runs out.
 */
export const CATALOGUE_ROOT_KEYS = [
  PRODUCT_KEYS.root,
  PRODUCT_KEYS.detailRoot,
  PRODUCT_KEYS.searchRoot,
  PRODUCT_KEYS.shelfRoot,
  PRODUCT_KEYS.evolutionBand,
  PRODUCT_KEYS.loadoutRoot,
  CATALOGUE_KEYS.brandsRoot,
  CATALOGUE_KEYS.brandCategoriesRoot,
  CATALOGUE_KEYS.subcategoriesRoot,
  CATALOGUE_KEYS.facetRows,
  CATALOGUE_KEYS.shelfCounts,
] as const;

export const CART_KEYS = {
  freshness: ['cart-freshness'] as const,
  storeRates: ['store-rates'] as const,
} as const;

export const CHECKOUT_KEYS = {
  status: (orderId: string, sessionId: string) =>
    ['checkout-status', orderId, sessionId] as const,
} as const;

/** Everything under this root is dropped when a customer signs out. */
export const CUSTOMER_QUERY_ROOT = 'customer';

export const CUSTOMER_KEYS = {
  root: [CUSTOMER_QUERY_ROOT] as const,
  profile: (userId: string | null) => [CUSTOMER_QUERY_ROOT, 'profile', userId] as const,
  orders: (userId: string | null) => [CUSTOMER_QUERY_ROOT, 'orders', userId] as const,
  emailLink: (type: CustomerLinkType, tokenHash: string | null) =>
    ['customer-email-link', type, tokenHash] as const,
} as const;

/**
 * The admin's keys. Same contract as above: each factory returns the array the
 * hook used before, and the `*Root` entries are the prefixes a write
 * invalidates.
 */
export const ADMIN_KEYS = {
  productsRoot: ['admin', 'products'] as const,
  productsAll: ['admin', 'products', 'all'] as const,
  productsList: (filters: AdminProductListFilters) =>
    ['admin', 'products', 'list', filters] as const,
  ordersRoot: ['admin', 'orders'] as const,
  orders: (filters: OrderListFilters) => ['admin', 'orders', filters] as const,
  ordersWithItems: ['admin', 'orders', 'all-with-items'] as const,
  orderRoot: ['admin', 'order'] as const,
  order: (id: string | null) => ['admin', 'order', id] as const,
  statusEmailPreview: (status: FulfillmentStatus | null, orderIds: string[]) =>
    ['admin', 'status-email-preview', status, orderIds] as const,
  orderEmailsRoot: ['admin', 'order-emails'] as const,
  orderEmails: (orderId: string | null) => ['admin', 'order-emails', orderId] as const,
  inquiriesRoot: ['admin', 'inquiries'] as const,
  inquiries: (status: InquiryStatus | undefined, limit: number) =>
    ['admin', 'inquiries', status, limit] as const,
  paymentAlertsRoot: ['admin', 'payment-alerts'] as const,
  paymentAlerts: (view: 'open' | 'handled') => ['admin', 'payment-alerts', view] as const,
  migrationStatus: ['migration-status'] as const,
  storeRatesHistory: ['store-rates-history'] as const,
} as const;

const MINUTE_MS = 60 * 1000;

/** Store rates: a change should reach shoppers within a minute. */
export const STALE_TIME_ONE_MINUTE = MINUTE_MS;
/** Catalogue reads that change when Alan edits a product. */
export const STALE_TIME_FIVE_MINUTES = 5 * MINUTE_MS;
/** Homepage bands and add-on shelves, which change far more slowly than they are read. */
export const STALE_TIME_HALF_HOUR = 30 * MINUTE_MS;
/** How long an unused search result stays cached. */
export const GC_TIME_TEN_MINUTES = 10 * MINUTE_MS;
/** How long unused store rates stay cached. */
export const GC_TIME_ONE_HOUR = 60 * MINUTE_MS;
