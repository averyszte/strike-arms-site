/** What checkout-status says about the order the success page came back from. */
export type CheckoutPaymentStatus = 'paid' | 'pending' | 'closed' | 'unknown';

export type CheckoutStatus = {
  status: CheckoutPaymentStatus;
  orderNumber: string | null;
};
