import { format } from 'date-fns';
import { Check } from 'lucide-react';
import { Link } from 'wouter';

import { TableScrollHint } from '@/components/admin/TableScrollHint';
import { formatPrice } from '@/lib/format-price';
import type { AdminCustomer } from '@/types/admin-customer';

interface Props {
  customers: AdminCustomer[];
  hasSearch: boolean;
}

const HEADINGS = ['Customer', 'Signed up', 'Last sign-in', 'Orders', 'Spent', 'Last order', 'Marketing'];

function day(iso: string | null): string {
  return iso ? format(new Date(iso), 'dd MMM yyyy') : '—';
}

/** The orders list searches customer_email, so this also finds unlinked guest orders. */
function ordersHref(email: string): string {
  return `/admin/orders?q=${encodeURIComponent(email)}`;
}

function OrderCount({ customer }: { customer: AdminCustomer }) {
  if (customer.orderCount === 0 || customer.email === '') return <>{customer.orderCount}</>;
  return (
    <Link
      href={ordersHref(customer.email)}
      className="text-accent underline-offset-2 hover:underline"
      aria-label={`${customer.orderCount} orders, see them in Orders`}
    >
      {customer.orderCount}
    </Link>
  );
}

function CustomerRow({ customer }: { customer: AdminCustomer }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 max-w-[16rem]">
        <p className="font-medium text-foreground truncate">{customer.fullName || 'No name given'}</p>
        <p className="text-xs text-muted-foreground truncate" title={customer.email}>
          {customer.email || 'No email'}
        </p>
        {customer.phone && <p className="text-xs text-muted-foreground">{customer.phone}</p>}
        {!customer.emailConfirmedAt && (
          <p className="text-xs text-amber-600 dark:text-amber-400">Email not confirmed</p>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{day(customer.createdAt)}</td>
      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{day(customer.lastSignInAt)}</td>
      <td className="px-4 py-3 tabular-nums">
        <OrderCount customer={customer} />
      </td>
      <td className="px-4 py-3 tabular-nums whitespace-nowrap">{formatPrice(customer.spentCents)}</td>
      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{day(customer.lastOrderAt)}</td>
      <td className="px-4 py-3">
        {customer.isMarketingOptIn ? (
          <Check className="w-4 h-4 text-accent" aria-hidden="true" />
        ) : (
          <span className="text-muted-foreground" aria-hidden="true">—</span>
        )}
        <span className="sr-only">{customer.isMarketingOptIn ? 'Yes' : 'No'}</span>
      </td>
    </tr>
  );
}

export function CustomersTable({ customers, hasSearch }: Props) {
  return (
    <div className="border border-border rounded-md overflow-hidden">
      <TableScrollHint />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {HEADINGS.map((heading) => (
                <th key={heading} className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <CustomerRow key={customer.userId} customer={customer} />
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={HEADINGS.length} className="px-4 py-12 text-center text-muted-foreground">
                  {hasSearch ? 'No customers match that search' : 'No customer accounts yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
