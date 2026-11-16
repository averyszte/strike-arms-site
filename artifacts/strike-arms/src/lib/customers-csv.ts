import type { AdminCustomer } from '@/types/admin-customer';
// Relative, with the extension, so node --test can load this file.
import { buildCsv } from './csv-write.ts';
import { formatCentsPlain } from './format-price.ts';

/**
 * The Customers page export. Escaping, the byte order mark and plain money
 * come from csv-write.ts and format-price.ts, as for orders and products.
 */

const COLUMNS = [
  'Name',
  'Email',
  'Phone',
  'Signed up',
  'Email confirmed',
  'Last sign-in',
  'Marketing emails',
  'Orders',
  'Spent',
  'Last order',
];

function day(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '';
}

export function customersToCsv(customers: AdminCustomer[]): string {
  return buildCsv(
    COLUMNS,
    customers.map((c) => [
      c.fullName,
      c.email,
      c.phone,
      day(c.createdAt),
      c.emailConfirmedAt ? 'Yes' : 'No',
      day(c.lastSignInAt),
      c.isMarketingOptIn ? 'Yes' : 'No',
      String(c.orderCount),
      formatCentsPlain(c.spentCents),
      day(c.lastOrderAt),
    ]),
  );
}
