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

export type LookedUpOrder = {
  orderNumber: string;
  placedAt: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  fulfillmentMethod: FulfillmentMethod;
  totalCents: number;
  shippingCents: number;
  refundCents: number;
  items: LookedUpOrderItem[];
};

export type OrderLookupResult = { found: false } | { found: true; order: LookedUpOrder };

export type OrderLookupInput = { orderNumber: string; email: string };
