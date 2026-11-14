import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { stripe } from "./stripe-client.ts";
import type { RefundableOrder } from "./load-order.ts";

/**
 * What is still refundable, counting what Stripe says has gone back as well
 * as what the order row says (M-006).
 *
 * The row can lag Stripe: a refund taken in the Stripe dashboard is only on
 * the row once its webhook lands, and a refund this function sent may not
 * have been recorded if the write after it failed. Taking the larger of the
 * two means a second click cannot send the same money twice.
 *
 * Cash refunds and voids (041) are not in Stripe's charge total, so they are
 * added to it, the same way record_refund does.
 */
export async function refundableCents(
  admin: SupabaseClient,
  order: RefundableOrder,
): Promise<number> {
  const intent = await stripe.paymentIntents.retrieve(order.paymentIntentId, {
    expand: ["latest_charge"],
  });
  const charge = typeof intent.latest_charge === "object" ? intent.latest_charge : null;
  const stripeRefunded = charge?.amount_refunded ?? 0;

  const { data: manual, error } = await admin.rpc("manual_refunded_cents", {
    p_order_id: order.id,
  });
  if (error) throw new Error(`manual_refunded_cents failed: ${error.message}`);

  const alreadyBack = Math.max(order.refundCents, stripeRefunded + (Number(manual) || 0));
  return Math.max(0, order.totalCents - alreadyBack);
}

/**
 * Writes the refund to the ledger straight away (041), so the admin sees it
 * on the order now rather than when charge.refunded arrives. Idempotent on
 * the refund id, so the webhook recording it again changes nothing.
 *
 * Never throws. The money has already moved; a failure here is logged and
 * reported back as isRecorded false, and the webhook records it anyway.
 */
export async function recordRefund(
  admin: SupabaseClient,
  paymentIntentId: string,
  refund: { id: string; amount: number; status: string | null },
): Promise<boolean> {
  try {
    const { data, error } = await admin.rpc("record_stripe_refund", {
      p_payment_intent_id: paymentIntentId,
      p_refund_id: refund.id,
      p_amount_cents: refund.amount,
      p_status: refund.status ?? "pending",
    });
    if (error) {
      console.error("refund-order could not record refund", refund.id, error.message);
      return false;
    }
    return data === true;
  } catch (error) {
    console.error("refund-order could not record refund", refund.id, error);
    return false;
  }
}
