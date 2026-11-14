import type Stripe from "npm:stripe@17.3.1";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { euros, flagOrder, paymentIntentOf } from "./payment-alerts.ts";

/**
 * Money going back out, and money the customer's bank is trying to take back.
 * Whether the product is back in stock is a decision for the shop, made in
 * the admin, so none of these touch stock.
 */

/**
 * charge.refunded carries Stripe's running total for the charge, so
 * record_refund converges on it whatever order the events arrive in.
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

/**
 * charge.refund.updated: one refund changed status, most often a refund that
 * later failed at the customer's bank. record_stripe_refund (041) keeps the
 * ledger row by refund id and flags the order when the refund failed or was
 * cancelled, so the admin can see the customer may not have their money.
 */
export async function handleRefundUpdated(
  admin: SupabaseClient,
  refund: Stripe.Refund,
): Promise<string> {
  const paymentIntentId = paymentIntentOf(refund.payment_intent);
  if (!paymentIntentId) return `refund ${refund.id} has no payment intent`;
  if (!refund.status) return `refund ${refund.id} has no status yet`;

  const { data, error } = await admin.rpc("record_stripe_refund", {
    p_payment_intent_id: paymentIntentId,
    p_refund_id: refund.id,
    p_amount_cents: refund.amount,
    p_status: refund.status,
  });
  if (error) throw new Error(`record_stripe_refund failed: ${error.message}`);

  return data
    ? `refund ${refund.id} recorded as ${refund.status} for ${paymentIntentId}`
    : `no refundable order for ${paymentIntentId}`;
}

function dueDate(dispute: Stripe.Dispute): string {
  const dueBy = dispute.evidence_details?.due_by ?? null;
  if (dueBy === null) return "check Stripe for the deadline";
  const date = new Date(dueBy * 1000).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Dublin",
  });
  return `respond in Stripe by ${date}`;
}

/**
 * charge.dispute.created: the customer has asked their bank to reverse the
 * payment. Nothing about the order changes; Alan needs to know, because a
 * dispute is lost by default if nobody answers it in Stripe.
 */
export async function handleDisputeCreated(
  admin: SupabaseClient,
  dispute: Stripe.Dispute,
): Promise<string> {
  const paymentIntentId = paymentIntentOf(dispute.payment_intent);
  if (!paymentIntentId) {
    console.error("stripe-webhook dispute with no payment intent", dispute.id);
    return `dispute ${dispute.id} has no payment intent`;
  }

  const { data, error } = await admin
    .from("orders")
    .select("id")
    .eq("stripe_payment_intent", paymentIntentId)
    .limit(1);
  if (error) throw new Error(`Could not load order for dispute: ${error.message}`);

  const orderId = (data as { id: string }[] | null)?.[0]?.id ?? null;
  if (!orderId) {
    console.error("stripe-webhook dispute matches no order", dispute.id, paymentIntentId);
    return `dispute ${dispute.id} matches no order`;
  }

  await flagOrder(
    admin,
    orderId,
    `The customer has disputed ${euros(dispute.amount)} of this payment with their bank ` +
      `(dispute ${dispute.id}, reason: ${dispute.reason.replace(/_/g, " ")}); ${dueDate(dispute)}.`,
  );
  return `dispute ${dispute.id} flagged on order ${orderId}`;
}
