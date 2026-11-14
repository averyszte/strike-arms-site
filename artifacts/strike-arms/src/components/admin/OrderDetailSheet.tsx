import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { AdminLoadError } from '@/components/admin/AdminLoadError';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useOrder } from '@/hooks/use-order';
import { OrderArchiveSection } from '@/components/admin/order-archive-section';
import { OrderAttentionNotice } from '@/components/admin/OrderAttentionNotice';
import { OrderCustomerSection } from '@/components/admin/order-customer-section';
import { OrderEmailsSection } from '@/components/admin/OrderEmailsSection';
import { OrderDeliveryDetails } from '@/components/admin/OrderDeliveryDetails';
import { OrderLinesSummary } from '@/components/admin/OrderLinesSummary';
import { OrderRefundSection } from '@/components/admin/OrderRefundSection';
import { OrderManualActionsSection } from '@/components/admin/OrderManualActionsSection';
import { OrderStatusSection } from '@/components/admin/order-status-section';
import { OrderTrackingNumberField } from '@/components/admin/OrderTrackingNumberField';
import { PrintActions } from '@/components/admin/print/print-actions';
import { formatOrderNumber } from '@/lib/order-display';

/**
 * Everything the sheet shows instead of an order: loading, a failed read, or
 * an order that has gone. A failed read is not "no longer exists" -- it says
 * nothing about whether the order is there.
 */
function OrderSheetStatus({ query, hasId }: { query: ReturnType<typeof useOrder>; hasId: boolean }) {
  if (query.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="mt-4">
        <AdminLoadError
          what="this order"
          error={query.error}
          isRetrying={query.isFetching}
          onRetry={() => void query.refetch()}
        />
      </div>
    );
  }
  if (hasId && !query.data) {
    return <p className="mt-4 text-sm text-muted-foreground">That order no longer exists.</p>;
  }
  return null;
}

interface Props {
  orderId: string | null;
  onClose: () => void;
}

export function OrderDetailSheet({ orderId, onClose }: Props) {
  const orderQuery = useOrder(orderId);
  const { data: order, isLoading } = orderQuery;

  return (
    <Sheet open={!!orderId} onOpenChange={open => { if (!open) onClose(); }}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle>
            {order ? `Order ${formatOrderNumber(order.orderNumber)}` : 'Order Details'}
          </SheetTitle>
          <SheetDescription>
            {order ? format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm') : ''}
          </SheetDescription>
          {order?.isArchived && (
            <Badge variant="outline" className="w-fit text-[10px]">
              Archived
            </Badge>
          )}
        </SheetHeader>

        <OrderSheetStatus query={orderQuery} hasId={orderId !== null} />

        {!isLoading && order && (
          <div className="space-y-6">
            <OrderAttentionNotice order={order} />

            <OrderCustomerSection order={order} />

            <OrderDeliveryDetails order={order} />

            <OrderStatusSection order={order} />

            {order.fulfillmentMethod !== 'pickup' && (
              <OrderTrackingNumberField key={`${order.id}-${order.trackingNumber ?? ''}`} order={order} />
            )}

            <OrderLinesSummary order={order} />

            <OrderRefundSection order={order} />
            <OrderManualActionsSection order={order} />

            <OrderEmailsSection orderId={order.id} />

            <section className="border-t border-border pt-4">
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Print
              </h3>
              <PrintActions orderId={order.id} />
            </section>

            <OrderArchiveSection order={order} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
