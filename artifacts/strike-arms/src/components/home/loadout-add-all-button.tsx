import { useLocation } from 'wouter';
import { ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ToastAction } from '@/components/ui/toast';
import { useAddAllToCart } from '@/hooks/use-add-all-to-cart';
import { useToast } from '@/hooks/use-toast';
import { inStockTotalCents } from '@/lib/add-products-to-cart';
import { CART_FULL_MESSAGE } from '@/lib/cart-limits';
import { formatPrice } from '@/lib/format-price';
import { CTA_PRIMARY_SM } from '@/lib/storefront-styles';
import type { Product } from '@/types/product';

function addedDescription(addedCount: number, skippedCount: number): string {
  const added = `${addedCount} item${addedCount === 1 ? '' : 's'} added to your cart.`;
  if (skippedCount === 0) return added;
  return `${added} ${skippedCount} ${skippedCount === 1 ? 'is' : 'are'} out of stock and left out.`;
}

/** "Add all to cart" for one play style: one of each in-stock product shown. */
export function LoadoutAddAllButton({ products }: { products: readonly Product[] }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const addAll = useAddAllToCart();
  const totalCents = inStockTotalCents(products);
  const skippedCount = products.filter((product) => !product.inStock).length;

  if (totalCents === 0) return null;

  const handleClick = () => {
    const { addedCount, isBasketFull } = addAll(products);
    if (addedCount === 0) {
      toast({ title: 'Your basket is full', description: CART_FULL_MESSAGE, variant: 'destructive' });
      return;
    }
    toast({
      title: 'Added to your cart',
      description: isBasketFull ? CART_FULL_MESSAGE : addedDescription(addedCount, skippedCount),
      action: (
        <ToastAction altText="View basket" onClick={() => navigate('/cart')}>
          View basket
        </ToastAction>
      ),
    });
  };

  return (
    <Button className={`${CTA_PRIMARY_SM} w-full`} onClick={handleClick}>
      <ShoppingCart className="h-4 w-4" aria-hidden="true" />
      Add all to cart · {formatPrice(totalCents)}
    </Button>
  );
}
