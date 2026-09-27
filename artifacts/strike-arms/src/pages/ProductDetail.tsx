import { Fragment } from 'react';
import { useParams, Link } from 'wouter';
import { Helmet } from 'react-helmet-async';

import { SiteLayout } from '@/components/SiteLayout';
import { JsonLd } from '@/components/JsonLd';
import { ProductRecommendations } from '@/components/catalog/ProductRecommendations';
import { ProductGallery } from '@/components/catalog/ProductGallery';
import { ProductInfo } from '@/components/catalog/ProductInfo';
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
import { getCategory, getSubcategory } from '@/lib/taxonomy';
import { SITE_URL, toAbsoluteUrl } from '@/lib/site-config';
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
        <ProductRecommendations product={product} />
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
