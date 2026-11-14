import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { stripe } from "./stripe-client.ts";

/**
 * A retry of the same checkout attempt (same basket, same tab or another).
 *
 * Before M-003 the earlier order was abandoned and its session expired
 * without asking Stripe whether it had already been paid, so a shopper who
 * paid in one tab and retried in another was charged twice. Now:
 *   - if any earlier order for the attempt is paid, or its Stripe session
 *     has completed or been paid, nothing is abandoned and the caller
 *     answers 409 already_paid;
 *   - otherwise each earlier session still open is expired, and only then
 *     are the pending orders abandoned (abandoned, not deleted, so a
 *     payment still in flight finds its order and the webhook flags it).
 *
 * Fails closed: if Stripe cannot be asked, or a session cannot be expired,
 * this throws and no second session is opened. The shopper sees "try again",
 * which is far better than paying twice.
 */

export type AlreadyPaid = {
  orderId: string | null;
  orderNumber: string | null;
  sessionId: string | null;
};

type AttemptOrder = {
  id: string;
  order_number: string | null;
  payment_status: string;
  stripe_session_id: string | null;
};

const PAID_STATUSES = new Set(["paid", "partially_refunded"]);

// An abandoned order's session is checked too: before M-003 a failed expire
// was ignored, so an abandoned order can still have a session that was paid.
const SESSION_STATUSES = new Set(["pending", "abandoned"]);

/** True when the session has taken, or is taking, the shopper's money. */
async function closeSession(sessionId: string): Promise<boolean> {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.status === "complete" || session.payment_status === "paid") return true;
  // Throws if it completed in the moment since we looked, which is what we want.
  if (session.status === "open") await stripe.checkout.sessions.expire(sessionId);
  return false;
}

async function loadAttemptOrders(
  admin: SupabaseClient,
  attemptId: string,
): Promise<AttemptOrder[]> {
  const { data, error } = await admin
    .from("orders")
    .select("id, order_number, payment_status, stripe_session_id")
    .eq("checkout_attempt_id", attemptId);
  if (error) throw new Error(`Could not load earlier orders for the attempt: ${error.message}`);
  return (data ?? []) as AttemptOrder[];
}

function alreadyPaid(order: AttemptOrder): AlreadyPaid {
  return {
    orderId: order.id,
    orderNumber: order.order_number,
    sessionId: order.stripe_session_id,
  };
}

/** Null when the new checkout may go ahead. Throws to fail closed. */
export async function clearStaleAttempt(
  admin: SupabaseClient,
  attemptId: string,
): Promise<AlreadyPaid | null> {
  const orders = await loadAttemptOrders(admin, attemptId);

  const paid = orders.find((order) => PAID_STATUSES.has(order.payment_status));
  if (paid) return alreadyPaid(paid);

  const checked = new Set<string>();
  for (const order of orders) {
    if (!SESSION_STATUSES.has(order.payment_status) || !order.stripe_session_id) continue;
    checked.add(order.stripe_session_id);
    if (await closeSession(order.stripe_session_id)) return alreadyPaid(order);
  }

  const { data, error } = await admin.rpc("clear_stale_checkout_attempt", {
    p_attempt_id: attemptId,
  });
  if (error) throw new Error(`clear_stale_checkout_attempt failed: ${error.message}`);

  // A session written between our read and the abandon (a double submit) has
  // not been looked at yet. If it was paid, the webhook confirms and flags its
  // order; this checkout still must not open a second session.
  for (const sessionId of (data ?? []) as string[]) {
    if (checked.has(sessionId)) continue;
    if (await closeSession(sessionId)) return { orderId: null, orderNumber: null, sessionId };
  }
  return null;
}
