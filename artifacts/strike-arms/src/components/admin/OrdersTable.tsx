import { useState } from 'react';
import { Archive, Plus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useOrders, useSetOrderArchived, useUpdateFulfillmentStatus } from '@/hooks/use-orders';
import { CounterOrderSheet } from '@/components/admin/CounterOrderSheet';
import { OrderDetailSheet } from '@/components/admin/OrderDetailSheet';
import { OrdersTableRow } from '@/components/admin/OrdersTableRow';
import { useToast } from '@/hooks/use-toast';
import type { FulfillmentStatus, Order, PaymentStatus } from '@/types/order';

const PAYMENT_TABS: { value: PaymentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

export function OrdersTable() {
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isCounterSaleOpen, setIsCounterSaleOpen] = useState(false);

  const { data, isLoading } = useOrders({
    paymentStatus: paymentFilter === 'all' ? undefined : paymentFilter,
    isArchived: showArchived,
  });
  const updateStatus = useUpdateFulfillmentStatus();
  const setArchived = useSetOrderArchived();
  const { toast } = useToast();
  const orders = data?.items ?? [];

  async function handleStatusChange(orderId: string, status: FulfillmentStatus) {
    try {
      await updateStatus.mutateAsync({ orderId, status });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  }

  async function handleToggleArchive(order: Order) {
    const isArchived = !order.isArchived;
    try {
      await setArchived.mutateAsync({ orderId: order.id, isArchived });
      toast({
        title: isArchived ? 'Order archived' : 'Order restored',
        description: isArchived
          ? 'It still counts towards revenue.'
          : 'It is back in the working list.',
      });
    } catch {
      toast({
        title: 'Error',
        description: isArchived ? 'Failed to archive order' : 'Failed to restore order',
        variant: 'destructive',
      });
    }
  }

  return (
    <>
      <div className="mb-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Orders</h2>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={showArchived ? 'default' : 'outline'}
              aria-pressed={showArchived}
              onClick={() => setShowArchived((current) => !current)}
            >
              <Archive className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Archived
            </Button>
            <Button size="sm" onClick={() => setIsCounterSaleOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
              New counter sale
            </Button>
          </div>
        </div>

        <Tabs value={paymentFilter} onValueChange={v => setPaymentFilter(v as PaymentStatus | 'all')}>
          <TabsList>
            {PAYMENT_TABS.map(t => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {showArchived && (
          <p className="mt-3 text-xs text-muted-foreground">
            Archived orders are out of the way, not undone — they still count towards revenue on
            the dashboard.
          </p>
        )}
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
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    <span className="sr-only">Archive</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <OrdersTableRow
                    key={order.id}
                    order={order}
                    onSelect={setSelectedOrderId}
                    onStatusChange={(orderId, status) => void handleStatusChange(orderId, status)}
                    onToggleArchive={(target) => void handleToggleArchive(target)}
                  />
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      {showArchived ? 'Nothing archived' : 'No orders found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <OrderDetailSheet orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />

      <CounterOrderSheet
        open={isCounterSaleOpen}
        onClose={() => setIsCounterSaleOpen(false)}
      />
    </>
  );
}
