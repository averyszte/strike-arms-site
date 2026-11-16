import { format } from 'date-fns';
import { Check } from 'lucide-react';

import { TableScrollHint } from '@/components/admin/TableScrollHint';
import { formatPrice } from '@/lib/format-price';
import type { AdminCustomer } from '@/types/admin-customer';

interface Props {
  customers: AdminCustomer[];
  hasSearch: boolean;
}

const HEADINGS = ['Customer', 'Signed up', 'Last sign-in', 'Orders', 'Spent', 'Last order', 'Emails'];

function day(iso: string | null): string {
  return iso ? format(new Date(iso), 'dd MMM yyyy') : '—';
}

function CustomerRow({ customer }: { customer: AdminCustomer }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3">
        <p className="font-medium text-foreground">{customer.fullName || 'No name given'}</p>
        <p className="text-xs text-muted-foreground">{customer.email}</p>
        {customer.phone && <p className="text-xs text-muted-foreground">{customer.phone}</p>}
        {!customer.emailConfirmedAt && (
          <p className="text-xs text-amber-600 dark:text-amber-400">Email not confirmed</p>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{day(customer.createdAt)}</td>
      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{day(customer.lastSignInAt)}</td>
      <td className="px-4 py-3 tabular-nums">{customer.orderCount}</td>
      <td className="px-4 py-3 tabular-nums whitespace-nowrap">{formatPrice(customer.spentCents)}</td>
      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{day(customer.lastOrderAt)}</td>
      <td className="px-4 py-3">
        {customer.isMarketingOptIn ? (
          <Check className="w-4 h-4 text-accent" aria-label="Said yes to marketing emails" />
        ) : (
          <span className="text-muted-foreground" aria-label="No marketing emails">—</span>
        )}
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
