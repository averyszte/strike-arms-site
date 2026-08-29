import Stripe from "npm:stripe@17.3.1";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { corsHeadersFor, jsonResponse } from "../_shared/cors.ts";
import { requireEnv } from "../_shared/env.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { CheckoutRequestError, parseCheckoutRequest } from "./parse-request.ts";
import { priceBasket, type PricedBasket } from "./order-lines.ts";
import { buildOrderInsert, buildStripeLineItems } from "./build-order.ts";

/**
 * Creates the pending order, holds the stock, and hands back a Stripe Checkout
 * URL. The order exists before the session so the amount charged can be
 * checked against a total we calculated and stored, rather than trusted.
 */

// Stripe's session lifetime, and how long stock is held for it. The hold must
// outlive the session: if the reservation expired first, a shopper could pay
// for stock that had already been sold to someone else. Stripe requires a
// session expiry of at least 30 minutes.
const SESSION_MINUTES = 30;
const RESERVATION_MINUTES = 35;

// Pinned explicitly so that upgrading the SDK and moving the API version stay
// two separate, reviewable decisions.
const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-11-20.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

async function reserveOrFail(
  admin: SupabaseClient,
  orderId: string,
  basket: PricedBasket,
  expiresAt: Date,
): Promise<void> {
  const { data: unavailableId, error } = await admin.rpc("reserve_order_stock", {
    p_order_id: orderId,
    p_lines: basket.lines.map((line) => ({
      product_id: line.productId,
      quantity: line.quantity,
    })),
    p_expires_at: expiresAt.toISOString(),
  });

  if (error) throw new Error(`Could not reserve stock: ${error.message}`);
  if (!unavailableId) return;

  const soldOut = basket.lines.find((line) => line.productId === unavailableId);
  throw new CheckoutRequestError(
    `${soldOut?.productName ?? "An item in your basket"} is no longer available ` +
      `in that quantity. Please adjust your basket and try again.`,
  );
}

async function handle(req: Request, cors: Record<string, string>): Promise<Response> {
  const request = parseCheckoutRequest(await req.json());
  const admin = createAdminClient();

  // A retry of the same attempt would otherwise leave the first attempt's
  // order holding stock until its reservation lapsed.
  await admin.rpc("clear_stale_checkout_attempt", { p_attempt_id: request.attemptId });

  const basket = await priceBasket(admin, request.lines, request.wantsDelivery);

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert(buildOrderInsert(request, basket))
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error(`Could not create order: ${orderError?.message ?? "no row"}`);
  }

  const orderId = order.id as string;

  try {
    await reserveOrFail(
      admin,
      orderId,
      basket,
      new Date(Date.now() + RESERVATION_MINUTES * 60_000),
    );

    const { error: itemsError } = await admin.from("order_items").insert(
      basket.lines.map((line) => ({
        order_id: orderId,
        product_id: line.productId,
        product_slug: line.productSlug,
        product_name: line.productName,
        product_image: line.productImage,
        brand: line.brand,
        unit_price_cents: line.unitPriceCents,
        quantity: line.quantity,
        fulfillment_method: line.fulfillmentMethod,
      })),
    );

    if (itemsError) throw new Error(`Could not save order items: ${itemsError.message}`);

    const siteUrl = requireEnv("SITE_URL").replace(/\/$/, "");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "eur",
      line_items: buildStripeLineItems(basket),
      customer_email: request.customerEmail,
      expires_at: Math.floor(Date.now() / 1000) + SESSION_MINUTES * 60,
      success_url: `${siteUrl}/checkout/success?order=${orderId}`,
      cancel_url: `${siteUrl}/cart`,
      metadata: { order_id: orderId },
      payment_intent_data: { metadata: { order_id: orderId } },
    }, {
      // A double-clicked checkout reuses one session instead of opening two.
      idempotencyKey: `checkout-session:${orderId}`,
    });

    // Best effort: the webhook correlates on metadata.order_id, so a failure
    // here must not undo a session the shopper can already pay on.
    await admin
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", orderId);

    return jsonResponse({ url: session.url, orderId }, 200, cors);
  } catch (error) {
    await admin.rpc("release_order_reservations", { p_order_id: orderId });
    await admin.from("orders").delete().eq("id", orderId);
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
    if (error instanceof CheckoutRequestError) {
      return jsonResponse({ error: error.message }, 400, cors);
    }

    console.error("create-checkout-session failed", error);
    return jsonResponse(
      { error: "Checkout is temporarily unavailable. Please try again." },
      500,
      cors,
    );
  }
});
