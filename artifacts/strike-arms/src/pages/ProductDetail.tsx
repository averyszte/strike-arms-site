import { useParams, Redirect } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SiteLayout } from '@/components/SiteLayout';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductAddToCart } from '@/components/product/ProductAddToCart';
import { ProductCard } from '@/components/catalog/ProductCard';
import { useProduct } from '@/hooks/useProduct';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/lib/cart-context';
import { formatBrand } from '@/lib/format-brand';
import { getCategory, getSubcategory } from '@/lib/taxonomy';
import type { CategorySlug } from '@/lib/taxonomy';
import type { Product } from '@/types/product';

function formatPrice(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-24 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
        </div>
      </SiteLayout>
    );
  }

  if (!product) return <Redirect to="/not-found" />;

  return <ProductDetailInner product={product} />;
}

function ProductDetailInner({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const { data: relatedData } = useProducts({ category: product.category, pageSize: 5 });
  const relatedProducts = (relatedData?.items ?? [])
    .filter(p => p.slug !== product.slug)
    .slice(0, 4);

  const categoryDef = getCategory(product.category as CategorySlug);
  const subcategoryDef = categoryDef
    ? getSubcategory(product.category as CategorySlug, product.subcategory)
    : undefined;

  const hasDiscount = product.salePrice !== undefined && product.salePrice < product.price;

  function handleAdd(quantity: number) {
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        image: product.images[0] ?? '/images/category-rifles.png',
        category: product.category,
        priceCents: product.price,
        salePriceCents: product.salePrice,
      });
    }
    openCart();
  }

  return (
    <SiteLayout>
      <Helmet>
        <title>{product.name} | Strike Arms Airsoft Dublin</title>
        <meta name="description" content={product.shortDescription} />
        <link rel="canonical" href={`https://strikearms.ie/products/${product.slug}`} />
      </Helmet>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link href="/store">Shop</Link></BreadcrumbLink>
            </BreadcrumbItem>
            {categoryDef && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/store/${product.category}`}>{categoryDef.label}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            {subcategoryDef && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/store/${product.category}/${product.subcategory}`}>
                      {subcategoryDef.label}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground">{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Main layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14">
          <ProductGallery images={product.images} name={product.name} />

          {/* Info panel */}
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-1">
                {formatBrand(product.brand)}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.isNew && (
                <Badge className="bg-accent text-accent-foreground uppercase text-[10px] tracking-wide">
                  New
                </Badge>
              )}
              {hasDiscount && (
                <Badge className="bg-destructive text-destructive-foreground uppercase text-[10px] tracking-wide">
                  Sale
                </Badge>
              )}
              {!product.inStock && (
                <Badge variant="outline" className="uppercase text-[10px] tracking-wide">
                  Out of stock
                </Badge>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {hasDiscount ? (
                <>
                  <span className="text-3xl font-bold text-accent">
                    {formatPrice(product.salePrice!)}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm font-semibold text-destructive">
                    Save {formatPrice(product.price - product.salePrice!)}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-foreground">{formatPrice(product.price)}</span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.shortDescription}</p>

            <hr className="border-border" />

            <ProductAddToCart inStock={product.inStock} onAdd={handleAdd} />

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1.5 pt-1">
              <p>✓ Click &amp; Collect available in-store · Dublin 6W</p>
              <p>✓ Expert advice — call us on +353 87 273 6351</p>
            </div>
          </div>
        </div>

        {/* Long description */}
        {product.description && (
          <div className="mt-14 max-w-3xl">
            <h2 className="text-xl font-bold text-foreground mb-4">About this product</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xl font-bold text-foreground mb-5">You might also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
