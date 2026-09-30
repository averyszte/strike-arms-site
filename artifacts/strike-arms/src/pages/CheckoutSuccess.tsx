import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, Phone, Store } from 'lucide-react';

import { CreateAccountNudge } from '@/components/account/CreateAccountNudge';
import { SiteLayout } from '@/components/SiteLayout';
import { PageHero } from '@/components/PageHero';
import { useCheckoutConfirmation } from '@/hooks/use-checkout-confirmation';
import type { ConfirmationState } from '@/lib/checkout-confirmation';
import { BUSINESS, SITE_URL } from '@/lib/site-config';
import {
  CTA_ARROW,
  CTA_PRIMARY_SM,
  CTA_SECONDARY_SM,
  PAGE_WIDTHS,
  PANEL,
} from '@/lib/storefront-styles';

const TITLE = 'Your Order — Strike Arms Airsoft Dublin';

const HERO: Record<ConfirmationState, { eyebrow: string; title: string; intro: string }> = {
  confirming: {
    eyebrow: 'Checking payment',
    title: 'Confirming your payment',
    intro: 'This usually takes a few seconds. Please keep this page open.',
  },
  paid: {
    eyebrow: 'Order confirmed',
    title: 'Thanks — your order is in',
    intro: 'Payment went through. We are getting your order ready now.',
  },
  delayed: {
    eyebrow: 'Still checking',
    title: 'We have not heard back yet',
    intro:
      'Your payment may still be going through. Please do not pay again — contact us and we will check it for you.',
  },
  unconfirmed: {
    eyebrow: 'Not confirmed',
    title: 'We could not confirm a payment',
    intro:
      'This checkout did not complete, or the link is out of date. Your basket is still saved. If money has left your account, contact us before trying again.',
  },
};

function StatusLine({ state, orderNumber }: { state: ConfirmationState; orderNumber: string | null }) {
  if (state === 'confirming') {
    return (
      <p className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" aria-hidden="true" />
        Waiting for the payment to be confirmed.
      </p>
    );
  }
  if (state === 'paid') {
    return (
      <p className="flex items-start gap-3 text-sm text-foreground">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
        <span>
          Your order number is <strong className="tabular-nums">{orderNumber ?? 'on its way'}</strong>.
          Keep it handy if you contact us about this order.
        </span>
      </p>
    );
  }
  return (
    <p className="flex items-start gap-3 text-sm text-muted-foreground">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      <span>
        Call us on{' '}
        <a href={`tel:${BUSINESS.telephone.replace(/\s/g, '')}`} className="underline">
          {BUSINESS.telephone}
        </a>{' '}
        or use the contact page, and we will look it up.
      </span>
    </p>
  );
}

/**
 * Where Stripe returns a shopper after paying.
 *
 * The browser usually lands before the Stripe webhook has confirmed the
 * payment, so the page asks checkout-status until it has an answer rather
 * than claiming success on arrival. The cart is cleared only once the
 * payment is confirmed: someone whose payment failed keeps their basket.
 */
export default function CheckoutSuccess() {
  const { state, orderNumber } = useCheckoutConfirmation();
  const hero = HERO[state];

  return (
    <SiteLayout>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={`${SITE_URL}/checkout/success`} />
      </Helmet>

      <PageHero
        crumbs={[{ label: hero.eyebrow }]}
        eyebrow={hero.eyebrow}
        title={hero.title}
        intro={hero.intro}
        width="narrow"
        isCompact
      />

      <div className={`mx-auto px-4 md:px-6 py-12 md:py-16 ${PAGE_WIDTHS.narrow}`}>
        <div className={`${PANEL} space-y-4 p-6`} aria-live="polite">
          <StatusLine state={state} orderNumber={orderNumber} />

          {state === 'paid' && (
            <p className="flex items-start gap-3 text-sm text-muted-foreground">
              <Store className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              Anything marked collect-in-store will be held for you at our shop in{' '}
              {BUSINESS.addressLocality}. Bring photo ID showing you are 18 or over.
            </p>
          )}

          {state === 'delayed' && (
            <p className="flex items-start gap-3 text-sm text-muted-foreground">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              You can also refresh this page in a few minutes to check again.
            </p>
          )}
        </div>

        {state === 'paid' && <CreateAccountNudge />}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={state === 'unconfirmed' ? '/cart' : '/store'} className={CTA_PRIMARY_SM}>
            {state === 'unconfirmed' ? 'Back to basket' : 'Keep shopping'}
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
