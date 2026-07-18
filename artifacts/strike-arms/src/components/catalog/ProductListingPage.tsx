import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'wouter';

import { SiteLayout } from '@/components/SiteLayout';
import { JsonLd } from '@/components/JsonLd';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useProducts } from '@/hooks/useProducts';
import { SITE_URL } from '@/lib/site-config';
import { buildBreadcrumbSchema } from '@/lib/structured-data';
import type { ProductFilters } from '@/types/product';

interface ProductListingPageProps {
  title: string;
  metaTitle: string;
  description: string;
  path: string;
  intro: string;
  filters: ProductFilters;
}

/** Simple filter-free product listing (New Arrivals, Sale, etc.). */
export function ProductListingPage(props: ProductListingPageProps) {
  const { title, metaTitle, description, path, intro, filters } = props;
  const [, setLocation] = useLocation();
  const { data, isLoading } = useProducts(filters);
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

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="mt-6 text-3xl md:text-4xl font-bold text-foreground">{title}</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed max-w-2xl">{intro}</p>

        <div className="mt-8">
          <ProductGrid
            products={items}
            isLoading={isLoading}
            onClearFilters={() => setLocation('/store')}
          />
        </div>
      </div>
    </SiteLayout>
  );
}
