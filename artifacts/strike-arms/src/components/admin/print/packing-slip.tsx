import { countUnits, groupItemsForPicking } from '@/lib/order-document';
import { FULFILLMENT_METHOD_LABELS } from '@/lib/order-display';
import type { Order } from '@/types/order';

interface Props {
  order: Order;
}

/**
 * What is in the box. Deliberately carries no prices: a packing slip is a
 * picking aid that travels with the goods, and a wrong figure printed beside
 * the goods is an argument at the counter.
 */
export function PackingSlip({ order }: Props) {
  const groups = groupItemsForPicking(order);
  const address = order.shippingAddress;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-widest">Deliver to</h2>
          {address ? (
            <p className="mt-1 text-sm leading-relaxed">
              {address.name}
              <br />
              {address.line1}
              {address.line2 && (
                <>
                  <br />
                  {address.line2}
                </>
              )}
              <br />
              {address.city}
              {address.county && `, ${address.county}`}
              <br />
              {address.eircode}
            </p>
          ) : (
            <p className="mt-1 text-sm">
              {order.customerName}
              <br />
              <span className="font-semibold">Collection — no address on this order</span>
            </p>
          )}
        </div>
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-widest">Order</h2>
          <p className="mt-1 text-sm leading-relaxed">
            {FULFILLMENT_METHOD_LABELS[order.fulfillmentMethod]}
            <br />
            {countUnits(order.items ?? [])} item(s) total
            {order.ageVerified && (
              <>
                <br />
                <span className="font-semibold">Age verified</span>
              </>
            )}
          </p>
        </div>
      </section>

      {groups.map((group) => (
        <section key={group.heading || 'items'}>
          {group.heading && (
            <h2 className="mb-1 text-[10px] font-bold uppercase tracking-widest">
              {group.heading}
            </h2>
          )}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black text-left text-[10px] uppercase tracking-widest">
                <th className="w-12 pb-1 font-bold">Qty</th>
                <th className="pb-1 font-bold">Item</th>
                <th className="w-24 pb-1 text-right font-bold">Picked</th>
              </tr>
            </thead>
            <tbody>
              {group.items.map((item) => (
                <tr key={item.id} className="border-b border-neutral-300 align-top">
                  <td className="py-2 tabular-nums">{item.quantity}</td>
                  <td className="py-2">
                    {item.productName}
                    <span className="block text-xs text-neutral-600">{item.brand}</span>
                  </td>
                  {/* An empty box beats a tick nobody made: it is what turns
                      the slip into a check rather than a printout. */}
                  <td className="py-2 text-right">
                    <span className="inline-block h-4 w-4 border border-black" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {order.notes && (
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest">Notes</h2>
          <p className="mt-1 text-sm">{order.notes}</p>
        </section>
      )}
    </div>
  );
}
