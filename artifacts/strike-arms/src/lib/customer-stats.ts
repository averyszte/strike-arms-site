import type {
  AdminCustomer,
  CustomerSort,
  CustomerStats,
  MonthlySignups,
} from '@/types/admin-customer';

/**
 * The figures and list views on the admin Customers page. Pure: `now` is
 * passed in so the tests can pin it.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function isBetween(iso: string, from: number, to: number): boolean {
  const at = new Date(iso).getTime();
  return at >= from && at < to;
}

export function computeCustomerStats(customers: AdminCustomer[], now: Date): CustomerStats {
  const today = now.getTime();
  const ordered = customers.filter((c) => c.orderCount > 0);
  const spentCents = ordered.reduce((sum, c) => sum + c.spentCents, 0);
  return {
    total: customers.length,
    newLast30Days: customers.filter((c) => isBetween(c.createdAt, today - 30 * DAY_MS, today + 1)).length,
    newPrevious30Days: customers.filter((c) =>
      isBetween(c.createdAt, today - 60 * DAY_MS, today - 30 * DAY_MS),
    ).length,
    confirmed: customers.filter((c) => c.emailConfirmedAt !== null).length,
    marketingOptIns: customers.filter((c) => c.isMarketingOptIn).length,
    withOrders: ordered.length,
    repeat: customers.filter((c) => c.orderCount > 1).length,
    spentCents,
    averageSpendCents: ordered.length > 0 ? Math.round(spentCents / ordered.length) : 0,
  };
}

/** Sign-ups per calendar month, oldest first, ending with this month. */
export function signupsByMonth(customers: AdminCustomer[], now: Date, months = 6): MonthlySignups[] {
  const rows: MonthlySignups[] = [];
  for (let back = months - 1; back >= 0; back -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    rows.push({
      label: `${MONTH_LABELS[start.getMonth()]} ${start.getFullYear()}`,
      count: customers.filter((c) => isBetween(c.createdAt, start.getTime(), end.getTime())).length,
    });
  }
  return rows;
}

/** Whole-number percentage, 0 when there is nothing to divide by. */
export function percentOf(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

function matches(customer: AdminCustomer, term: string): boolean {
  return [customer.email, customer.fullName, customer.phone].some((field) =>
    field.toLowerCase().includes(term),
  );
}

function timeOrZero(iso: string | null): number {
  return iso ? new Date(iso).getTime() : 0;
}

const SORTERS: Record<CustomerSort, (a: AdminCustomer, b: AdminCustomer) => number> = {
  newest: (a, b) => timeOrZero(b.createdAt) - timeOrZero(a.createdAt),
  spent: (a, b) => b.spentCents - a.spentCents || b.orderCount - a.orderCount,
  orders: (a, b) => b.orderCount - a.orderCount || b.spentCents - a.spentCents,
  'last-sign-in': (a, b) => timeOrZero(b.lastSignInAt) - timeOrZero(a.lastSignInAt),
};

/** Searches name, email and phone, then sorts. Never changes `customers`. */
export function filterAndSortCustomers(
  customers: AdminCustomer[],
  search: string,
  sort: CustomerSort,
): AdminCustomer[] {
  const term = search.trim().toLowerCase();
  const found = term ? customers.filter((c) => matches(c, term)) : [...customers];
  return found.sort(SORTERS[sort]);
}
