import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Order, FulfillmentStatus } from '@/types/order';

const STAGES: { key: FulfillmentStatus; label: string; color: string }[] = [
  { key: 'pending', label: 'Pending', color: 'text-yellow-500' },
  { key: 'ready_for_pickup', label: 'Ready for pickup', color: 'text-blue-500' },
  { key: 'collected', label: 'Collected', color: 'text-green-600' },
  { key: 'packed', label: 'Packed', color: 'text-blue-500' },
  { key: 'shipped', label: 'Shipped', color: 'text-blue-500' },
  { key: 'delivered', label: 'Delivered', color: 'text-green-600' },
  { key: 'cancelled', label: 'Cancelled', color: 'text-muted-foreground' },
];

interface Props {
  orders: Order[];
}

export function DeliveryStatusCard({ orders }: Props) {
  const paid = orders.filter(o => o.paymentStatus === 'paid');

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Delivery Status</CardTitle>
      </CardHeader>
      <CardContent>
        {paid.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No paid orders yet</p>
        ) : (
          <div className="space-y-4">
            {STAGES.map(stage => {
              const count = paid.filter(o => o.fulfillmentStatus === stage.key).length;
              const pct = paid.length > 0 ? count / paid.length : 0;
              return (
                <div key={stage.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">{stage.label}</span>
                    <span className={`text-sm font-semibold tabular-nums ${stage.color}`}>
                      {count}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent/60 transition-all duration-500"
                      style={{ width: `${Math.round(pct * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
