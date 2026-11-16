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

function timeOf(iso: string | null): number {
  return iso ? new Date(iso).getTime() : 0;
}

function isBetween(iso: string, from: number, to: number): boolean {
  const at = timeOf(iso);
  return at >= from && at < to;
}

/** The middle value; the mean of the two middle ones for an even count. */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export function computeCustomerStats(customers: AdminCustomer[], now: Date): CustomerStats {
  const today = now.getTime();
  const spends = customers.filter((c) => c.spentCents > 0).map((c) => c.spentCents);
  return {
    total: customers.length,
    // No upper bound: a sign-up stamped by a server clock slightly ahead of
    // this one still counts as new.
    newLast30Days: customers.filter((c) => timeOf(c.createdAt) >= today - 30 * DAY_MS).length,
    newPrevious30Days: customers.filter((c) =>
      isBetween(c.createdAt, today - 60 * DAY_MS, today - 30 * DAY_MS),
    ).length,
    confirmed: customers.filter((c) => c.emailConfirmedAt !== null).length,
    marketingOptIns: customers.filter((c) => c.isMarketingOptIn).length,
    withOrders: customers.filter((c) => c.orderCount > 0).length,
    repeat: customers.filter((c) => c.orderCount > 1).length,
    spentCents: spends.reduce((sum, cents) => sum + cents, 0),
    medianSpendCents: median(spends),
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

function digitsOf(text: string): string {
  return text.replace(/\D/g, '');
}

/** Phones match on digits alone, so "087 123" finds "087-1234567". */
function matches(customer: AdminCustomer, term: string, termDigits: string): boolean {
  if (customer.email.toLowerCase().includes(term)) return true;
  if (customer.fullName.toLowerCase().includes(term)) return true;
  return termDigits.length >= 3 && digitsOf(customer.phone).includes(termDigits);
}

type Keyed = { customer: AdminCustomer; created: number; signedIn: number };

const SORTERS: Record<CustomerSort, (a: Keyed, b: Keyed) => number> = {
  newest: (a, b) => b.created - a.created,
  spent: (a, b) =>
    b.customer.spentCents - a.customer.spentCents || b.customer.orderCount - a.customer.orderCount,
  orders: (a, b) =>
    b.customer.orderCount - a.customer.orderCount || b.customer.spentCents - a.customer.spentCents,
  'last-sign-in': (a, b) => b.signedIn - a.signedIn,
};

/**
 * Searches name, email and phone, then sorts. Dates are parsed once per row
 * rather than on every comparison. Never changes `customers`.
 */
export function filterAndSortCustomers(
  customers: AdminCustomer[],
  search: string,
  sort: CustomerSort,
): AdminCustomer[] {
  const term = search.trim().toLowerCase();
  const termDigits = digitsOf(term);
  const found = term ? customers.filter((c) => matches(c, term, termDigits)) : customers;
  return found
    .map((customer) => ({
      customer,
      created: timeOf(customer.createdAt),
      signedIn: timeOf(customer.lastSignInAt),
    }))
    .sort(SORTERS[sort])
    .map((keyed) => keyed.customer);
}
