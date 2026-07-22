import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useOrder, useUpdateFulfillmentStatus } from '@/hooks/use-orders';
import { useToast } from '@/hooks/use-toast';
import type { FulfillmentStatus } from '@/types/order';

const FULFILLMENT_OPTIONS: { value: FulfillmentStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'ready_for_pickup', label: 'Ready for Pickup' },
  { value: 'collected', label: 'Collected' },
  { value: 'cancelled', label: 'Cancelled' },
];

function fmtEuros(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

interface Props {
  orderId: string | null;
  onClose: () => void;
}

export function OrderDetailSheet({ orderId, onClose }: Props) {
  const { data: order, isLoading } = useOrder(orderId);
  const updateFulfillment = useUpdateFulfillmentStatus();
  const { toast } = useToast();

  async function handleFulfillmentChange(status: FulfillmentStatus) {
    if (!order) return;
    try {
      await updateFulfillment.mutateAsync({ orderId: order.id, status });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  }

  return (
    <Sheet open={!!orderId} onOpenChange={open => { if (!open) onClose(); }}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle>{order ? `Order ${order.orderNumber}` : 'Order Details'}</SheetTitle>
          <SheetDescription>
            {order ? format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm') : ''}
          </SheetDescription>
        </SheetHeader>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
          </div>
        )}

        {!isLoading && order && (
          <div className="space-y-6">
            <section>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Customer
              </h3>
              <p className="text-sm font-medium text-foreground">{order.customerName}</p>
              <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
              {order.customerPhone && (
                <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
              )}
            </section>

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
                <Select
                  value={order.fulfillmentStatus}
                  onValueChange={v => void handleFulfillmentChange(v as FulfillmentStatus)}
                >
                  <SelectTrigger className="h-7 text-xs w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FULFILLMENT_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value} className="text-xs">
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
