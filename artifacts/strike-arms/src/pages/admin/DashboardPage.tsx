import { lazy, Suspense, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Euro, Clock, TrendingUp, Package } from 'lucide-react';
import { AdminLoadError } from '@/components/admin/AdminLoadError';
import { StatCard } from '@/components/admin/dashboard/stat-card';
import { DeliveryStatusCard } from '@/components/admin/dashboard/delivery-status-card';
import { TopProductsCard } from '@/components/admin/dashboard/top-products-card';
import { RecentOrdersCard } from '@/components/admin/dashboard/recent-orders-card';
import { OperationalAlertsCard } from '@/components/admin/dashboard/operational-alerts-card';
import { UnmatchedPaymentsCard } from '@/components/admin/dashboard/unmatched-payments-card';
import { FailedEmailsCard } from '@/components/admin/dashboard/failed-emails-card';
import { SystemHealthCard } from '@/components/admin/dashboard/system-health-card';
import { useAllOrdersWithItems } from '@/hooks/use-all-orders-with-items';
import { useAdminProducts } from '@/hooks/use-admin-products';
import { useInquiries } from '@/hooks/use-inquiries';
import { computeDashboardMetrics, ordersTodayDetail, workQueue } from '@/lib/admin-dashboard-metrics';
import { formatWholeEuros } from '@/lib/format-price';

// recharts is about 330 kB raw and this card is its only user, so it is its
// own chunk rather than part of every admin page (N-036).
const RevenueTrackerCard = lazy(() =>
  import('@/components/admin/dashboard/revenue-tracker-card').then((m) => ({
    default: m.RevenueTrackerCard,
  })),
);

/** The revenue card's height while its chunk loads, so the grid does not jump. */
const REVENUE_CARD_FALLBACK = (
  <div className="h-[17.5rem] rounded-lg border border-border bg-card" aria-busy="true" />
);

export default function DashboardPage() {
  const ordersQuery = useAllOrdersWithItems();
  const productsQuery = useAdminProducts();
  // Only the count is shown, and `total` is exact whatever the limit.
  const inquiriesQuery = useInquiries('new', 1);
  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);
  const products = productsQuery.data ?? [];
  const newInquiries = inquiriesQuery.data;
  const isLoading = ordersQuery.isLoading;

  // Any one of them failing makes a figure wrong rather than missing: no
  // orders reads as EUR 0 revenue, no products as nothing published.
  const failed = [ordersQuery, productsQuery, inquiriesQuery].filter((q) => q.isError);

  const metrics = computeDashboardMetrics(orders);
  // Money and volume read every order; the queues and alerts read only what is
  // still open. Archiving an order must never make revenue go down.
  const active = useMemo(() => workQueue(orders), [orders]);
  const publishedCount = products.filter(p => p.isPublished).length;

  if (failed.length > 0) {
    return (
      <AdminLoadError
        what="the dashboard"
        error={failed[0].error}
        isRetrying={failed.some((q) => q.isFetching)}
        onRetry={() => failed.forEach((q) => void q.refetch())}
      />
    );
  }

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

        <UnmatchedPaymentsCard />
        <FailedEmailsCard />
        <SystemHealthCard />
        {/* N-087: what needs doing comes before the figures. */}
        <OperationalAlertsCard
          orders={active}
          products={products}
          newInquiryCount={newInquiries?.total ?? 0}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Revenue This Month"
            value={formatWholeEuros(metrics.revenueThisMonth)}
            detail={`${formatWholeEuros(metrics.revenueAllTime)} all time`}
            icon={Euro}
          />
          <StatCard
            title="Not Started"
            value={String(metrics.pendingPickups)}
            detail="paid orders still to pack"
            icon={Clock}
          />
          <StatCard
            title="Orders Today"
            value={String(metrics.ordersToday)}
            detail={ordersTodayDetail(metrics)}
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
          <Suspense fallback={REVENUE_CARD_FALLBACK}>
            <RevenueTrackerCard orders={orders} />
          </Suspense>
          <DeliveryStatusCard orders={active} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopProductsCard orders={orders} />
          <RecentOrdersCard orders={active} />
        </div>

      </div>
    </>
  );
}
