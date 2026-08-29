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

/**
 * What the basket can work out on its own, without knowing any rates. The
 * header badge and the fulfilment choice need only this, so neither has to
 * wait on a network read.
 */
export type CartBasics = {
  itemsSubtotalCents: number;
  deliverableSubtotalCents: number;
  itemCount: number;
  hasPickupItems: boolean;
  hasShippableItems: boolean;
};

/**
 * What the basket cannot work out until the store's rates have been read.
 * Modelled separately, and handed around as `CartPricing | null`, so that
 * "we do not know the delivery charge yet" is a state the UI has to handle
 * rather than a wrong number it can accidentally render.
 */
export type CartPricing = {
  shippingCents: number;
  totalCents: number;
  vatCents: number;
  /** Carried so the summary can show the free-delivery shortfall nudge. */
  freeShippingThresholdCents: number;
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
