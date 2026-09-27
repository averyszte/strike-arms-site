import { ShoppingCart, Wrench, Truck, MapPin, Store } from 'lucide-react';

import { PreLovedNotice } from '@/components/catalog/PreLovedNotice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/format-price';
import { isPreLoved } from '@/lib/product-condition';
import { getBrandName } from '@/lib/brands';
import { CTA_PRIMARY, EYEBROW } from '@/lib/storefront-styles';
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
      <p className={EYEBROW}>
        {getBrandName(product.brand)}
      </p>
      <h1 className="mt-3 text-3xl md:text-4xl font-black uppercase tracking-tight leading-[0.95] text-foreground">{product.name}</h1>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {hasDiscount ? (
          <>
            <span className="text-3xl font-black text-accent">
              {formatPrice(product.salePrice!)}
            </span>
            <span className="text-base text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          </>
        ) : (
          <span className="text-3xl font-black text-foreground">{formatPrice(product.price)}</span>
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
        className={`${CTA_PRIMARY} mt-8 w-full sm:w-auto`}
        onClick={handleAddToCart}
        disabled={!product.inStock}
      >
        <ShoppingCart className="h-5 w-5" />
        {product.inStock ? 'Add to cart' : 'Out of stock'}
      </Button>

      <ul className="mt-8 space-y-3 border-t border-border/60 pt-6 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-accent" /> Walk-in shop in Swords, Co. Dublin
        </li>
        <li className="flex items-center gap-2">
          {product.isShippable ? (
            <>
              <Truck className="h-4 w-4 shrink-0 text-accent" /> Delivery across Ireland, or collect in store
            </>
          ) : (
            <>
              <Store className="h-4 w-4 shrink-0 text-accent" /> Collect in store only &mdash; we do not post
              this item
            </>
          )}
        </li>
        <li className="flex items-center gap-2">
          <Wrench className="h-4 w-4 shrink-0 text-accent" /> In-house repairs &amp; upgrades
        </li>
      </ul>

      {preLoved && <PreLovedNotice subcategory={product.subcategory} />}
    </div>
  );
}
