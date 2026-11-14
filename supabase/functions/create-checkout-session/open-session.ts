import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { requireEnv } from "../_shared/env.ts";
import { buildStripeLineItems } from "./build-order.ts";
import type { PricedBasket } from "./order-lines.ts";
import { CheckoutRequestError, type CheckoutRequest } from "./parse-request.ts";
import { stripe } from "./stripe-client.ts";

/**
 * Everything between the pending order row existing and the shopper being
 * handed a Stripe URL. Any throw here leaves the caller to abandon the order.
 */

// Stripe's session lifetime. Stripe requires at least 30 minutes.
const SESSION_MINUTES = 30;

/**
 * Refuses the basket if any product is marked out of stock. Nothing is held:
 * the shop does not count stock (038). The function keeps its 028 name and
 * arguments so the database and this function can be deployed in any order.
 */
async function requireInStock(
  admin: SupabaseClient,
  orderId: string,
  basket: PricedBasket,
): Promise<void> {
  const { data: unavailableId, error } = await admin.rpc("reserve_order_stock", {
    p_order_id: orderId,
    p_lines: basket.lines.map((line) => ({
      product_id: line.productId,
      quantity: line.quantity,
    })),
    p_expires_at: new Date().toISOString(),
  });

  if (error) throw new Error(`Could not check stock: ${error.message}`);
  if (!unavailableId) return;

  const soldOut = basket.lines.find((line) => line.productId === unavailableId);
  throw new CheckoutRequestError(
    `${soldOut?.productName ?? "An item in your basket"} is out of stock. ` +
      `Please remove it from your basket and try again.`,
  );
}

async function saveOrderItems(
  admin: SupabaseClient,
  orderId: string,
  basket: PricedBasket,
): Promise<void> {
  const { error } = await admin.from("order_items").insert(
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
  if (error) throw new Error(`Could not save order items: ${error.message}`);
}

/**
 * The session id is what lets a later retry of this attempt ask Stripe
 * whether this session was paid (stale-attempt.ts). Without it that check is
 * blind, so a failed write expires the session and fails the checkout rather
 * than hand out a URL nobody can account for.
 */
async function recordSessionId(
  admin: SupabaseClient,
  orderId: string,
  sessionId: string,
): Promise<void> {
  const { error } = await admin
    .from("orders")
    .update({ stripe_session_id: sessionId })
    .eq("id", orderId);
  if (!error) return;

  try {
    await stripe.checkout.sessions.expire(sessionId);
  } catch (expireError) {
    console.error("could not expire a session with no recorded id", sessionId, expireError);
  }
  throw new Error(`Could not record the session id: ${error.message}`);
}

/** Checks stock, saves the lines and opens the session. Returns its URL. */
export async function openCheckoutSession(
  admin: SupabaseClient,
  orderId: string,
  request: CheckoutRequest,
  basket: PricedBasket,
): Promise<string | null> {
  await requireInStock(admin, orderId, basket);
  await saveOrderItems(admin, orderId, basket);

  const siteUrl = requireEnv("SITE_URL").replace(/\/$/, "");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    currency: "eur",
    // Instant methods only (D2, M-005). Apple Pay and Google Pay come through
    // as card. A delayed method such as SEPA Debit would complete the session
    // before the money cleared, which the webhook would have to second-guess.
    payment_method_types: ["card"],
    line_items: buildStripeLineItems(basket),
    customer_email: request.customerEmail,
    expires_at: Math.floor(Date.now() / 1000) + SESSION_MINUTES * 60,
    // {CHECKOUT_SESSION_ID} is filled in by Stripe. With the order id it is
    // what lets the success page ask checkout-status for the order number.
    success_url: `${siteUrl}/checkout/success?order=${orderId}&session={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cart`,
    metadata: { order_id: orderId },
    payment_intent_data: { metadata: { order_id: orderId } },
  }, {
    // Keyed on this call's new order, so it covers only the SDK's own network
    // retries of this one request. It does not stop a double-clicked or
    // repeated checkout opening a second session: every submit makes a new
    // order. Repeats are handled by the attempt id in stale-attempt.ts.
    idempotencyKey: `checkout-session:${orderId}`,
  });

  await recordSessionId(admin, orderId, session.id);
  return session.url;
}
