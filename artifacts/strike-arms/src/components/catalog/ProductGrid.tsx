import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ProductCard } from './ProductCard';
import { CTA_SECONDARY_SM } from '@/lib/storefront-styles';
import type { Product } from '@/types/product';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onClearFilters: () => void;
}

function SkeletonCard() {
  return (
    <div className="border border-border/60 bg-card overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-12 mt-1" />
      </div>
    </div>
  );
}

export function ProductGrid({ products, isLoading, onClearFilters }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">No products found for the selected filters.</p>
        <Button variant="outline" className={CTA_SECONDARY_SM} onClick={onClearFilters}>
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
