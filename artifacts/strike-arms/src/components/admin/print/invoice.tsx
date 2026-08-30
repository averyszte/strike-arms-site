import { format } from 'date-fns';
import { formatPrice } from '@/lib/format-price';
import { PAYMENT_METHOD_LABELS } from '@/lib/order-display';
import type { Order } from '@/types/order';

interface Props {
  order: Order;
}

/**
 * The customer's copy, with the money on it.
 *
 * Note for launch: a compliant Irish VAT invoice must also carry the seller's
 * VAT registration number, which the site does not hold. Alan has to supply it
 * before these go out as VAT invoices rather than receipts. It is not stubbed
 * here on purpose -- a made-up VAT number on a printed invoice is worse than a
 * missing one.
 */
export function Invoice({ order }: Props) {
  const goodsCents = (order.items ?? []).reduce((sum, item) => sum + item.subtotalCents, 0);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-widest">Billed to</h2>
          <p className="mt-1 text-sm leading-relaxed">
            {order.customerName}
            {order.customerEmail && (
              <>
                <br />
                {order.customerEmail}
              </>
            )}
            {order.customerPhone && (
              <>
                <br />
                {order.customerPhone}
              </>
            )}
          </p>
        </div>
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-widest">Payment</h2>
          <p className="mt-1 text-sm leading-relaxed">
            {PAYMENT_METHOD_LABELS[order.paymentMethod]}
            <br />
            <span className="capitalize">{order.paymentStatus.replace(/_/g, ' ')}</span>
            {order.paidAt && (
              <>
                <br />
                {format(new Date(order.paidAt), 'dd MMM yyyy')}
              </>
            )}
          </p>
        </div>
      </section>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black text-left text-[10px] uppercase tracking-widest">
            <th className="pb-1 font-bold">Item</th>
            <th className="w-12 pb-1 text-right font-bold">Qty</th>
            <th className="w-24 pb-1 text-right font-bold">Unit</th>
            <th className="w-24 pb-1 text-right font-bold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {(order.items ?? []).map((item) => (
            <tr key={item.id} className="border-b border-neutral-300 align-top">
              <td className="py-2">
                {item.productName}
                <span className="block text-xs text-neutral-600">{item.brand}</span>
              </td>
              <td className="py-2 text-right tabular-nums">{item.quantity}</td>
              <td className="py-2 text-right tabular-nums">{formatPrice(item.unitPriceCents)}</td>
              <td className="py-2 text-right tabular-nums">{formatPrice(item.subtotalCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="ml-auto w-64 space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Goods</span>
          <span className="tabular-nums">{formatPrice(goodsCents)}</span>
        </div>
        {order.shippingCents > 0 && (
          <div className="flex justify-between">
            <span>Delivery</span>
            <span className="tabular-nums">{formatPrice(order.shippingCents)}</span>
          </div>
        )}
        {/* VAT is included in the totals above, not added to them -- prices on
            the site are gross. Printing it as an extra line would overstate
            the bill by the VAT amount. */}
        <div className="flex justify-between text-neutral-600">
          <span>of which VAT</span>
          <span className="tabular-nums">{formatPrice(order.vatCents)}</span>
        </div>
        {order.refundCents > 0 && (
          <div className="flex justify-between">
            <span>Refunded</span>
            <span className="tabular-nums">-{formatPrice(order.refundCents)}</span>
          </div>
        )}
        <div className="flex justify-between border-t-2 border-black pt-1 text-base font-bold">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(order.totalCents - order.refundCents)}</span>
        </div>
      </section>

      {order.notes && (
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest">Notes</h2>
          <p className="mt-1 text-sm">{order.notes}</p>
        </section>
      )}
    </div>
  );
}
