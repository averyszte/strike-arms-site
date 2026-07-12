import { useState } from 'react';
import { format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useOrders, useUpdateFulfillmentStatus } from '@/hooks/use-orders';
import { OrderDetailSheet } from '@/components/admin/OrderDetailSheet';
import { useToast } from '@/hooks/use-toast';
import type { FulfillmentStatus, PaymentStatus } from '@/types/order';

const FULFILLMENT_OPTIONS: { value: FulfillmentStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'ready_for_pickup', label: 'Ready for Pickup' },
  { value: 'collected', label: 'Collected' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PAYMENT_TABS: { value: PaymentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

function fmtEuros(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

export function OrdersTable() {
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data, isLoading } = useOrders({
    paymentStatus: paymentFilter === 'all' ? undefined : paymentFilter,
  });
  const updateStatus = useUpdateFulfillmentStatus();
  const { toast } = useToast();
  const orders = data?.items ?? [];

  async function handleStatusChange(orderId: string, status: FulfillmentStatus) {
    try {
      await updateStatus.mutateAsync({ orderId, status });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  }

  return (
    <>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground mb-3">Orders</h2>
        <Tabs value={paymentFilter} onValueChange={v => setPaymentFilter(v as PaymentStatus | 'all')}>
          <TabsList>
            {PAYMENT_TABS.map(t => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-accent" />
        </div>
      ) : (
        <div className="border border-border rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order #</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Payment</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fulfillment</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono font-medium text-foreground">{order.orderNumber}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {format(new Date(order.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {fmtEuros(order.totalCents)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}
                        className="text-[10px] capitalize"
                      >
                        {order.paymentStatus.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <Select
                        value={order.fulfillmentStatus}
                        onValueChange={v =>
                          void handleStatusChange(order.id, v as FulfillmentStatus)
                        }
                      >
                        <SelectTrigger className="h-7 text-xs w-44">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FULFILLMENT_OPTIONS.map(s => (
                            <SelectItem key={s.value} value={s.value} className="text-xs">
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <OrderDetailSheet orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
    </>
  );
}
