/**
 * The rates that decide what a customer is charged.
 *
 * These used to be constants in two files. They now live in the single
 * store_settings row (migration 010) so the cart and the checkout function
 * cannot quote different numbers. See lib/shipping.ts.
 */
export type StoreRates = {
  shippingFlatCents: number;
  freeShippingThresholdCents: number;
  vatRateBasisPoints: number;
};
