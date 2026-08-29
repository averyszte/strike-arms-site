import { Link } from 'wouter';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatOrderNumber } from '@/lib/order-display';
import type { Order } from '@/types/order';

function formatEuros(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

interface Props {
  orders: Order[];
}

export function RecentOrdersCard({ orders }: Props) {
  const recent = [...orders]
    .filter(o => o.paymentStatus === 'paid')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
        <Link href="/admin/orders" className="text-xs text-accent hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No paid orders yet</p>
        ) : (
          <div className="space-y-3">
            {recent.map(order => (
              <div key={order.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground font-mono">
                    {formatOrderNumber(order.orderNumber)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {order.customerName} · {format(new Date(order.createdAt), 'dd MMM')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold tabular-nums">
                    {formatEuros(order.totalCents)}
                  </p>
                  <Badge variant="outline" className="text-[10px] capitalize mt-0.5">
                    {order.fulfillmentStatus.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
