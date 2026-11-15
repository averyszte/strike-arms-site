import { OrderFulfilmentSelect } from '@/components/admin/OrderFulfilmentSelect';
import { Badge } from '@/components/ui/badge';
import { useFulfilmentChange } from '@/hooks/use-fulfilment-change';
import type { Order } from '@/types/order';

/** The order's payment status, and the fulfilment select that moves it along. */
export function OrderStatusSection({ order }: { order: Order }) {
  const { change } = useFulfilmentChange();

  return (
    <section className="flex items-center gap-5 flex-wrap">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
          Payment
        </p>
        <Badge
          variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}
          className="capitalize"
        >
          {order.paymentStatus.replace(/_/g, ' ')}
        </Badge>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
          Fulfillment
        </p>
        <OrderFulfilmentSelect
          order={order}
          onChange={(status, isIdChecked) => change(order, status, isIdChecked)}
        />
      </div>
    </section>
  );
}
