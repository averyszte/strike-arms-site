import { ProductCard } from '@/components/catalog/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useCrossSellProducts } from '@/hooks/use-cross-sell-products';
import { useSimilarProducts } from '@/hooks/use-similar-products';
import { CONTENT_TITLE } from '@/lib/storefront-styles';
import type { RelatedRow } from '@/types/related-row';
import type { Product } from '@/types/product';

/**
 * Two rows under the product: what goes with it, then what is like it.
 *
 * Add-ons come first on purpose. Somebody who has decided on a rifle is served
 * better by being reminded it needs a battery and BBs than by four more rifles.
 * Either row renders nothing at all when it has nothing to say -- an empty
 * heading reads as a broken page. While a row is still loading it holds its
 * space with placeholder cards, so the page does not jump when it arrives
 * (N-033, desktop CLS 0.13); it collapses only once it is known to be empty.
 */

const ROW_SIZE = 4;
const PLACEHOLDER_KEYS = Array.from({ length: ROW_SIZE }, (_, i) => i);

/** Roughly a ProductCard's shape: square image, brand, two-line name, price. */
function CardPlaceholder() {
  return (
    <div className="border border-border/60 bg-card" aria-hidden="true">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-2.5 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-1/4" />
      </div>
    </div>
  );
}

function Row({
  title,
  subtitle,
  row,
}: {
  title: string;
  subtitle?: string;
  row: RelatedRow;
}) {
  const { products, isLoading } = row;
  if (!isLoading && products.length === 0) return null;
  const isPlaceholder = products.length === 0;
  return (
    <section className="mt-16 border-t border-border/60 pt-12" aria-busy={isPlaceholder}>
      <h2 className={CONTENT_TITLE}>{title}</h2>
      {subtitle && <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {isPlaceholder
          ? PLACEHOLDER_KEYS.map((key) => <CardPlaceholder key={key} />)
          : products.map((item: Product) => <ProductCard key={item.id} product={item} />)}
      </div>
    </section>
  );
}

export function ProductRecommendations({ product }: { product: Product }) {
  const crossSell = useCrossSellProducts(product, ROW_SIZE);
  const similar = useSimilarProducts(product, ROW_SIZE);

  return (
    <>
      <Row
        title="Goes well with"
        subtitle="What you will want alongside it. Ask us in the shop if you are unsure."
        row={crossSell}
      />
      <Row title="You might also like" row={similar} />
    </>
  );
}
