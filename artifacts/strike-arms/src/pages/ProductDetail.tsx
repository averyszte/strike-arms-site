import { Fragment, useState } from 'react';
import { useParams, Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, Wrench, Truck, MapPin, Store } from 'lucide-react';

import { SiteLayout } from '@/components/SiteLayout';
import { JsonLd } from '@/components/JsonLd';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useCart } from '@/hooks/use-cart';
import { useProduct } from '@/hooks/useProduct';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/format-price';
import { getBrandName } from '@/lib/brands';
import { getCategory, getSubcategory } from '@/lib/taxonomy';
import { SITE_URL, BUSINESS, toAbsoluteUrl } from '@/lib/site-config';
import {
  buildProductSchema,
  buildBreadcrumbSchema,
  type BreadcrumbEntry,
} from '@/lib/structured-data';
import type { Product } from '@/types/product';
import NotFound from '@/pages/not-found';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug);

  if (isLoading) return <ProductDetailSkeleton />;
  if (!product) return <NotFound />;
  return <ProductDetailView product={product} />;
}

function buildCrumbs(product: Product): BreadcrumbEntry[] {
  const category = getCategory(product.category);
  const subcategory = getSubcategory(product.category, product.subcategory);
  const crumbs: BreadcrumbEntry[] = [{ name: 'Home', path: '/' }];
  if (category) {
    crumbs.push({ name: category.shortLabel, path: `/store/${category.slug}` });
    if (subcategory) {
      crumbs.push({
        name: subcategory.label,
        path: `/store/${category.slug}/${subcategory.slug}`,
      });
    }
  }
  crumbs.push({ name: product.name, path: `/products/${product.slug}` });
  return crumbs;
}

function ProductDetailView({ product }: { product: Product }) {
  const crumbs = buildCrumbs(product);
  const priceCents = product.salePrice ?? product.price;
  const description = product.shortDescription;

  return (
    <SiteLayout>
      <Helmet>
        <title>{`${product.name} | Strike Arms Airsoft Dublin`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${SITE_URL}/products/${product.slug}`} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.name} | Strike Arms`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${SITE_URL}/products/${product.slug}`} />
        <meta property="og:image" content={toAbsoluteUrl(product.images[0] ?? '/opengraph.jpg')} />
        <meta property="product:price:amount" content={(priceCents / 100).toFixed(2)} />
        <meta property="product:price:currency" content="EUR" />
      </Helmet>
      <JsonLd data={[buildProductSchema(product), buildBreadcrumbSchema(crumbs)]} />

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-10">
        <ProductCrumbs crumbs={crumbs} />
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <ProductGallery product={product} />
          <ProductInfo product={product} />
        </div>
        <RelatedProducts product={product} />
      </div>
    </SiteLayout>
  );
}

function ProductCrumbs({ crumbs }: { crumbs: BreadcrumbEntry[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <Fragment key={crumb.path}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.path}>{crumb.name}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const images = product.images.length > 0 ? product.images : ['/images/category-rifles.png'];

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-sm border border-border bg-muted">
        <img
          src={images[active]}
          alt={product.name}
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((image, index) => (
            <button
              key={image + index}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              className={`h-16 w-16 overflow-hidden rounded-sm border ${index === active ? 'border-foreground' : 'border-border'}`}
            >
              <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductInfo({ product }: { product: Product }) {
  const { toast } = useToast();
  const { addLine } = useCart();
  const hasDiscount = product.salePrice !== undefined && product.salePrice < product.price;
  const unitPriceCents = hasDiscount ? product.salePrice! : product.price;

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
            <span className="text-2xl font-bold text-accent">{formatPrice(product.salePrice!)}</span>
            <span className="text-base text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          </>
        ) : (
          <span className="text-2xl font-bold text-foreground">{formatPrice(product.price)}</span>
        )}
        <Badge variant={product.inStock ? 'secondary' : 'outline'} className="uppercase tracking-wide">
          {product.inStock ? 'In stock' : 'Out of stock'}
        </Badge>
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
    </div>
  );
}

function RelatedProducts({ product }: { product: Product }) {
  const { data } = useProducts({
    category: product.category,
    subcategory: product.subcategory,
    pageSize: 5,
  });
  const related = (data?.items ?? []).filter((p) => p.id !== product.id).slice(0, 4);
  if (related.length === 0) return null;

  return (
    <section className="mt-14">
      <h2 className="text-xl font-bold text-foreground">Related products</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {related.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
}

function ProductDetailSkeleton() {
  return (
    <SiteLayout>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10">
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-sm" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-11 w-40" />
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
