import type { FulfillmentMethod, FulfillmentStatus } from '@/types/order';

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

/**
 * Order numbers are assigned when payment succeeds, so a pending order has
 * none. Showing that plainly beats an empty cell that reads as a bug.
 */
export function formatOrderNumber(orderNumber: string | null): string {
  return orderNumber ?? 'Not yet paid';
}
