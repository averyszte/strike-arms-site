import { ContactLinks } from '@/components/admin/contact-links';
import { ageCheckLines } from '@/lib/order-age-check';
import { ORDER_CHANNEL_LABELS, PAYMENT_METHOD_LABELS, formatOrderNumber } from '@/lib/order-display';
import type { Order } from '@/types/order';

/** Who the order is for, how to reach them, and how it came in and was paid. */
export function OrderCustomerSection({ order }: { order: Order }) {
  return (
    <section>
      <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        Customer
      </h3>
      <p className="text-sm font-medium text-foreground">{order.customerName}</p>
      {/* Null on a counter sale where nobody gave one. Saying so beats
          an empty line that reads as a rendering fault. */}
      <ContactLinks
        email={order.customerEmail}
        phone={order.customerPhone}
        subject={`Strike Arms order ${formatOrderNumber(order.orderNumber)}`}
        emptyEmailLabel="No email given"
      />
      <p className="mt-1 text-xs text-muted-foreground">
        {ORDER_CHANNEL_LABELS[order.channel]} · {PAYMENT_METHOD_LABELS[order.paymentMethod]}
      </p>
      {/* What the age check really was: a tick, an in-person check, or photo ID (N-084). */}
      {ageCheckLines(order).map((line) => (
        <p key={line} className="mt-1 text-xs text-muted-foreground">
          {line}
        </p>
      ))}
    </section>
  );
}
