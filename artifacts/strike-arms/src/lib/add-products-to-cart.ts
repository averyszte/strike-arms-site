import { effectivePriceCents } from '@/lib/effective-price';
import { canAddToCart, MAX_QUANTITY_PER_LINE } from '@/lib/cart-limits';
import type { CartLine } from '@/types/cart';
import type { Product } from '@/types/product';

/** A product as a basket line holds it, before a quantity is set. */
export function toCartLine(product: Product): Omit<CartLine, 'quantity'> {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    image: product.images[0] ?? null,
    unitPriceCents: effectivePriceCents(product.price, product.salePrice),
    isShippable: product.isShippable,
  };
}

export type AddProductsResult = {
  lines: CartLine[];
  addedCount: number;
  /** In-stock products left out because the basket already held MAX_CART_LINES others. */
  isBasketFull: boolean;
};

/**
 * One of each in-stock product added to the basket, as a single change.
 * Calling addLine once per product would check the cap against the basket as
 * it was before any of them went in. Out-of-stock products are skipped.
 */
export function addProductsToLines(current: readonly CartLine[], products: readonly Product[]): AddProductsResult {
  let lines = [...current];
  let addedCount = 0;
  let isBasketFull = false;

  for (const product of products) {
    if (!product.inStock) continue;
    if (!canAddToCart(lines, product.id)) {
      isBasketFull = true;
      continue;
    }
    const line = toCartLine(product);
    const existing = lines.find((entry) => entry.productId === product.id);
    lines = existing
      ? lines.map((entry) =>
          entry.productId === product.id
            ? { ...entry, ...line, quantity: Math.min(MAX_QUANTITY_PER_LINE, entry.quantity + 1) }
            : entry,
        )
      : [...lines, { ...line, quantity: 1 }];
    addedCount += 1;
  }

  return { lines, addedCount, isBasketFull };
}

/** What the in-stock products of a set cost together, one of each. */
export function inStockTotalCents(products: readonly Product[]): number {
  return products
    .filter((product) => product.inStock)
    .reduce((sum, product) => sum + effectivePriceCents(product.price, product.salePrice), 0);
}
