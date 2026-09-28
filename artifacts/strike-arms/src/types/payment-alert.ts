/**
 * A payment Stripe took that no order on the site accounts for (migration
 * 029). Open until it is refunded in Stripe or an admin marks it handled.
 */
export type PaymentAlert = {
  id: string;
  stripePaymentIntent: string | null;
  amountCents: number | null;
  currency: string | null;
  customerEmail: string | null;
  /** Written by the webhook, in words the admin can show. */
  detail: string;
  createdAt: string;
};
