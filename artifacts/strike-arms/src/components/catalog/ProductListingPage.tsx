import { Helmet } from 'react-helmet-async';
import { useLocation } from 'wouter';

import { SiteLayout } from '@/components/SiteLayout';
import { JsonLd } from '@/components/JsonLd';
import { PageHero } from '@/components/PageHero';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { SITE_URL } from '@/lib/site-config';
import { buildBreadcrumbSchema } from '@/lib/structured-data';
import type { ProductFilters } from '@/types/product';

interface ProductListingPageProps {
  title: string;
  /** Accent label above the title. */
  eyebrow?: string;
  metaTitle: string;
  description: string;
  path: string;
  intro: string;
  filters: ProductFilters;
}

/** Simple filter-free product listing (New Arrivals, Sale, etc.). */
export function ProductListingPage(props: ProductListingPageProps) {
  const { title, eyebrow = 'Shop the range', metaTitle, description, path, intro, filters } = props;
  const [, setLocation] = useLocation();
  const { data, isLoading, isError, isFetching, refetch } = useProducts(filters);
  const items = data?.items ?? [];
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: title, path },
  ];

  return (
    <SiteLayout>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${SITE_URL}${path}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}${path}`} />
      </Helmet>
      <JsonLd data={buildBreadcrumbSchema(crumbs)} />

      <PageHero
        width="wide"
        crumbs={[{ label: title }]}
        eyebrow={eyebrow}
        title={title}
        intro={intro}
      />

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8 md:py-10">
        <div>
          <ProductGrid
            products={items}
            isLoading={isLoading}
            isError={isError}
            isRetrying={isFetching}
            onRetry={() => void refetch()}
            onClearFilters={() => setLocation('/store')}
          />
        </div>
      </div>
    </SiteLayout>
  );
}
