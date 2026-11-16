import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Download } from 'lucide-react';

import { AdminLoadError } from '@/components/admin/AdminLoadError';
import { AdminSearchBox } from '@/components/admin/AdminSearchBox';
import { CustomerStatsGrid } from '@/components/admin/customers/customer-stats-grid';
import { CustomersTable } from '@/components/admin/customers/customers-table';
import { SignupsByMonthCard } from '@/components/admin/customers/signups-by-month-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminCustomers } from '@/hooks/use-admin-customers';
import { useCsvDownload } from '@/hooks/use-csv-download';
import { computeCustomerStats, filterAndSortCustomers, signupsByMonth } from '@/lib/customer-stats';
import { customersToCsv } from '@/lib/customers-csv';
import { csvFilename } from '@/lib/csv-write';
import type { CustomerSort } from '@/types/admin-customer';

const SORT_LABELS: Record<CustomerSort, string> = {
  newest: 'Newest first',
  spent: 'Biggest spenders',
  orders: 'Most orders',
  'last-sign-in': 'Last signed in',
};

function isCustomerSort(value: string): value is CustomerSort {
  return value in SORT_LABELS;
}

export default function CustomersPage() {
  const { data, isLoading, isFetching, isError, error, refetch } = useAdminCustomers();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<CustomerSort>('newest');
  const download = useCsvDownload();

  const customers = useMemo(() => data ?? [], [data]);
  const stats = useMemo(() => computeCustomerStats(customers, new Date()), [customers]);
  const months = useMemo(() => signupsByMonth(customers, new Date()), [customers]);
  const shown = useMemo(() => filterAndSortCustomers(customers, search, sort), [customers, search, sort]);

  return (
    <>
      <Helmet>
        <title>Customers | Strike Arms Admin</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-1">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Everyone with a customer account. Staff accounts are left out.
          </p>
        </div>

        {isError ? (
          <AdminLoadError what="customers" error={error} isRetrying={isFetching} onRetry={() => void refetch()} />
        ) : isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-accent" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
              <CustomerStatsGrid stats={stats} />
              <SignupsByMonthCard rows={months} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <AdminSearchBox
                  value={search}
                  placeholder="Search by name, email or phone"
                  label="Search customers"
                  onSearch={setSearch}
                />
              </div>
              <Select value={sort} onValueChange={(value) => isCustomerSort(value) && setSort(value)}>
                <SelectTrigger className="sm:w-48" aria-label="Sort customers">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SORT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                disabled={shown.length === 0}
                onClick={() => download(customersToCsv(shown), csvFilename('customers', new Date()))}
              >
                <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                Export CSV
              </Button>
            </div>

            <CustomersTable customers={shown} hasSearch={search.trim() !== ''} />
          </>
        )}
      </div>
    </>
  );
}
