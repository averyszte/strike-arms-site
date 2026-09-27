import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

import { SiteLayout } from '@/components/SiteLayout';
import { PageHero } from '@/components/PageHero';
import { CTA_ARROW, CTA_PRIMARY, CTA_SECONDARY } from '@/lib/storefront-styles';

/**
 * The storefront 404. Also rendered by ShopPage and BrandPage for a slug that
 * matches nothing, so it takes no props.
 */
export default function NotFound() {
  return (
    <SiteLayout>
      <Helmet>
        <title>Page not found | Strike Arms</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <PageHero
        eyebrow="Error 404"
        title="Page not found"
        intro="That page has moved or never existed."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/store" className={CTA_PRIMARY}>
            Browse the shop
            <ArrowRight className={CTA_ARROW} aria-hidden="true" />
          </Link>
          <Link href="/contact" className={CTA_SECONDARY}>
            Contact the shop
          </Link>
        </div>
      </PageHero>
    </SiteLayout>
  );
}
