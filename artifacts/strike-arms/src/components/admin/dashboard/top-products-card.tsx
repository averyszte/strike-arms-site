import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buildProductSales } from '@/lib/admin-dashboard-metrics';
import type { Order } from '@/types/order';

function formatEuros(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

interface Props {
  orders: Order[];
}

export function TopProductsCard({ orders }: Props) {
  const rows = buildProductSales(orders);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Top Products</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No sales data yet</p>
        ) : (
          <div className="space-y-3">
            {rows.map((row, i) => (
              <div key={row.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground/50 w-4 shrink-0 text-right">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{row.name}</p>
                  <p className="text-xs text-muted-foreground">{row.quantity} sold</p>
                </div>
                <p className="text-sm font-semibold tabular-nums shrink-0">
                  {formatEuros(row.revenue)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
