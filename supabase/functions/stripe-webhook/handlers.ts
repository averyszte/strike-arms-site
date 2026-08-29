import type Stripe from "npm:stripe@17.3.1";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

/**
 * What each Stripe event does to an order.
 *
 * Every handler is written to be safely repeatable: Stripe retries, and the
 * same event can legitimately arrive twice. The database functions these call
 * are all guarded on the order's current status, so a second delivery is a
 * no-op rather than a double stock decrement.
 */

type OrderRow = {
  id: string;
  total_cents: number;
  payment_status: string;
};

/**
 * The session tells us which order it belongs to via metadata we set when the
 * session was created. Falling back to stripe_session_id covers a session
 * created before the metadata write, which should not happen but costs nothing
 * to survive.
 */
async function findOrderForSession(
  admin: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<OrderRow | null> {
  const orderId = session.metadata?.order_id ?? null;

  const query = admin.from("orders").select("id, total_cents, payment_status");
  const { data, error } = orderId
    ? await query.eq("id", orderId).maybeSingle()
    : await query.eq("stripe_session_id", session.id).maybeSingle();

  if (error) throw new Error(`Could not load order for session: ${error.message}`);
  return (data as OrderRow | null) ?? null;
}

/**
 * Marks the order paid and turns its stock reservations into a real sale.
 *
 * The amount is checked against the total we stored when we created the
 * session. If they disagree, something is wrong on our side and we must not
 * fulfil the order silently — leave it pending for a human to look at.
 */
export async function handleCheckoutCompleted(
  admin: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<string> {
  const order = await findOrderForSession(admin, session);
  if (!order) return `no order found for session ${session.id}`;

  if (session.payment_status !== "paid") {
    return `session ${session.id} completed but is not paid yet`;
  }

  if ((session.currency ?? "").toLowerCase() !== "eur") {
    throw new Error(`session ${session.id} settled in ${session.currency}, expected eur`);
  }

  if (session.amount_total !== order.total_cents) {
    throw new Error(
      `amount mismatch on order ${order.id}: charged ${session.amount_total}, ` +
        `expected ${order.total_cents}`,
    );
  }

  const paymentIntentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id ?? null;

  const { data, error } = await admin.rpc("confirm_order_paid", {
    p_order_id: order.id,
    p_payment_intent_id: paymentIntentId,
    p_session_id: session.id,
  });

  if (error) throw new Error(`confirm_order_paid failed: ${error.message}`);
  return `order ${order.id} paid as ${data ?? "unnumbered"}`;
}

/** Releases the held stock when a shopper walks away from a session. */
export async function handleCheckoutExpired(
  admin: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<string> {
  const order = await findOrderForSession(admin, session);
  if (!order) return `no order found for expired session ${session.id}`;

  const { data, error } = await admin.rpc("expire_order", { p_order_id: order.id });
  if (error) throw new Error(`expire_order failed: ${error.message}`);

  return data ? `order ${order.id} expired` : `order ${order.id} was not pending`;
}

/**
 * Records money going back out. Stock is deliberately not returned: a refunded
 * item may have been damaged, kept, or never collected, so restocking is a
 * decision for the shop, made in the admin.
 */
export async function handleChargeRefunded(
  admin: SupabaseClient,
  charge: Stripe.Charge,
): Promise<string> {
  const paymentIntentId = typeof charge.payment_intent === "string"
    ? charge.payment_intent
    : charge.payment_intent?.id ?? null;

  if (!paymentIntentId) return `charge ${charge.id} has no payment intent`;

  const { data, error } = await admin.rpc("record_refund", {
    p_payment_intent_id: paymentIntentId,
    p_refund_cents: charge.amount_refunded,
    p_fully_refunded: charge.amount_refunded >= charge.amount,
  });

  if (error) throw new Error(`record_refund failed: ${error.message}`);
  return data
    ? `refund of ${charge.amount_refunded} recorded for ${paymentIntentId}`
    : `no refundable order for ${paymentIntentId}`;
}
