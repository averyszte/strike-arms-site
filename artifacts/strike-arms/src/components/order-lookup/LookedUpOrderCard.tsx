import { Link } from 'wouter';
import { ExternalLink } from 'lucide-react';

import { OrderTimeline } from '@/components/order-lookup/OrderTimeline';

import { formatPrice } from '@/lib/format-price';
import { formatOrderDate, hasPartialRefund, orderProgress } from '@/lib/order-lookup-display';
import { orderTimeline } from '@/lib/order-timeline';
import { anPostTrackingUrl } from '@/lib/tracking-number';
import { CARD_TITLE, EYEBROW, PANEL, TEXT_LINK } from '@/lib/storefront-styles';
import type { LookedUpOrder, LookedUpOrderItem } from '@/types/order-lookup';

export function LookedUpOrderCard({ order }: { order: LookedUpOrder }) {
  const progress = orderProgress(order);
  const placed = formatOrderDate(order.placedAt);
  const steps = orderTimeline(order);

  return (
    <section className={`${PANEL} p-6`} aria-live="polite">
      <p className={EYEBROW}>Order {order.orderNumber}</p>
      <h2 className={`${CARD_TITLE} mt-2 text-2xl`}>{progress.label}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{progress.detail}</p>
      {placed && <p className="mt-1 text-xs text-muted-foreground">Placed on {placed}</p>}

      {steps && (
        <div className="mt-6">
          <OrderTimeline steps={steps} />
        </div>
      )}
      {order.trackingNumber && <PostTrackingLink trackingNumber={order.trackingNumber} />}

      <ul className="mt-6 divide-y divide-border/60 border-y border-border/60">
        {order.items.map((item) => (
          <OrderItemRow key={`${item.slug}-${item.fulfillmentMethod}`} item={item} />
        ))}
      </ul>

      <dl className="mt-4 space-y-1 text-sm">
        {order.shippingCents > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <dt>Postage</dt>
            <dd>{formatPrice(order.shippingCents)}</dd>
          </div>
        )}
        <div className="flex justify-between font-bold text-foreground">
          <dt>Total</dt>
          <dd>{formatPrice(order.totalCents)}</dd>
        </div>
        {hasPartialRefund(order) && (
          <div className="flex justify-between text-muted-foreground">
            <dt>Refunded</dt>
            <dd>{formatPrice(order.refundCents)}</dd>
          </div>
        )}
      </dl>

      <p className="mt-6 text-sm text-muted-foreground">
        Something not right?{' '}
        <Link href="/contact" className={TEXT_LINK}>
          Contact the shop
        </Link>{' '}
        with your order number.
      </p>
    </section>
  );
}

function OrderItemRow({ item }: { item: LookedUpOrderItem }) {
  return (
    <li className="flex items-start justify-between gap-4 py-3 text-sm">
      <div className="min-w-0">
        <Link href={`/products/${item.slug}`} className="font-bold text-foreground hover:text-accent">
          {item.name}
        </Link>
        <p className="text-xs text-muted-foreground">
          {item.brand} · Qty {item.quantity} ·{' '}
          {item.fulfillmentMethod === 'pickup' ? 'Collect in shop' : 'Posted'}
        </p>
      </div>
      <span className="shrink-0 text-foreground">{formatPrice(item.subtotalCents)}</span>
    </li>
  );
}

function PostTrackingLink({ trackingNumber }: { trackingNumber: string }) {
  return (
    <p className="mt-6 text-sm text-muted-foreground">
      An Post tracking number {trackingNumber}.{' '}
      <a
        href={anPostTrackingUrl(trackingNumber)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${TEXT_LINK} inline-flex items-center gap-1`}
      >
        Track with An Post
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </p>
  );
}
