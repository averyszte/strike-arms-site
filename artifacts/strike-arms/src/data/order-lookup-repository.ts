import { supabase } from '@/lib/supabase';
import type {
  FulfillmentMethod,
  FulfillmentStatus,
  ItemFulfillmentMethod,
  PaymentStatus,
} from '@/types/database-rows';
import type {
  LookedUpOrder,
  LookedUpOrderItem,
  OrderLookupInput,
  OrderLookupResult,
  OrderStatusEvent,
} from '@/types/order-lookup';

/**
 * The only caller of the order-lookup Edge Function. The function checks the
 * order number and email itself; this only narrows what comes back, so a
 * reply of the wrong shape is an error rather than a half-drawn order.
 */

const PAYMENT_STATUSES: readonly PaymentStatus[] = [
  'pending', 'paid', 'refunded', 'partially_refunded', 'failed', 'expired', 'abandoned',
];
const FULFILLMENT_STATUSES: readonly FulfillmentStatus[] = [
  'pending', 'ready_for_pickup', 'collected', 'packed', 'shipped', 'delivered', 'cancelled',
];
const FULFILLMENT_METHODS: readonly FulfillmentMethod[] = ['pickup', 'delivery', 'mixed'];
const ITEM_METHODS: readonly ItemFulfillmentMethod[] = ['pickup', 'delivery'];

function oneOf<T extends string>(values: readonly T[], value: unknown): T {
  if (typeof value === 'string' && (values as readonly string[]).includes(value)) return value as T;
  throw new Error('The order lookup returned an unexpected status');
}

function text(value: unknown): string {
  if (typeof value !== 'string') throw new Error('The order lookup returned a malformed order');
  return value;
}

function cents(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('The order lookup returned a malformed amount');
  }
  return value;
}

function toItem(value: unknown): LookedUpOrderItem {
  const row = (value ?? {}) as Record<string, unknown>;
  return {
    slug: text(row.slug),
    name: text(row.name),
    brand: text(row.brand),
    unitPriceCents: cents(row.unitPriceCents),
    quantity: cents(row.quantity),
    subtotalCents: cents(row.subtotalCents),
    fulfillmentMethod: oneOf(ITEM_METHODS, row.fulfillmentMethod),
  };
}

function toEvent(value: unknown): OrderStatusEvent {
  const row = (value ?? {}) as Record<string, unknown>;
  return { status: oneOf(FULFILLMENT_STATUSES, row.status), at: text(row.at) };
}

function optionalText(value: unknown): string | null {
  return value === null || value === undefined ? null : text(value);
}

/** Also reads my_orders() (customer-account-repository), which returns the same shape. */
export function toLookedUpOrder(value: unknown): LookedUpOrder {
  const row = (value ?? {}) as Record<string, unknown>;
  return {
    orderNumber: text(row.orderNumber),
    placedAt: text(row.placedAt),
    paymentStatus: oneOf(PAYMENT_STATUSES, row.paymentStatus),
    fulfillmentStatus: oneOf(FULFILLMENT_STATUSES, row.fulfillmentStatus),
    fulfillmentMethod: oneOf(FULFILLMENT_METHODS, row.fulfillmentMethod),
    totalCents: cents(row.totalCents),
    shippingCents: cents(row.shippingCents),
    refundCents: cents(row.refundCents),
    trackingNumber: optionalText(row.trackingNumber),
    items: Array.isArray(row.items) ? row.items.map(toItem) : [],
    history: Array.isArray(row.history) ? row.history.map(toEvent) : [],
  };
}

export async function lookUpOrder(input: OrderLookupInput): Promise<OrderLookupResult> {
  const { data, error } = await supabase.functions.invoke<unknown>('order-lookup', {
    body: input,
  });

  if (error) throw new Error('Could not look up the order');

  const body = (data ?? {}) as { found?: unknown; order?: unknown };
  if (body.found !== true) return { found: false };
  return { found: true, order: toLookedUpOrder(body.order) };
}
