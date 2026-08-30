/**
 * The request body for a refund, checked before anything reaches Stripe.
 *
 * The amount is read here but not trusted here: index.ts recomputes what is
 * actually refundable from the order row and clamps against that. This file
 * only rejects shapes that are not numbers at all.
 */

export class RefundRequestError extends Error {}

export type RefundRequest = {
  orderId: string;
  /** Null means "everything still outstanding on this order". */
  amountCents: number | null;
  /**
   * Generated once when the admin opens the dialog, so a double-click sends
   * the same idempotency key and Stripe returns the first refund instead of
   * issuing a second. A deliberate second refund opens the dialog again and
   * gets a new id -- the same shape as checkout_attempt_id.
   */
  attemptId: string;
  reason: string | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Stripe's own vocabulary. Anything else is rejected rather than passed on. */
const REASONS = new Set(["duplicate", "fraudulent", "requested_by_customer"]);

function readString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new RefundRequestError(`${field} is required.`);
  }
  return value.trim();
}

export function parseRefundRequest(body: unknown): RefundRequest {
  if (typeof body !== "object" || body === null) {
    throw new RefundRequestError("Malformed request.");
  }

  const input = body as Record<string, unknown>;
  const orderId = readString(input.orderId, "orderId");
  const attemptId = readString(input.attemptId, "attemptId");

  if (!UUID.test(orderId)) throw new RefundRequestError("orderId is not an order id.");
  if (!UUID.test(attemptId)) throw new RefundRequestError("attemptId is not an id.");

  let amountCents: number | null = null;
  if (input.amountCents !== undefined && input.amountCents !== null) {
    const amount = input.amountCents;
    if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0) {
      throw new RefundRequestError("The refund amount must be a whole number of cents.");
    }
    amountCents = amount;
  }

  let reason: string | null = null;
  if (typeof input.reason === "string" && input.reason !== "") {
    if (!REASONS.has(input.reason)) throw new RefundRequestError("Unknown refund reason.");
    reason = input.reason;
  }

  return { orderId, amountCents, attemptId, reason };
}
