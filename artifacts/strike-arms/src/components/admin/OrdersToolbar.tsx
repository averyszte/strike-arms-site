import { Archive, Columns3, Download, Plus, Table2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { OrdersViewMode } from '@/hooks/use-orders-view';
import type { PaymentStatus } from '@/types/order';

/**
 * The controls above the orders list.
 *
 * Split out of OrdersView when the export button arrived — the container was
 * approaching the file limit and the toolbar is the part that holds no state.
 */

const PAYMENT_TABS: { value: PaymentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

type OrdersToolbarProps = {
  view: OrdersViewMode;
  isTableForced: boolean;
  showArchived: boolean;
  paymentFilter: PaymentStatus | 'all';
  selectedCount: number;
  isExporting: boolean;
  onViewChange: (view: OrdersViewMode) => void;
  onToggleArchived: () => void;
  onPaymentFilterChange: (value: PaymentStatus | 'all') => void;
  onNewCounterSale: () => void;
  onExport: () => void;
};

export function OrdersToolbar({
  view,
  isTableForced,
  showArchived,
  paymentFilter,
  selectedCount,
  isExporting,
  onViewChange,
  onToggleArchived,
  onPaymentFilterChange,
  onNewCounterSale,
  onExport,
}: OrdersToolbarProps) {
  return (
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
                // Radix clears the value when the active item is clicked again;
                // there is always a view, so an empty value is ignored.
                if (value) onViewChange(value as OrdersViewMode);
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
            onClick={onToggleArchived}
          >
            <Archive className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Archived
          </Button>

          {/* Exports what the filters are showing, not what fits on the page —
              an export of the visible twenty is no use to an accountant. */}
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isExporting}
            onClick={onExport}
          >
            <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {selectedCount > 0 ? `Export ${selectedCount} selected` : 'Export CSV'}
          </Button>

          <Button size="sm" onClick={onNewCounterSale}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            New counter sale
          </Button>
        </div>
      </div>

      <Tabs
        value={paymentFilter}
        onValueChange={(value) => onPaymentFilterChange(value as PaymentStatus | 'all')}
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
          Archived orders are out of the way, not undone — they still count towards revenue on the
          dashboard.
        </p>
      )}
    </div>
  );
}
