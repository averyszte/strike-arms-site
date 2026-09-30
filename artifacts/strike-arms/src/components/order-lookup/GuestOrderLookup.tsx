import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { AlertTriangle } from 'lucide-react';

import { LookedUpOrderCard } from '@/components/order-lookup/LookedUpOrderCard';
import { OrderLookupForm } from '@/components/order-lookup/OrderLookupForm';
import { useOrderLookup } from '@/hooks/use-order-lookup';
import { PANEL, TEXT_LINK } from '@/lib/storefront-styles';
import type { OrderLookupResult } from '@/types/order-lookup';

/**
 * Guest order lookup: the order number and the email used at checkout are
 * enough to see where an order is. Status emails link to /account with
 * ?order= so the number is filled in; the email never goes in the link.
 */
export function GuestOrderLookup({ initialOrderNumber }: { initialOrderNumber: string }) {
  const lookup = useOrderLookup();

  return (
    <>
      <OrderLookupForm
        isPending={lookup.isPending}
        initialOrderNumber={initialOrderNumber}
        onSubmit={(input) => lookup.mutate(input)}
      />
      {lookup.isError && (
        <Notice>Something went wrong looking up your order. Check your connection and try again.</Notice>
      )}
      {lookup.data && <LookupAnswer result={lookup.data} />}
    </>
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

function Notice({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className={`${PANEL} flex gap-3 p-4 text-sm text-muted-foreground`}>
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}
