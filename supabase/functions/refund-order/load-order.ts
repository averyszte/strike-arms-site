import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { RefundRequestError } from "./parse-request.ts";

/**
 * What the order row says about whether it can be refunded, and for how much.
 *
 * Every one of these checks also exists in the browser, where it decides
 * whether the button is enabled. That copy is a convenience. This one is the
 * rule: the caller holds an admin session, and an admin session is a thing
 * that can craft its own request.
 */

export type RefundableOrder = {
  id: string;
  paymentIntentId: string;
  /** Total minus what has already gone back. Never negative. */
  refundableCents: number;
};

type OrderRow = {
  id: string;
  stripe_payment_intent: string | null;
  payment_method: string;
  payment_status: string;
  total_cents: number;
  refund_cents: number;
};

const REFUNDABLE_STATUSES = new Set(["paid", "partially_refunded"]);

export async function loadRefundableOrder(
  admin: SupabaseClient,
  orderId: string,
): Promise<RefundableOrder> {
  const { data, error } = await admin
    .from("orders")
    .select("id, stripe_payment_intent, payment_method, payment_status, total_cents, refund_cents")
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw new Error(`Could not read order: ${error.message}`);
  if (!data) throw new RefundRequestError("That order does not exist.");

  const order = data as OrderRow;

  // A counter sale taken in cash has no Stripe payment behind it. Refusing
  // here rather than letting Stripe 404 means the admin is told to hand the
  // money back the way it was taken, which is the actual answer.
  if (order.payment_method !== "stripe") {
    throw new RefundRequestError(
      "This order was not paid through Stripe, so there is nothing here to reverse.",
    );
  }

  if (!order.stripe_payment_intent) {
    throw new RefundRequestError("No Stripe payment is recorded against this order.");
  }

  if (!REFUNDABLE_STATUSES.has(order.payment_status)) {
    throw new RefundRequestError(
      order.payment_status === "refunded"
        ? "This order has already been refunded in full."
        : "This order has not been paid.",
    );
  }

  const refundableCents = Math.max(0, order.total_cents - order.refund_cents);
  if (refundableCents <= 0) {
    throw new RefundRequestError("There is nothing left to refund on this order.");
  }

  return { id: order.id, paymentIntentId: order.stripe_payment_intent, refundableCents };
}

/**
 * Null means the whole outstanding balance. Anything larger than that balance
 * is refused rather than clamped down to it: silently refunding less than the
 * admin typed is how you find out a month later that a customer was short.
 */
export function resolveRefundAmount(requested: number | null, refundableCents: number): number {
  if (requested === null) return refundableCents;

  if (requested > refundableCents) {
    throw new RefundRequestError(
      `Only €${(refundableCents / 100).toFixed(2)} is still refundable on this order.`,
    );
  }

  return requested;
}
