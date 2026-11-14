import Stripe from "npm:stripe@17.3.1";
import { corsHeadersFor, jsonResponse } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { createCallerClient } from "../_shared/supabase-caller.ts";
import { parseRefundRequest, RefundRequestError } from "./parse-request.ts";
import { loadRefundableOrder, resolveRefundAmount } from "./load-order.ts";
import { recordRefund, refundableCents } from "./refund-balance.ts";
import { stripe } from "./stripe-client.ts";

/**
 * Sends money back out. Called from the admin order sheet.
 *
 * The refund is written to the ledger as soon as Stripe accepts it, through
 * record_stripe_refund (041, M-006), so the order shows it straight away and
 * a second click cannot send it again. That function is idempotent on the
 * refund id, so the webhook's charge.refunded and charge.refund.updated
 * recording the same refund later change nothing. If the write fails the
 * answer is still 200 with isRecorded false: the money has moved, and the
 * webhook records it.
 *
 * Answers 200 { refundId, amountCents, status, isRecorded }, or { error }
 * with 400 (bad request, or Stripe refused), 403, 409 (key reused) or 500.
 *
 * Stock is not returned either, for the reason the webhook already gives: a
 * refunded item may have been damaged, kept, or never collected.
 *
 * Two gates, because one is not enough. config.toml sets verify_jwt so the
 * gateway rejects anything without a valid Supabase session, and the AAL2
 * check below rejects every session that is not an admin who has passed TOTP
 * -- the same bar as writing a product price.
 */

class ForbiddenError extends Error {}

/**
 * Runs is_admin_aal2() as the caller, not as the service role. The RPC reads
 * the session's assurance level out of the JWT, so it has to be asked with the
 * caller's own token -- asking with the service key would answer a different
 * question and answer it wrongly.
 */
async function requireAal2Admin(req: Request): Promise<void> {
  const authorization = req.headers.get("authorization") ?? "";
  if (!authorization) throw new ForbiddenError("No session.");

  const caller = createCallerClient(authorization);

  const { data, error } = await caller.rpc("is_admin_aal2");
  if (error) {
    // The detail stays in the log (M-009).
    console.error("refund-order could not verify the session", error.message);
    throw new ForbiddenError("Could not verify the session. Sign in again and retry.");
  }
  if (data !== true) {
    throw new ForbiddenError(
      "Refunds need an admin session that has passed two-factor verification.",
    );
  }
}

async function handle(req: Request, cors: Record<string, string>): Promise<Response> {
  await requireAal2Admin(req);

  const request = parseRefundRequest(await req.json());
  const admin = createAdminClient();

  const order = await loadRefundableOrder(admin, request.orderId);
  const balanceCents = await refundableCents(admin, order);
  if (balanceCents <= 0) {
    throw new RefundRequestError(
      "Stripe shows nothing left to refund on this order. It may still be catching up; reload the order.",
    );
  }
  const amountCents = resolveRefundAmount(request.amountCents, balanceCents);

  const refund = await stripe.refunds.create(
    {
      payment_intent: order.paymentIntentId,
      amount: amountCents,
      ...(request.reason ? { reason: request.reason as Stripe.RefundCreateParams.Reason } : {}),
      metadata: { order_id: order.id },
    },
    // Bound to the amount as well as the dialog (M-006): an edited amount is a
    // new refund rather than a replay of the first one.
    { idempotencyKey: `refund:${order.id}:${request.attemptId}:${amountCents}` },
  );

  const isRecorded = await recordRefund(admin, order.paymentIntentId, refund);

  return jsonResponse(
    { refundId: refund.id, amountCents: refund.amount, status: refund.status ?? "unknown", isRecorded },
    200,
    cors,
  );
}

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = corsHeadersFor(req);

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405, cors);

  try {
    return await handle(req, cors);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return jsonResponse({ error: error.message }, 403, cors);
    }
    if (error instanceof RefundRequestError) {
      return jsonResponse({ error: error.message }, 400, cors);
    }
    if (error instanceof Stripe.errors.StripeIdempotencyError) {
      console.error("refund-order: idempotency key reused", error.message);
      return jsonResponse(
        { error: "This refund was already sent with different details. Close the dialog and open it again." },
        409,
        cors,
      );
    }
    // Stripe's own refusals are worth reading: "charge_already_refunded" and
    // "insufficient funds in the Stripe balance" are both things the admin can
    // act on, and neither is a fault in this function.
    if (error instanceof Stripe.errors.StripeError) {
      console.error("refund-order: Stripe refused", error.code, error.message);
      return jsonResponse({ error: `Stripe refused the refund: ${error.message}` }, 400, cors);
    }

    console.error("refund-order failed", error);
    return jsonResponse({ error: "The refund could not be sent. Please try again." }, 500, cors);
  }
});
