import { useState } from 'react';
import { Archive, Columns3, Plus, Table2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CounterOrderSheet } from '@/components/admin/CounterOrderSheet';
import { OrderDetailSheet } from '@/components/admin/OrderDetailSheet';
import { OrdersBoard } from '@/components/admin/OrdersBoard';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { useOrders, useSetOrderArchived, useUpdateFulfillmentStatus } from '@/hooks/use-orders';
import { useOrdersView, type OrdersViewMode } from '@/hooks/use-orders-view';
import { useToast } from '@/hooks/use-toast';
import type { FulfillmentStatus, Order, PaymentStatus } from '@/types/order';

/**
 * The orders screen: filters, the table or the board, and the sheets both open.
 *
 * The two views share one set of filters and one selected order on purpose —
 * switching view should not lose your place or quietly change what you are
 * looking at.
 */

const PAYMENT_TABS: { value: PaymentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

/**
 * A board split across pages would be a lie about how much work is waiting, so
 * it asks for far more rows than the table's page. Alan's open orders will not
 * approach this; if they ever do, the count below the board says so.
 */
const BOARD_PAGE_SIZE = 200;

export function OrdersView() {
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isCounterSaleOpen, setIsCounterSaleOpen] = useState(false);

  const { view, setView, isTableForced } = useOrdersView();

  const { data, isLoading } = useOrders({
    paymentStatus: paymentFilter === 'all' ? undefined : paymentFilter,
    isArchived: showArchived,
    pageSize: view === 'board' ? BOARD_PAGE_SIZE : undefined,
  });

  const updateStatus = useUpdateFulfillmentStatus();
  const setArchived = useSetOrderArchived();
  const { toast } = useToast();

  const orders = data?.items ?? [];
  const total = data?.total ?? 0;

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
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Orders</h2>

          <div className="flex flex-wrap items-center gap-2">
            {!isTableForced && (
              <ToggleGroup
                type="single"
                size="sm"
                value={view}
                aria-label="Order view"
                onValueChange={(value) => {
                  // Radix clears the value when the active item is clicked
                  // again; there is always a view, so an empty value is ignored.
                  if (value) setView(value as OrdersViewMode);
                }}
              >
                <ToggleGroupItem value="table" className="h-8 px-3 text-xs">
                  <Table2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Table
                </ToggleGroupItem>
                <ToggleGroupItem value="board" className="h-8 px-3 text-xs">
                  <Columns3 className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Board
                </ToggleGroupItem>
              </ToggleGroup>
            )}

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

        <Tabs
          value={paymentFilter}
          onValueChange={(value) => setPaymentFilter(value as PaymentStatus | 'all')}
        >
          <TabsList>
            {PAYMENT_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
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
          <div className="h-7 w-7 animate-spin rounded-full border-b-2 border-accent" />
        </div>
      ) : view === 'board' ? (
        <>
          <OrdersBoard
            orders={orders}
            isMoving={updateStatus.isPending}
            onSelect={setSelectedOrderId}
            onAdvance={(order, status) => void handleStatusChange(order.id, status)}
          />
          {total > orders.length && (
            <p className="mt-3 text-xs text-muted-foreground">
              Showing the {orders.length} most recent of {total}. Use the table to see the rest.
            </p>
          )}
        </>
      ) : (
        <OrdersTable
          orders={orders}
          showArchived={showArchived}
          onSelect={setSelectedOrderId}
          onStatusChange={(orderId, status) => void handleStatusChange(orderId, status)}
          onToggleArchive={(order) => void handleToggleArchive(order)}
        />
      )}

      <OrderDetailSheet orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />

      <CounterOrderSheet open={isCounterSaleOpen} onClose={() => setIsCounterSaleOpen(false)} />
    </>
  );
}
