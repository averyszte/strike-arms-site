import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearch } from 'wouter';
import { AlertTriangle } from 'lucide-react';

import { SiteLayout } from '@/components/SiteLayout';
import { PageHero } from '@/components/PageHero';
import { OrderLookupForm } from '@/components/order-lookup/OrderLookupForm';
import { LookedUpOrderCard } from '@/components/order-lookup/LookedUpOrderCard';
import { useOrderLookup } from '@/hooks/use-order-lookup';
import { orderNumberFromSearch } from '@/lib/order-timeline';
import { SITE_URL } from '@/lib/site-config';
import { PAGE_WIDTHS, PANEL, TEXT_LINK } from '@/lib/storefront-styles';
import type { OrderLookupResult } from '@/types/order-lookup';

/**
 * Guest order lookup: the order number and the email used at checkout are
 * enough to see where an order is. Status emails link here with ?order= so
 * the number is filled in; the email never goes in the link.
 */
export default function Account() {
  const lookup = useOrderLookup();
  const initialOrderNumber = orderNumberFromSearch(useSearch());

  return (
    <SiteLayout>
      <Helmet>
        <title>Track your order | Strike Arms Airsoft Dublin</title>
        <meta name="robots" content="noindex,follow" />
        <link rel="canonical" href={`${SITE_URL}/account`} />
      </Helmet>
      <PageHero
        crumbs={[{ label: 'Track your order' }]}
        eyebrow="Your order"
        title="Track your order"
        intro="No account needed. Enter your order number and the email you used at checkout."
        width="narrow"
        isCompact
      />

      <div className={`mx-auto px-4 md:px-6 py-12 md:py-16 ${PAGE_WIDTHS.narrow}`}>
        <div className="space-y-6">
          <OrderLookupForm
            isPending={lookup.isPending}
            initialOrderNumber={initialOrderNumber}
            onSubmit={(input) => lookup.mutate(input)}
          />
          {lookup.isError && <LookupFailed />}
          {lookup.data && <LookupAnswer result={lookup.data} />}
        </div>
      </div>
    </SiteLayout>
  );
}

function LookupAnswer({ result }: { result: OrderLookupResult }) {
  if (result.found) return <LookedUpOrderCard order={result.order} />;
  return (
    <Notice>
      We could not find an order with that number and email. Check both against your confirmation
      email, or{' '}
      <Link href="/contact" className={TEXT_LINK}>
        contact the shop
      </Link>
      .
    </Notice>
  );
}

function LookupFailed() {
  return (
    <Notice>
      Something went wrong looking up your order. Check your connection and try again.
    </Notice>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className={`${PANEL} flex gap-3 p-4 text-sm text-muted-foreground`}>
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}
