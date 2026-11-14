import { OrderFulfilmentSelect } from '@/components/admin/OrderFulfilmentSelect';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUpdateFulfillmentStatus } from '@/hooks/use-update-fulfillment-status';
import { loadErrorMessage } from '@/lib/load-error-message';
import type { FulfillmentStatus, Order } from '@/types/order';

/** The order's payment status, and the fulfilment select that moves it along. */
export function OrderStatusSection({ order }: { order: Order }) {
  const updateFulfillment = useUpdateFulfillmentStatus();
  const { toast } = useToast();

  async function handleFulfillmentChange(status: FulfillmentStatus) {
    try {
      await updateFulfillment.mutateAsync({ orderId: order.id, status });
    } catch (error) {
      toast({
        title: 'Status not changed',
        description: loadErrorMessage(error),
        variant: 'destructive',
      });
    }
  }

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
          onChange={status => void handleFulfillmentChange(status)}
        />
      </div>
    </section>
  );
}
