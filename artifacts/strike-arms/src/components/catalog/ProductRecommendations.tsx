import { ProductCard } from '@/components/catalog/ProductCard';
import { useCrossSellProducts, useSimilarProducts } from '@/hooks/use-related-products';
import type { Product } from '@/types/product';

/**
 * Two rows under the product: what goes with it, then what is like it.
 *
 * Add-ons come first on purpose. Somebody who has decided on a rifle is served
 * better by being reminded it needs a battery and BBs than by four more rifles.
 * Either row renders nothing at all when it has nothing to say -- an empty
 * heading reads as a broken page.
 */

const ROW_SIZE = 4;

function Row({
  title,
  subtitle,
  products,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
}) {
  if (products.length === 0) return null;
  return (
    <section className="mt-14">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
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
        products={crossSell}
      />
      <Row title="You might also like" products={similar} />
    </>
  );
}
