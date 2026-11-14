import type Stripe from "npm:stripe@17.3.1";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

/**
 * The owner-facing side of the webhook: what it tells Alan when Stripe
 * reports something the orders cannot explain on their own (migration 029).
 */

export function euros(cents: number | null): string {
  return cents === null ? "an unknown amount" : `€${(cents / 100).toFixed(2)}`;
}

export function paymentIntentOf(
  value: string | { id: string } | null | undefined,
): string | null {
  return typeof value === "string" ? value : value?.id ?? null;
}

/**
 * Why a paid session does not match its order, in words the admin shows, or
 * an empty list when it matches. Nothing here stops the order being
 * confirmed: the money has been taken either way, and a flagged paid order
 * is something Alan can act on where a pending one is not.
 */
export function mismatchReasons(
  session: Stripe.Checkout.Session,
  expectedCents: number,
): string[] {
  const currency = (session.currency ?? "").toLowerCase();
  if (currency !== "eur") {
    return [
      `Stripe charged in ${currency.toUpperCase() || "an unknown currency"}, not euro. ` +
        "Check the payment in Stripe before handing anything over.",
    ];
  }
  if (session.amount_total !== expectedCents) {
    return [
      `Stripe charged ${euros(session.amount_total)}, but the order total was ` +
        `${euros(expectedCents)}. Check the payment in Stripe before handing anything over.`,
    ];
  }
  return [];
}

/**
 * Puts a reason on the order for the admin's attention list (029). Appends,
 * and skips a reason the order already carries, so a redelivered event does
 * not say it twice.
 */
export async function flagOrder(
  admin: SupabaseClient,
  orderId: string,
  reason: string,
): Promise<void> {
  const { error } = await admin.rpc("flag_order", { p_order_id: orderId, p_reason: reason });
  if (error) throw new Error(`flag_order failed: ${error.message}`);
}

/**
 * Money taken on a session no order accounts for. Keyed on the event id, so a
 * redelivered event does not record it twice.
 */
export async function recordUnmatchedPayment(
  admin: SupabaseClient,
  eventId: string,
  session: Stripe.Checkout.Session,
  why = "no order on this site matches it",
): Promise<void> {
  const { error } = await admin.from("payment_alerts").upsert({
    kind: "no_order",
    stripe_event_id: eventId,
    stripe_session_id: session.id,
    stripe_payment_intent: paymentIntentOf(session.payment_intent),
    amount_cents: session.amount_total,
    currency: session.currency,
    customer_email: session.customer_details?.email ?? session.customer_email ?? null,
    detail:
      `Stripe took ${euros(session.amount_total)} and ${why}. ` +
      "Refund it in Stripe, or mark it handled if it was sold some other way.",
  }, { onConflict: "stripe_event_id", ignoreDuplicates: true });

  if (error) throw new Error(`Could not record unmatched payment: ${error.message}`);
}
