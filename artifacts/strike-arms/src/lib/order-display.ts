import type {
  FulfillmentMethod,
  FulfillmentStatus,
  OrderChannel,
  PaymentMethod,
} from '@/types/order';

/**
 * Shared labels for rendering orders in the admin.
 *
 * The fulfilment options list lives here rather than in each table, because
 * the states an order can be moved to must not differ between the list view
 * and the detail sheet.
 */

export const FULFILLMENT_OPTIONS: { value: FulfillmentStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'ready_for_pickup', label: 'Ready for Pickup' },
  { value: 'collected', label: 'Collected' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const FULFILLMENT_METHOD_LABELS: Record<FulfillmentMethod, string> = {
  pickup: 'Collection',
  delivery: 'Delivery',
  mixed: 'Collection + delivery',
};

export const ORDER_CHANNEL_LABELS: Record<OrderChannel, string> = {
  web: 'Website',
  counter: 'Counter',
  phone: 'Phone',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  stripe: 'Card (online)',
  cash: 'Cash',
  card_terminal: 'Card terminal',
  bank_transfer: 'Bank transfer',
};

/**
 * What a sale rung up by hand can be. Stripe is absent because there is no
 * Stripe session behind a counter sale, and web is absent because a sale
 * entered by an admin did not come through the website.
 */
export const COUNTER_PAYMENT_METHODS: PaymentMethod[] = [
  'cash',
  'card_terminal',
  'bank_transfer',
];

export const COUNTER_CHANNELS: OrderChannel[] = ['counter', 'phone'];

/**
 * Order numbers are assigned when payment succeeds, so a pending order has
 * none. Showing that plainly beats an empty cell that reads as a bug.
 */
export function formatOrderNumber(orderNumber: string | null): string {
  return orderNumber ?? 'Not yet paid';
}
