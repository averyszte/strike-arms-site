import { DollarSign, Clock, TrendingUp, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { DashboardMetrics } from '@/lib/admin-dashboard-metrics';

function formatEuros(cents: number) {
  return `€${(cents / 100).toLocaleString('en-IE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface Props {
  metrics: DashboardMetrics;
  productCount: number;
}

export function DashboardStats({ metrics, productCount }: Props) {
  const stats = [
    {
      label: 'Revenue This Month',
      value: formatEuros(metrics.revenueThisMonth),
      icon: DollarSign,
      sub: `${formatEuros(metrics.revenueAllTime)} all time`,
    },
    {
      label: 'Pending Pickups',
      value: String(metrics.pendingPickups),
      icon: Clock,
      sub: 'awaiting collection',
    },
    {
      label: 'Orders Today',
      value: String(metrics.ordersToday),
      icon: TrendingUp,
      sub: `${metrics.ordersThisMonth} this month`,
    },
    {
      label: 'Live Products',
      value: String(productCount),
      icon: Package,
      sub: 'published',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map(stat => (
        <Card key={stat.label}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
              </div>
              <stat.icon className="w-7 h-7 text-muted-foreground/30 mt-0.5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
