import { Fragment } from 'react';
import { useParams, Link } from 'wouter';
import { Helmet } from 'react-helmet-async';

import { SiteLayout } from '@/components/SiteLayout';
import { JsonLd } from '@/components/JsonLd';
import { ProductRecommendations } from '@/components/catalog/ProductRecommendations';
import { ProductGallery } from '@/components/catalog/ProductGallery';
import { ProductInfo } from '@/components/catalog/ProductInfo';
import { ProductDescription } from '@/components/catalog/product-description';
import { CatalogLoadErrorPage } from '@/components/catalog/CatalogLoadErrorPage';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useProduct } from '@/hooks/useProduct';
import { useTrackViewItem } from '@/hooks/use-track-view-item';
import { useStoreRates } from '@/hooks/use-store-rates';
import { getCategory, getSubcategory } from '@/lib/taxonomy';
import { effectivePriceCents } from '@/lib/effective-price';
import { formatCentsPlain } from '@/lib/format-price';
import { SITE_URL, toAbsoluteUrl } from '@/lib/site-config';
import {
  buildProductMetaDescription,
  buildProductSchemaCrumbs,
  buildProductTitle,
} from '@/lib/product-page-meta';
import {
  buildProductSchema,
  buildBreadcrumbSchema,
  type BreadcrumbEntry,
} from '@/lib/structured-data';
import type { Product } from '@/types/product';
import NotFound from '@/pages/not-found';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError, isFetching, refetch } = useProduct(slug);
  useTrackViewItem(product);

  if (isLoading) return <ProductDetailSkeleton />;
  // Only a read that succeeded and found nothing is a 404. A failed read
  // rendering NotFound told search engines a live product was gone.
  if (!product && isError) {
    return <CatalogLoadErrorPage what="this product" isRetrying={isFetching} onRetry={() => void refetch()} />;
  }
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
  const { data: rates } = useStoreRates();
  const crumbs = buildCrumbs(product);
  const priceCents = effectivePriceCents(product.price, product.salePrice);
  const title = buildProductTitle(product.name);
  const description = buildProductMetaDescription(product);

  return (
    <SiteLayout>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${SITE_URL}/products/${product.slug}`} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${SITE_URL}/products/${product.slug}`} />
        <meta property="og:image" content={toAbsoluteUrl(product.images[0] ?? '/opengraph.jpg')} />
        <meta property="product:price:amount" content={formatCentsPlain(priceCents)} />
        <meta property="product:price:currency" content="EUR" />
      </Helmet>
      <JsonLd
        data={[buildProductSchema(product, rates), buildBreadcrumbSchema(buildProductSchemaCrumbs(product))]}
      />

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-10">
        <ProductCrumbs crumbs={crumbs} />
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          <ProductGallery product={product} />
          <ProductInfo product={product} />
        </div>
        <ProductDescription description={product.description} />
        <ProductRecommendations product={product} />
      </div>
    </SiteLayout>
  );
}

function ProductCrumbs({ crumbs }: { crumbs: BreadcrumbEntry[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs font-bold uppercase tracking-wider">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <Fragment key={crumb.path}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="line-clamp-1">{crumb.name}</BreadcrumbPage>
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
