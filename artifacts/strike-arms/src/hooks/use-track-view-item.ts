import { useEffect } from 'react';

import { sendEcommerceEvent } from '@/data/google-tag-manager-client';
import { buildEcommercePayload } from '@/lib/analytics-ecommerce';
import { effectivePriceCents } from '@/lib/effective-price';
import type { Product } from '@/types/product';

/** One GA4 view_item per product opened, once the product has loaded. */
export function useTrackViewItem(product: Product | null | undefined): void {
  const productId = product?.id;
  useEffect(() => {
    if (!product) return;
    sendEcommerceEvent(
      'view_item',
      buildEcommercePayload([
        {
          productId: product.id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          unitPriceCents: effectivePriceCents(product.price, product.salePrice),
          quantity: 1,
        },
      ]),
    );
    // Keyed on the id so a background refetch of the same product sends nothing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);
}
