import type { Order, ShippingAddress } from '@/types/order';
import {
  FULFILLMENT_METHOD_LABELS,
  ORDER_CHANNEL_LABELS,
  PAYMENT_METHOD_LABELS,
} from '@/lib/order-display';

/**
 * Turns orders into a CSV an accountant can open without swearing.
 *
 * Four things this gets right that a naive join on commas does not:
 *
 * 1. Formula injection. A cell beginning =, +, - or @ is executed as a formula
 *    by Excel, LibreOffice and Sheets. Customer names, addresses and notes are
 *    typed by strangers at checkout, so every field is neutralised. Quoting is
 *    not enough — the quotes are stripped before the cell is parsed.
 * 2. A byte order mark. Without it Excel reads the file as the local codepage
 *    and every fada in an Irish name turns to mojibake.
 * 3. CRLF line endings, which is what RFC 4180 says and what Excel expects.
 * 4. Money as a bare decimal. A euro sign or a thousands separator makes the
 *    column text, and a column of text does not sum.
 */

const BOM = '\uFEFF';
const ROW_SEPARATOR = '\r\n';

/** Leading characters a spreadsheet treats as the start of a formula. */
const FORMULA_START = /^[=+\-@\t\r]/;

const COLUMNS = [
  'Order number',
  'Created',
  'Paid at',
  'Channel',
  'Payment method',
  'Payment status',
  'Fulfilment method',
  'Fulfilment status',
  'Customer',
  'Email',
  'Phone',
  'Delivery address',
  'Eircode',
  'Net of VAT',
  'VAT',
  'Shipping',
  'Total',
  'Refunded',
  'Items',
  'Item count',
  'Archived',
  'Notes',
];

/** An amount a spreadsheet will add up: cents to a plain two-decimal number. */
function money(cents: number): string {
  return (cents / 100).toFixed(2);
}

function address(shipping: ShippingAddress | null): string {
  if (!shipping) return '';
  return [shipping.line1, shipping.line2, shipping.city, shipping.county]
    .filter((part): part is string => Boolean(part))
    .join(', ');
}

function itemsSummary(order: Order): string {
  if (!order.items?.length) return '';
  return order.items.map((item) => `${item.quantity} x ${item.productName}`).join('; ');
}

function itemCount(order: Order): string {
  if (!order.items?.length) return '';
  return String(order.items.reduce((sum, item) => sum + item.quantity, 0));
}

function escapeCell(value: string): string {
  const safe = FORMULA_START.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

function orderRow(order: Order): string[] {
  return [
    order.orderNumber ?? '',
    order.createdAt,
    order.paidAt ?? '',
    ORDER_CHANNEL_LABELS[order.channel],
    PAYMENT_METHOD_LABELS[order.paymentMethod],
    order.paymentStatus.replace(/_/g, ' '),
    FULFILLMENT_METHOD_LABELS[order.fulfillmentMethod],
    order.fulfillmentStatus.replace(/_/g, ' '),
    order.customerName,
    order.customerEmail ?? '',
    order.customerPhone ?? '',
    address(order.shippingAddress),
    order.shippingAddress?.eircode ?? '',
    money(order.totalCents - order.vatCents),
    money(order.vatCents),
    money(order.shippingCents),
    money(order.totalCents),
    money(order.refundCents),
    itemsSummary(order),
    itemCount(order),
    order.isArchived ? 'Yes' : 'No',
    order.notes ?? '',
  ];
}

export function buildOrdersCsv(orders: Order[]): string {
  const rows = [COLUMNS, ...orders.map(orderRow)];
  return BOM + rows.map((row) => row.map(escapeCell).join(',')).join(ROW_SEPARATOR) + ROW_SEPARATOR;
}

/** e.g. "strike-arms-orders-2026-08-29.csv". */
export function ordersCsvFilename(today: Date): string {
  return `strike-arms-orders-${today.toISOString().slice(0, 10)}.csv`;
}
