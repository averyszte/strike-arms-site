import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { formatBrand } from '@/lib/format-brand';
import type { Product } from '@/types/product';

function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { slug, name, brand, price, salePrice, images, inStock, isNew, isFeatured } = product;
  const displayImage = images[0] ?? '/images/category-rifles.png';
  const hasDiscount = salePrice !== undefined && salePrice < price;

  return (
    <Link
      href={`/products/${slug}`}
      className="group block rounded-sm border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-transform duration-150 hover:-translate-y-0.5"
      tabIndex={0}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-sm bg-muted">
        <img
          src={displayImage}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {/* Badge row — top-left */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {isNew && (
            <Badge className="text-[10px] px-1.5 py-0.5 bg-accent text-accent-foreground uppercase tracking-wide">
              New
            </Badge>
          )}
          {isFeatured && !isNew && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 uppercase tracking-wide">
              Featured
            </Badge>
          )}
          {hasDiscount && (
            <Badge className="text-[10px] px-1.5 py-0.5 bg-destructive text-destructive-foreground uppercase tracking-wide">
              Sale
            </Badge>
          )}
          {!inStock && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 uppercase tracking-wide">
              Out of stock
            </Badge>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {formatBrand(brand)}
        </p>
        <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
          {name}
        </p>
        <div className="flex items-baseline gap-2 pt-0.5">
          {hasDiscount ? (
            <>
              <span className="text-sm font-bold text-accent">{formatPrice(salePrice!)}</span>
              <span className="text-xs text-muted-foreground line-through">{formatPrice(price)}</span>
            </>
          ) : (
            <span className="text-sm font-bold text-foreground">{formatPrice(price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
