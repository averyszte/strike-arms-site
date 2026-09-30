import { Link } from 'wouter';
import { Loader2, Package } from 'lucide-react';

import { LookedUpOrderCard } from '@/components/order-lookup/LookedUpOrderCard';
import { useMyOrders } from '@/hooks/use-my-orders';
import { loadErrorMessage } from '@/lib/load-error-message';
import { CARD_TITLE, PANEL, TEXT_LINK } from '@/lib/storefront-styles';

/** Every order on the account, newest first, each with its tracker. */
export function MyOrders({ userId }: { userId: string }) {
  const orders = useMyOrders(userId);

  if (orders.isPending) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />
        Loading your orders
      </p>
    );
  }

  if (orders.isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Your orders did not load. {loadErrorMessage(orders.error)}
      </p>
    );
  }

  if (orders.data.length === 0) {
    return (
      <section className={`${PANEL} flex gap-3 p-6`}>
        <Package className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
        <div>
          <h2 className={`${CARD_TITLE} text-lg`}>No orders yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Orders you place while signed in show up here, and so do earlier orders placed with
            this email.{' '}
            <Link href="/store" className={TEXT_LINK}>
              Go to the shop
            </Link>
            .
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {orders.data.map((order) => (
        <LookedUpOrderCard key={order.orderNumber} order={order} />
      ))}
    </div>
  );
}
