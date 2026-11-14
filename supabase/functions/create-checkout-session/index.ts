import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { corsHeadersFor, jsonResponse } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { CheckoutRequestError, parseCheckoutRequest } from "./parse-request.ts";
import { priceBasket } from "./order-lines.ts";
import { buildOrderInsert } from "./build-order.ts";
import { signedInCustomerId } from "./signed-in-customer.ts";
import { guardCheckout } from "./guard.ts";
import { type AlreadyPaid, clearStaleAttempt } from "./stale-attempt.ts";
import { openCheckoutSession } from "./open-session.ts";

/**
 * Creates the pending order, checks every item is in stock, and hands back a
 * Stripe Checkout URL. The order exists before the session so the amount
 * charged can be checked against a total we calculated and stored, rather
 * than trusted.
 *
 * Answers:
 *   200 { url, orderId }
 *   400 { error, code: "invalid_request" }   a message written here, safe to show
 *   409 { error, code: "already_paid", orderNumber, orderId, sessionId }
 *   429 / 4xx / 503 from the guard            { error, code }
 *   500 { error, code: "checkout_failed" }    detail in the function log only
 */

const ALREADY_PAID_MESSAGE =
  "Your earlier payment for this basket went through, so we have not taken another. " +
  "Check your email for the order confirmation.";

function alreadyPaidResponse(paid: AlreadyPaid, cors: Record<string, string>): Response {
  return jsonResponse(
    { error: ALREADY_PAID_MESSAGE, code: "already_paid", ...paid },
    409,
    cors,
  );
}

/**
 * Abandoned, not deleted: if Stripe created the session but the response was
 * lost, a payment on it must still find this order. A failed abandon is
 * logged; the order then waits for the stale-order sweep (M-008).
 */
async function abandonOrder(admin: SupabaseClient, orderId: string): Promise<void> {
  const { error } = await admin.rpc("abandon_order", { p_order_id: orderId });
  if (error) console.error("create-checkout-session could not abandon order", orderId, error.message);
}

async function handle(req: Request, cors: Record<string, string>): Promise<Response> {
  const request = parseCheckoutRequest(await req.json());
  const admin = createAdminClient();

  const refusal = await guardCheckout(admin, req, request.attemptId, request.turnstileToken);
  if (refusal) return jsonResponse({ error: refusal.error, code: refusal.code }, refusal.status, cors);

  const paid = await clearStaleAttempt(admin, request.attemptId);
  if (paid) return alreadyPaidResponse(paid, cors);

  const [basket, userId] = await Promise.all([
    priceBasket(admin, request.lines, request.wantsDelivery),
    signedInCustomerId(admin, req),
  ]);

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert(buildOrderInsert(request, basket, userId))
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error(`Could not create order: ${orderError?.message ?? "no row"}`);
  }

  const orderId = order.id as string;

  try {
    const url = await openCheckoutSession(admin, orderId, request, basket);
    return jsonResponse({ url, orderId }, 200, cors);
  } catch (error) {
    await abandonOrder(admin, orderId);
    throw error;
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = corsHeadersFor(req);

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405, cors);

  try {
    return await handle(req, cors);
  } catch (error) {
    // Only CheckoutRequestError messages reach the shopper. They are written
    // in parse-request.ts, order-lines.ts and open-session.ts from our own
    // words and product names, never from a database or Stripe error (M-009).
    if (error instanceof CheckoutRequestError) {
      return jsonResponse({ error: error.message, code: "invalid_request" }, 400, cors);
    }

    console.error("create-checkout-session failed", error);
    return jsonResponse(
      { error: "Checkout is temporarily unavailable. Please try again.", code: "checkout_failed" },
      500,
      cors,
    );
  }
});
