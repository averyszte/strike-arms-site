import type {
  FulfillmentMethod,
  FulfillmentStatus,
  ItemFulfillmentMethod,
  PaymentStatus,
} from '@/types/database-rows';

/** What the order-lookup Edge Function returns. No name, address or phone. */

export type LookedUpOrderItem = {
  slug: string;
  name: string;
  brand: string;
  unitPriceCents: number;
  quantity: number;
  subtotalCents: number;
  fulfillmentMethod: ItemFulfillmentMethod;
};

/** One fulfilment step and when it happened, from order_status_log. */
export type OrderStatusEvent = { status: FulfillmentStatus; at: string };

export type LookedUpOrder = {
  orderNumber: string;
  placedAt: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  fulfillmentMethod: FulfillmentMethod;
  totalCents: number;
  shippingCents: number;
  refundCents: number;
  /** An Post number for posted items, when the shop has added one. */
  trackingNumber: string | null;
  items: LookedUpOrderItem[];
  /** Oldest first. */
  history: OrderStatusEvent[];
};

export type OrderLookupResult = { found: false } | { found: true; order: LookedUpOrder };

export type OrderLookupInput = {
  orderNumber: string;
  email: string;
  /** From the Turnstile widget; null when the site has no key (local). */
  turnstileToken: string | null;
};
