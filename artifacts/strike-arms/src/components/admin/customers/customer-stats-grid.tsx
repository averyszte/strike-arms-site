import { Euro, Mail, Repeat, ShoppingBag, UserPlus, Users } from 'lucide-react';

import { StatCard } from '@/components/admin/dashboard/stat-card';
import { percentOf } from '@/lib/customer-stats';
import { formatWholeEuros } from '@/lib/format-price';
import type { CustomerStats } from '@/types/admin-customer';

interface Props {
  stats: CustomerStats;
}

function changeDetail(current: number, previous: number): string {
  const change = current - previous;
  if (change === 0) return 'same as the 30 days before';
  return `${change > 0 ? 'up' : 'down'} ${Math.abs(change)} on the 30 days before`;
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
        title="Have Ordered"
        value={String(stats.withOrders)}
        detail={`${percentOf(stats.withOrders, stats.total)}% of accounts`}
        icon={ShoppingBag}
      />
      <StatCard
        title="Repeat Customers"
        value={String(stats.repeat)}
        detail="two or more orders"
        icon={Repeat}
      />
      <StatCard
        title="Spent by Account Holders"
        value={formatWholeEuros(stats.spentCents)}
        detail={`${formatWholeEuros(stats.averageSpendCents)} average per customer who ordered`}
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
