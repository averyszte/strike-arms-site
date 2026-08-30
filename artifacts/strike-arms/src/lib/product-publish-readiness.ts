import type { Product } from '@/types/product';

/**
 * Whether a product would embarrass the shop if it went live right now.
 *
 * Only the two things a customer sees immediately and cannot work around: a
 * card with no image, and a price of nothing. A missing description is a
 * shame; a missing price is an item somebody can put in a basket for free.
 */
export function isIncompleteForShop(product: Product): boolean {
  return product.images.length === 0 || product.price <= 0;
}

export function countIncomplete(products: Product[]): number {
  return products.filter(isIncompleteForShop).length;
}
