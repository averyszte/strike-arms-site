import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Euro, Clock, TrendingUp, Package } from 'lucide-react';
import { StatCard } from '@/components/admin/dashboard/stat-card';
import { RevenueTrackerCard } from '@/components/admin/dashboard/revenue-tracker-card';
import { DeliveryStatusCard } from '@/components/admin/dashboard/delivery-status-card';
import { TopProductsCard } from '@/components/admin/dashboard/top-products-card';
import { RecentOrdersCard } from '@/components/admin/dashboard/recent-orders-card';
import { OperationalAlertsCard } from '@/components/admin/dashboard/operational-alerts-card';
import { useAllOrdersWithItems } from '@/hooks/use-orders';
import { useAdminProducts } from '@/hooks/use-admin-products';
import { useInquiries } from '@/hooks/use-inquiries';
import { computeDashboardMetrics, workQueue } from '@/lib/admin-dashboard-metrics';

function fmtEuros(cents: number) {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function DashboardPage() {
  const { data: orders = [], isLoading } = useAllOrdersWithItems();
  const { data: products = [] } = useAdminProducts();
  const { data: newInquiries = [] } = useInquiries('new');

  const metrics = computeDashboardMetrics(orders);
  // Money and volume read every order; the queues and alerts read only what is
  // still open. Archiving an order must never make revenue go down.
  const active = useMemo(() => workQueue(orders), [orders]);
  const publishedCount = products.filter(p => p.isPublished).length;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | Strike Arms Admin</title>
      </Helmet>
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Revenue This Month"
            value={fmtEuros(metrics.revenueThisMonth)}
            detail={`${fmtEuros(metrics.revenueAllTime)} all time`}
            icon={Euro}
          />
          <StatCard
            title="Open Deliveries"
            value={String(metrics.pendingPickups)}
            detail="awaiting collection"
            icon={Clock}
          />
          <StatCard
            title="Orders Today"
            value={String(metrics.ordersToday)}
            detail={`${metrics.ordersThisMonth} this month`}
            icon={TrendingUp}
          />
          <StatCard
            title="Live Products"
            value={String(publishedCount)}
            detail="published"
            icon={Package}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RevenueTrackerCard orders={orders} />
          <DeliveryStatusCard orders={active} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopProductsCard orders={orders} />
          <RecentOrdersCard orders={active} />
        </div>

        <OperationalAlertsCard
          orders={active}
          products={products}
          newInquiryCount={newInquiries.length}
        />
      </div>
    </>
  );
}
