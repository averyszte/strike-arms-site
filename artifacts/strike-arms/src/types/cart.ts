import type { ItemFulfillmentMethod } from '@/types/order';

/**
 * A basket line as the browser holds it.
 *
 * The price and name are stored so the cart can render without refetching the
 * catalogue, and so a saved cart survives a reload. They are display values
 * only — the checkout function re-reads every price from the database, so a
 * tampered basket in localStorage changes what the shopper sees and nothing
 * about what they are charged.
 */
export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string | null;
  unitPriceCents: number;
  quantity: number;
  isShippable: boolean;
};

export type CartTotals = {
  itemsSubtotalCents: number;
  deliverableSubtotalCents: number;
  shippingCents: number;
  totalCents: number;
  vatCents: number;
  itemCount: number;
  hasPickupItems: boolean;
  hasShippableItems: boolean;
};

export type CartLineFulfillment = ItemFulfillmentMethod;

/** What the checkout form collects, before the server prices anything. */
export type CheckoutDetails = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ageConfirmed: boolean;
  wantsDelivery: boolean;
  shippingName: string;
  shippingLine1: string;
  shippingLine2: string;
  shippingCity: string;
  shippingCounty: string;
  shippingEircode: string;
};
