import Stripe from "npm:stripe@17.3.1";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeadersFor, jsonResponse } from "../_shared/cors.ts";
import { requireEnv } from "../_shared/env.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { parseRefundRequest, RefundRequestError } from "./parse-request.ts";
import { loadRefundableOrder, resolveRefundAmount } from "./load-order.ts";

/**
 * Sends money back out. Called from the admin order sheet.
 *
 * The order row is deliberately NOT updated here. charge.refunded reaches the
 * webhook, which calls record_refund, and that stays the only writer of refund
 * state -- so a refund taken in the Stripe dashboard and a refund taken in the
 * admin end up recorded by the same code path rather than by two that can
 * disagree. The cost is a few seconds where the admin has been told Stripe
 * accepted it and the badge has not caught up; the UI says so.
 *
 * Stock is not returned either, for the reason the webhook already gives: a
 * refunded item may have been damaged, kept, or never collected.
 *
 * Two gates, because one is not enough. config.toml sets verify_jwt so the
 * gateway rejects anything without a valid Supabase session, and the AAL2
 * check below rejects every session that is not an admin who has passed TOTP
 * -- the same bar as writing a product price.
 */

const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-11-20.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

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

  const caller = createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_ANON_KEY"),
    {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );

  const { data, error } = await caller.rpc("is_admin_aal2");
  if (error) throw new ForbiddenError(`Could not verify the session: ${error.message}`);
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
  const amountCents = resolveRefundAmount(request.amountCents, order.refundableCents);

  const refund = await stripe.refunds.create(
    {
      payment_intent: order.paymentIntentId,
      amount: amountCents,
      ...(request.reason ? { reason: request.reason as Stripe.RefundCreateParams.Reason } : {}),
      metadata: { order_id: order.id },
    },
    { idempotencyKey: `refund:${order.id}:${request.attemptId}` },
  );

  return jsonResponse(
    { refundId: refund.id, amountCents, status: refund.status ?? "unknown" },
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
