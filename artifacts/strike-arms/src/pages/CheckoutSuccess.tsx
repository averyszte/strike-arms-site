import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { ArrowRight, Mail, Store } from 'lucide-react';

import { SiteLayout } from '@/components/SiteLayout';
import { PageHero } from '@/components/PageHero';
import { useCart } from '@/hooks/use-cart';
import { BUSINESS, SITE_URL } from '@/lib/site-config';
import {
  CTA_ARROW,
  CTA_PRIMARY_SM,
  CTA_SECONDARY_SM,
  PAGE_WIDTHS,
  PANEL,
} from '@/lib/storefront-styles';

const TITLE = 'Order Confirmed — Strike Arms Airsoft Dublin';

/**
 * Where Stripe returns a shopper after a successful payment.
 *
 * The order is deliberately not read back here. Orders are not publicly
 * readable, and the payment is confirmed by the Stripe webhook, which may
 * land a moment after the browser does — so a page that fetched status could
 * honestly show "not paid" to someone who has just paid.
 */
export default function CheckoutSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <SiteLayout>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={`${SITE_URL}/checkout/success`} />
      </Helmet>

      <PageHero
        crumbs={[{ label: 'Order confirmed' }]}
        eyebrow="Order confirmed"
        title="Thanks — your order is in"
        intro="Payment went through. We are getting your order ready now."
        width="narrow"
        isCompact
      />

      <div className={`mx-auto px-4 md:px-6 py-12 md:py-16 ${PAGE_WIDTHS.narrow}`}>
        <div className={`${PANEL} space-y-4 p-6`}>
          <p className="flex items-start gap-3 text-sm text-muted-foreground">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            A confirmation with your order number is on its way to your inbox. Check your spam
            folder if it has not arrived within a few minutes.
          </p>

          <p className="flex items-start gap-3 text-sm text-muted-foreground">
            <Store className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            Anything marked collect-in-store will be held for you at our shop in{' '}
            {BUSINESS.addressLocality}. We will email you as soon as it is ready to pick up. Bring
            photo ID showing you are 18 or over.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/store" className={CTA_PRIMARY_SM}>
            Keep shopping
            <ArrowRight className={CTA_ARROW} aria-hidden="true" />
          </Link>
          <Link href="/contact" className={CTA_SECONDARY_SM}>
            Contact the shop
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
