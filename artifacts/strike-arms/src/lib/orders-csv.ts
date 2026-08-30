import type { Order, ShippingAddress } from '@/types/order';
import {
  FULFILLMENT_METHOD_LABELS,
  ORDER_CHANNEL_LABELS,
  PAYMENT_METHOD_LABELS,
} from '@/lib/order-display';
import { buildCsv, csvFilename, money } from '@/lib/csv-write';

/**
 * Turns orders into a CSV an accountant can open without swearing.
 *
 * The escaping, the byte order mark and the money formatting live in
 * csv-write.ts — shared with the product export, so the two files cannot
 * disagree about what is safe to hand a spreadsheet.
 */

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
  return buildCsv(COLUMNS, orders.map(orderRow));
}

export function ordersCsvFilename(today: Date): string {
  return csvFilename('orders', today);
}
