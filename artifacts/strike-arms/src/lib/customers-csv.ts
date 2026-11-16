import type { AdminCustomer } from '@/types/admin-customer';
// Relative, with the extension, so node --test can load this file.
import { buildCsv } from './csv-write.ts';
import { formatCentsPlain } from './format-price.ts';

/**
 * The Customers page exports. Escaping, the byte order mark and plain money
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
  'Marketing opt-in date',
  'Orders',
  'Spent',
  'Last order',
];

const MAILING_COLUMNS = ['Name', 'Email', 'Opted in on'];

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** The local calendar day, so the file shows the same date as the table. */
function day(iso: string | null): string {
  if (!iso) return '';
  const at = new Date(iso);
  return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`;
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
      day(c.marketingOptInAt),
      String(c.orderCount),
      formatCentsPlain(c.spentCents),
      day(c.lastOrderAt),
    ]),
  );
}

/**
 * Only the people who said yes to marketing emails, with only what a mail
 * tool needs. Nobody who said no can end up on a mailing list by accident.
 */
export function mailingListToCsv(customers: AdminCustomer[]): string {
  return buildCsv(
    MAILING_COLUMNS,
    customers
      .filter((c) => c.isMarketingOptIn && c.email !== '')
      .map((c) => [c.fullName, c.email, day(c.marketingOptInAt)]),
  );
}
