import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { AdminLoadError } from '@/components/admin/AdminLoadError';
import { AdminPager } from '@/components/admin/AdminPager';
import { CustomerStatsGrid } from '@/components/admin/customers/customer-stats-grid';
import { CustomersTable } from '@/components/admin/customers/customers-table';
import { CustomersToolbar } from '@/components/admin/customers/customers-toolbar';
import { SignupsByMonthCard } from '@/components/admin/customers/signups-by-month-card';
import { useAdminCustomers } from '@/hooks/use-admin-customers';
import { useCustomersExport } from '@/hooks/use-customers-export';
import { computeCustomerStats, filterAndSortCustomers, signupsByMonth } from '@/lib/customer-stats';
import { ADMIN_PAGE_SIZE } from '@/lib/page-bounds';
import type { CustomerSort } from '@/types/admin-customer';

export default function CustomersPage() {
  const { data, isLoading, isFetching, isError, error, refetch } = useAdminCustomers();
  const { exportCustomers, exportMailingList } = useCustomersExport();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<CustomerSort>('newest');
  const [page, setPage] = useState(1);

  // Part of the memo keys so a tab left open past midnight moves its windows on.
  const today = new Date().toDateString();
  const customers = useMemo(() => data ?? [], [data]);
  const stats = useMemo(() => computeCustomerStats(customers, new Date(today)), [customers, today]);
  const months = useMemo(() => signupsByMonth(customers, new Date(today)), [customers, today]);
  const shown = useMemo(() => filterAndSortCustomers(customers, search, sort), [customers, search, sort]);
  const pageRows = shown.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE);

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
          <AdminLoadError what="the customers" error={error} isRetrying={isFetching} onRetry={() => void refetch()} />
        ) : isLoading ? (
          <div className="flex justify-center py-16" role="status">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-accent" aria-hidden="true" />
            <span className="sr-only">Loading customers</span>
          </div>
        ) : (
          <>
            <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
              <CustomerStatsGrid stats={stats} />
              <SignupsByMonthCard rows={months} />
            </div>

            <CustomersToolbar
              search={search}
              sort={sort}
              shownCount={shown.length}
              optInCount={stats.marketingOptIns}
              isFetching={isFetching}
              onSearch={(value) => {
                setSearch(value);
                setPage(1);
              }}
              onSort={(value) => {
                setSort(value);
                setPage(1);
              }}
              onRefresh={() => void refetch()}
              onExport={() => exportCustomers(shown)}
              onExportMailingList={() => exportMailingList(customers)}
            />

            <div>
              <CustomersTable customers={pageRows} hasSearch={search.trim() !== ''} />
              <AdminPager
                page={page}
                pageSize={ADMIN_PAGE_SIZE}
                total={shown.length}
                noun="customers"
                isFetching={isFetching}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
