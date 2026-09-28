import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { AdminLoadError } from '@/components/admin/AdminLoadError';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Archive, ArchiveRestore } from 'lucide-react';
import { useOrder, useSetOrderArchived, useUpdateFulfillmentStatus } from '@/hooks/use-orders';
import { useToast } from '@/hooks/use-toast';
import { ContactLinks } from '@/components/admin/contact-links';
import { OrderAttentionNotice } from '@/components/admin/OrderAttentionNotice';
import { OrderDeliveryDetails } from '@/components/admin/OrderDeliveryDetails';
import { OrderFulfilmentSelect } from '@/components/admin/OrderFulfilmentSelect';
import { OrderRefundSection } from '@/components/admin/OrderRefundSection';
import { PrintActions } from '@/components/admin/print/print-actions';
import { loadErrorMessage } from '@/lib/load-error-message';
import {
  ORDER_CHANNEL_LABELS,
  PAYMENT_METHOD_LABELS,
  formatOrderNumber,
} from '@/lib/order-display';
import type { FulfillmentStatus } from '@/types/order';

function fmtEuros(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

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
  const updateFulfillment = useUpdateFulfillmentStatus();
  const setArchived = useSetOrderArchived();
  const { toast } = useToast();

  async function handleToggleArchive() {
    if (!order) return;
    const isArchived = !order.isArchived;
    try {
      await setArchived.mutateAsync({ orderId: order.id, isArchived });
    } catch {
      toast({
        title: 'Error',
        description: isArchived ? 'Failed to archive order' : 'Failed to restore order',
        variant: 'destructive',
      });
    }
  }

  async function handleFulfillmentChange(status: FulfillmentStatus) {
    if (!order) return;
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
            </section>

            <OrderDeliveryDetails order={order} />

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

            {(order.items?.length ?? 0) > 0 && (
              <section>
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Items
                </h3>
                <div className="space-y-2">
                  {order.items!.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {fmtEuros(item.unitPriceCents)} × {item.quantity}
                          {' · '}
                          {item.fulfillmentMethod === 'delivery' ? 'Post' : 'Collect'}
                        </p>
                      </div>
                      <p className="text-sm font-medium tabular-nums">
                        {fmtEuros(item.subtotalCents)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="border-t border-border pt-4 space-y-1.5">
              {order.shippingCents > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Delivery</span>
                  <span>{fmtEuros(order.shippingCents)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>VAT</span>
                <span>{fmtEuros(order.vatCents)}</span>
              </div>
              {order.refundCents > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Refunded</span>
                  <span>−{fmtEuros(order.refundCents)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold text-foreground">
                <span>Total</span>
                <span>{fmtEuros(order.totalCents)}</span>
              </div>
            </section>

            {order.notes && (
              <section>
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  Notes
                </h3>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </section>
            )}

            <OrderRefundSection order={order} />

            <section className="border-t border-border pt-4">
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Print
              </h3>
              <PrintActions orderId={order.id} />
            </section>

            <section className="border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={setArchived.isPending}
                onClick={() => void handleToggleArchive()}
              >
                {order.isArchived ? (
                  <ArchiveRestore className="mr-1.5 h-4 w-4" aria-hidden="true" />
                ) : (
                  <Archive className="mr-1.5 h-4 w-4" aria-hidden="true" />
                )}
                {order.isArchived ? 'Restore order' : 'Archive order'}
              </Button>
              {/* There is no delete. An order is the record of money changing
                  hands, and archiving is only the admin saying they are done
                  with it. */}
              <p className="mt-2 text-xs text-muted-foreground">
                {order.isArchived
                  ? 'Restoring puts it back in the working list.'
                  : 'Takes it out of the working list. It still counts towards revenue.'}
              </p>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
