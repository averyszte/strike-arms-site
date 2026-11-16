import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';

import { SiteLayout } from '@/components/SiteLayout';
import { JsonLd } from '@/components/JsonLd';
import { PageHero } from '@/components/PageHero';
import { Skeleton } from '@/components/ui/skeleton';
import { useBrands } from '@/hooks/use-brands';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/site-config';
import { CARD_TITLE } from '@/lib/storefront-styles';
import { buildItemListSchema, buildBreadcrumbSchema } from '@/lib/structured-data';

// Brand-neutral on purpose: naming brands here went stale and listed ones
// with no stock (N-106). The live list below is the source of truth.
const TITLE = 'Airsoft Brands in Ireland | Strike Arms';
const DESCRIPTION =
  'Browse the airsoft brands we stock at Strike Arms in Swords, Co. Dublin: guns, gear and consumables, with genuine stock and in-house advice and support.';

export default function Brands() {
  const { data: brands, isLoading } = useBrands();
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Brands', path: '/brands' },
  ];
  const schema = [buildBreadcrumbSchema(crumbs)];
  if (brands && brands.length > 0) {
    schema.push(
      buildItemListSchema(brands.map((b) => ({ name: b.name, path: `/brands/${b.slug}` }))),
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
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      </Helmet>
      <JsonLd data={schema} />

      <PageHero
        crumbs={[{ label: 'Brands' }]}
        eyebrow="Genuine stock"
        title="Airsoft Brands"
        intro="We stock the airsoft brands that earn their place on the field and the bench, from beginner-friendly AEGs to premium platforms and reliable consumables. Browse a brand to see what we carry, with in-house advice and support behind every purchase."
      />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(brands ?? []).map((brand) => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="group flex flex-col items-center justify-center border border-border/60 bg-card p-6 text-center transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className={`${CARD_TITLE} group-hover:text-accent`}>{brand.name}</span>
                <span className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
