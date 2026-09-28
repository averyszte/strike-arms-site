import type Stripe from "npm:stripe@17.3.1";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { mismatchReasons, paymentIntentOf, recordUnmatchedPayment } from "./payment-alerts.ts";

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
 * Also the handler for checkout.session.async_payment_succeeded, which carries
 * the same session once a delayed method settles. v1 is meant to run on
 * instant methods only (D4), but if a delayed one is ever switched on in the
 * Stripe dashboard the order is still confirmed rather than left pending.
 *
 * Nothing here throws on bad data, because a throw asks Stripe to retry and
 * a retry of bad data fails the same way for three days. Money with no order
 * is recorded for the dashboard; money that does not match its order confirms
 * the order and flags it.
 */
export async function handleCheckoutCompleted(
  admin: SupabaseClient,
  session: Stripe.Checkout.Session,
  eventId: string,
): Promise<string> {
  if (session.payment_status !== "paid") {
    return `session ${session.id} completed, waiting on a delayed payment method`;
  }

  const order = await findOrderForSession(admin, session);
  if (!order) {
    await recordUnmatchedPayment(admin, eventId, session);
    return `no order found for paid session ${session.id}; recorded for the owner`;
  }

  const { data, error } = await admin.rpc("confirm_order_paid", {
    p_order_id: order.id,
    p_payment_intent_id: paymentIntentOf(session.payment_intent),
    p_session_id: session.id,
  });

  if (error) throw new Error(`confirm_order_paid failed: ${error.message}`);

  // No number means the order was not payable. If it had already been paid
  // and refunded this is a late repeat and there is nothing to do; if it had
  // expired, money arrived for an order that no longer holds anything, which
  // is treated like money with no order at all.
  if (!data) {
    if (order.payment_status !== "expired" && order.payment_status !== "failed") {
      return `order ${order.id} is ${order.payment_status}; nothing to confirm`;
    }
    await recordUnmatchedPayment(
      admin,
      eventId,
      session,
      "its order had already expired, so it was not confirmed",
    );
    return `order ${order.id} had expired; payment recorded for the owner`;
  }

  const reasons = mismatchReasons(session, order.total_cents);
  if (reasons.length > 0) {
    const { error: flagError } = await admin.rpc("flag_order", {
      p_order_id: order.id,
      p_reason: reasons.join(" "),
    });
    if (flagError) throw new Error(`flag_order failed: ${flagError.message}`);
    return `order ${order.id} paid as ${data}, flagged: ${reasons.join(" ")}`;
  }

  return `order ${order.id} paid as ${data}`;
}

/**
 * Releases the held stock when a shopper walks away from a session, or when a
 * delayed payment method fails (checkout.session.async_payment_failed). Both
 * leave the order 'expired': no money arrived, and nothing needs Alan.
 */
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
  const paymentIntentId = paymentIntentOf(charge.payment_intent);

  if (!paymentIntentId) return `charge ${charge.id} has no payment intent`;

  const { data, error } = await admin.rpc("record_refund", {
    p_payment_intent_id: paymentIntentId,
    p_refund_cents: charge.amount_refunded,
    p_fully_refunded: charge.amount_refunded >= charge.amount,
  });

  if (error) throw new Error(`record_refund failed: ${error.message}`);
  if (data) return `refund of ${charge.amount_refunded} recorded for ${paymentIntentId}`;

  // No order to record it on. If it was a payment with no order, refunding it
  // is what settles that alert.
  const { data: resolved, error: resolveError } = await admin.rpc("resolve_payment_alert", {
    p_payment_intent_id: paymentIntentId,
  });
  if (resolveError) throw new Error(`resolve_payment_alert failed: ${resolveError.message}`);
  return resolved
    ? `refund settled the unmatched payment ${paymentIntentId}`
    : `no refundable order for ${paymentIntentId}`;
}
