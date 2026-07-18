import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';

import { SiteLayout } from '@/components/SiteLayout';
import { JsonLd } from '@/components/JsonLd';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useBrands } from '@/hooks/useProducts';
import { SITE_URL } from '@/lib/site-config';
import { buildItemListSchema, buildBreadcrumbSchema } from '@/lib/structured-data';

const TITLE = 'Airsoft Brands in Ireland — G&G, Specna, Tokyo Marui & More | Strike Arms';
const DESCRIPTION =
  'The airsoft brands we stock at Strike Arms Dublin: G&G, Specna Arms, Tokyo Marui, Krytac, ICS, ASG, WE, Nuprol and more. Genuine stock, shipped across Ireland.';

export default function Brands() {
  const { data: brands, isLoading } = useBrands();
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Brands', path: '/brands' },
  ];
  const schema = [buildBreadcrumbSchema(crumbs)];
  if (brands && brands.length > 0) {
    schema.push(
      buildItemListSchema(brands.map((b) => ({ name: b.name, path: `/store?brand=${b.slug}` }))),
    );
  }

  return (
    <SiteLayout>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/brands`} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/brands`} />
      </Helmet>
      <JsonLd data={schema} />

      <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Brands</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="mt-6 text-3xl md:text-4xl font-bold text-foreground">Airsoft Brands</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed max-w-2xl">
          We stock the airsoft brands that earn their place on the field and the bench, from
          beginner-friendly AEGs to premium platforms and reliable consumables. Browse a brand to see
          what we carry, all shipped across Ireland with in-house advice and support.
        </p>

        {isLoading ? (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(brands ?? []).map((brand) => (
              <Link
                key={brand.slug}
                href={`/store?brand=${brand.slug}`}
                className="flex flex-col items-center justify-center rounded-sm border border-border bg-card p-5 text-center transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="font-semibold text-foreground">{brand.name}</span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {brand.count} {brand.count === 1 ? 'product' : 'products'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
