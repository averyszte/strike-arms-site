import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { CheckCircle2, Mail, Store } from 'lucide-react';

import { SiteLayout } from '@/components/SiteLayout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { BUSINESS, SITE_URL } from '@/lib/site-config';

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

      <div className="mx-auto max-w-[640px] px-4 py-16 text-center md:px-6">
        <CheckCircle2 className="mx-auto h-12 w-12 text-accent" aria-hidden="true" />

        <h1 className="mt-6 text-3xl font-bold text-foreground">Thanks — your order is in</h1>

        <p className="mt-4 text-muted-foreground leading-relaxed">
          Payment went through. We are getting your order ready now.
        </p>

        <div className="mt-8 space-y-4 rounded-lg border border-border bg-card p-6 text-left">
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

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/store">Keep shopping</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Contact the shop</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
