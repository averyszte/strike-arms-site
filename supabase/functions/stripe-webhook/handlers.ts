import type Stripe from "npm:stripe@17.3.1";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  euros,
  flagOrder,
  mismatchReasons,
  paymentIntentOf,
  recordUnmatchedPayment,
} from "./payment-alerts.ts";

/**
 * What each Checkout Session event does to an order.
 *
 * Every handler is written to be safely repeatable: Stripe retries, and the
 * same event can legitimately arrive twice. The database functions these call
 * are all guarded on the order's current status, and flag_order does not add
 * a reason that is already there, so a second delivery is a no-op rather than
 * a second order number, email or flag.
 */

type OrderRow = {
  id: string;
  total_cents: number;
  payment_status: string;
};

/**
 * Word for word the reason 040's confirm_order_paid writes, so that this
 * call and the database's own add one flag between them, not two. It is
 * here as well so the flag is raised even if the webhook is deployed against
 * a database that does not have 040 yet.
 */
const PAID_AFTER_ABANDON =
  "Paid after a newer checkout was started for the same basket. Check Stripe for a second charge.";

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
 * Money arrived for an order that no longer holds anything, or for an order
 * that is closed. Expired and failed orders are treated like money with no
 * order at all; anything else (already paid, refunded) is a late repeat.
 */
async function handleNotPayable(
  admin: SupabaseClient,
  order: OrderRow,
  session: Stripe.Checkout.Session,
  eventId: string,
): Promise<string> {
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

/**
 * Marks the order paid and gives it its order number.
 *
 * Instant payment methods only (D2): a session that completed without its
 * payment clearing is a delayed method someone switched on in the Stripe
 * dashboard. It is flagged for Alan and the order is not confirmed.
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
  const order = await findOrderForSession(admin, session);

  if (session.payment_status !== "paid") {
    if (!order) return `session ${session.id} completed unpaid, and no order matches it`;
    await flagOrder(
      admin,
      order.id,
      `Stripe says this checkout finished but the payment has not cleared (${session.payment_status}). ` +
        "Online checkout takes instant payments only, so the order was not confirmed. " +
        "Do not hand anything over until Stripe shows the payment as succeeded.",
    );
    return `session ${session.id} completed unpaid; order ${order.id} flagged, not confirmed`;
  }

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

  // No number means the order was not payable.
  if (!data) return await handleNotPayable(admin, order, session, eventId);

  const reasons = mismatchReasons(session, order.total_cents);
  if (order.payment_status === "abandoned") reasons.push(PAID_AFTER_ABANDON);

  if (reasons.length > 0) {
    // One call per reason: flag_order skips a reason already on the order,
    // and a joined string would not match the one 040 wrote on its own.
    for (const reason of reasons) await flagOrder(admin, order.id, reason);
    return `order ${order.id} paid as ${data}, flagged: ${reasons.join(" ")}`;
  }

  return `order ${order.id} paid as ${data}`;
}

/**
 * checkout.session.async_payment_succeeded and _failed. Under D2 these
 * should never arrive: they belong to delayed methods such as SEPA Debit,
 * which the session no longer offers. If one does, nothing about the order
 * changes; Alan is told what Stripe said so he can decide.
 */
export async function handleAsyncPayment(
  admin: SupabaseClient,
  session: Stripe.Checkout.Session,
  eventId: string,
  hasSucceeded: boolean,
): Promise<string> {
  const order = await findOrderForSession(admin, session);

  if (!order) {
    if (!hasSucceeded) return `delayed payment failed on session ${session.id}; no order matches it`;
    await recordUnmatchedPayment(
      admin,
      eventId,
      session,
      "it was a delayed payment, which online checkout does not accept, with no order matching it",
    );
    return `delayed payment on session ${session.id} with no order; recorded for the owner`;
  }

  const reason = hasSucceeded
    ? `Stripe reports a delayed payment of ${euros(session.amount_total)} has now cleared. ` +
      "Online checkout takes instant payments only, so the order was not confirmed automatically. " +
      "Check the payment in Stripe, then confirm or refund it."
    : "Stripe reports a delayed payment for this order failed. No money was taken.";

  await flagOrder(admin, order.id, reason);
  return `delayed payment ${hasSucceeded ? "succeeded" : "failed"} on order ${order.id}; flagged only`;
}

/**
 * Closes the order when a shopper walks away from a session. It becomes
 * 'expired': no money arrived, and nothing needs Alan.
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
