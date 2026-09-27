import { ShoppingCart, Wrench, Truck, MapPin, Store } from 'lucide-react';

import { PreLovedNotice } from '@/components/catalog/PreLovedNotice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/format-price';
import { isPreLoved } from '@/lib/product-condition';
import { getBrandName } from '@/lib/brands';
import type { Product } from '@/types/product';

export function ProductInfo({ product }: { product: Product }) {
  const { toast } = useToast();
  const { addLine } = useCart();
  const hasDiscount = product.salePrice !== undefined && product.salePrice < product.price;
  const unitPriceCents = hasDiscount ? product.salePrice! : product.price;
  const preLoved = isPreLoved(product.condition);

  const handleAddToCart = () => {
    addLine({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      image: product.images[0] ?? null,
      unitPriceCents,
      isShippable: product.isShippable,
    });

    toast({
      title: 'Added to your cart',
      description: product.isShippable
        ? `${product.name} is in your cart.`
        : `${product.name} is collect-in-store only. It will be held for you at the shop.`,
    });
  };

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {getBrandName(product.brand)}
      </p>
      <h1 className="mt-1 text-2xl md:text-3xl font-bold text-foreground">{product.name}</h1>

      <div className="mt-3 flex items-center gap-3">
        {hasDiscount ? (
          <>
            <span className="text-2xl font-bold text-accent">
              {formatPrice(product.salePrice!)}
            </span>
            <span className="text-base text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          </>
        ) : (
          <span className="text-2xl font-bold text-foreground">{formatPrice(product.price)}</span>
        )}
        <Badge
          variant={product.inStock ? 'secondary' : 'outline'}
          className="uppercase tracking-wide"
        >
          {product.inStock ? 'In stock' : 'Out of stock'}
        </Badge>
        {preLoved && (
          <Badge className="bg-foreground text-background uppercase tracking-wide">Pre-loved</Badge>
        )}
      </div>

      <p className="mt-4 text-muted-foreground leading-relaxed">{product.shortDescription}</p>

      <Button
        className="mt-6 w-full sm:w-auto"
        size="lg"
        onClick={handleAddToCart}
        disabled={!product.inStock}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {product.inStock ? 'Add to cart' : 'Out of stock'}
      </Button>

      <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0" /> Walk-in shop in Swords, Co. Dublin
        </li>
        <li className="flex items-center gap-2">
          {product.isShippable ? (
            <>
              <Truck className="h-4 w-4 shrink-0" /> Delivery across Ireland, or collect in store
            </>
          ) : (
            <>
              <Store className="h-4 w-4 shrink-0" /> Collect in store only &mdash; we do not post
              this item
            </>
          )}
        </li>
        <li className="flex items-center gap-2">
          <Wrench className="h-4 w-4 shrink-0" /> In-house repairs &amp; upgrades
        </li>
      </ul>

      {preLoved && <PreLovedNotice />}
    </div>
  );
}
