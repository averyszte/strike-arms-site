import { Euro, Mail, Repeat, ShoppingBag, UserPlus, Users } from 'lucide-react';

import { StatCard } from '@/components/admin/dashboard/stat-card';
import { percentOf } from '@/lib/customer-stats';
import { formatWholeEuros } from '@/lib/format-price';
import type { CustomerStats } from '@/types/admin-customer';

interface Props {
  stats: CustomerStats;
}

/** Plain counts, not percentages: "+3" means something at this size, "+60%" does not. */
function changeDetail(current: number, previous: number): string {
  const change = current - previous;
  if (change === 0) return 'same as the previous 30 days';
  return `${Math.abs(change)} ${change > 0 ? 'more' : 'fewer'} than the previous 30 days`;
}

export function CustomerStatsGrid({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        title="Customer Accounts"
        value={String(stats.total)}
        detail={`${percentOf(stats.confirmed, stats.total)}% confirmed their email`}
        icon={Users}
      />
      <StatCard
        title="New in 30 Days"
        value={String(stats.newLast30Days)}
        detail={changeDetail(stats.newLast30Days, stats.newPrevious30Days)}
        icon={UserPlus}
      />
      <StatCard
        title="Customers Who Ordered"
        value={String(stats.withOrders)}
        detail={`${percentOf(stats.withOrders, stats.total)}% of accounts`}
        icon={ShoppingBag}
      />
      <StatCard
        title="Repeat Customers"
        value={String(stats.repeat)}
        detail={`${percentOf(stats.repeat, stats.withOrders)}% of those who ordered came back`}
        icon={Repeat}
      />
      <StatCard
        title="Spent by Customers"
        value={formatWholeEuros(stats.spentCents)}
        detail={`${formatWholeEuros(stats.medianSpendCents)} typical spend; guests without an account not included`}
        icon={Euro}
      />
      <StatCard
        title="Marketing Opt-ins"
        value={String(stats.marketingOptIns)}
        detail={`${percentOf(stats.marketingOptIns, stats.total)}% said yes to emails`}
        icon={Mail}
      />
    </div>
  );
}
