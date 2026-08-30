import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useParams } from 'wouter';

import { SiteLayout } from '@/components/SiteLayout';
import { JsonLd } from '@/components/JsonLd';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Pagination } from '@/components/catalog/Pagination';
import { BrandPageHeader } from '@/components/catalog/BrandPageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useBrandCategories, useBrands, useProducts } from '@/hooks/useProducts';
import { brandCategoryLinks, brandPageMeta } from '@/lib/brand-page-meta';
import { SITE_URL } from '@/lib/site-config';
import { buildBreadcrumbSchema, buildItemListSchema } from '@/lib/structured-data';
import NotFound from '@/pages/not-found';

/**
 * One page per brand.
 *
 * The hub used to send people to `/store?brand=specna-arms`, which is a filter
 * state rather than a page: nothing to link to, nothing for a search engine to
 * rank, and a URL that reads as an accident. This is the page those links now
 * point at.
 *
 * A brand exists here only if it has published products. A slug nobody stocks
 * is a 404 rather than an empty page, so a typo in a link cannot end up in the
 * index as a real, permanently empty brand.
 */

const PAGE_SIZE = 24;

export default function BrandPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: brands, isLoading: brandsLoading } = useBrands();

  if (brandsLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-4 h-5 w-full max-w-xl" />
        </div>
      </SiteLayout>
    );
  }

  const brand = brands?.find((entry) => entry.slug === slug);
  if (!brand) return <NotFound />;

  return <BrandPageInner slug={brand.slug} name={brand.name} count={brand.count} />;
}

function BrandPageInner({ slug, name, count }: { slug: string; name: string; count: number }) {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useProducts({
    brand: slug,
    sort: 'featured',
    page,
    pageSize: PAGE_SIZE,
  });
  const { data: categories } = useBrandCategories(slug);

  const items = data?.items ?? [];
  const total = data?.total ?? count;
  const meta = brandPageMeta(name, count);
  const path = `/brands/${slug}`;

  const schema = [
    buildBreadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Brands', path: '/brands' },
      { name, path },
    ]),
  ];
  if (items.length > 0) {
    schema.push(
      buildItemListSchema(
        items.map((item) => ({ name: item.name, path: `/products/${item.slug}` })),
      ),
    );
  }

  return (
    <SiteLayout>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={`${SITE_URL}${path}`} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}${path}`} />
      </Helmet>
      <JsonLd data={schema} />

      <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">
        <BrandPageHeader
          name={name}
          intro={meta.intro}
          links={brandCategoryLinks(slug, categories ?? [])}
        />

        <div className="mt-8">
          <ProductGrid
            products={items}
            isLoading={isLoading}
            onClearFilters={() => setLocation('/brands')}
          />
          {!isLoading && total > 0 && (
            <Pagination
              showing={items.length}
              total={total}
              onLoadMore={() => setPage((current) => current + 1)}
            />
          )}
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          Looking for something specific?{' '}
          <Link href={`/store?brand=${slug}`} className="underline hover:text-foreground">
            Filter the {name} range by price, stock and category
          </Link>
          .
        </p>
      </div>
    </SiteLayout>
  );
}
