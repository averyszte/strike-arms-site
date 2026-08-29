import Stripe from "npm:stripe@17.3.1";
import { webhookCorsHeaders, jsonResponse } from "../_shared/cors.ts";
import { requireEnv } from "../_shared/env.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import {
  handleChargeRefunded,
  handleCheckoutCompleted,
  handleCheckoutExpired,
} from "./handlers.ts";

/**
 * Stripe's view of what happened, applied to our orders.
 *
 * This endpoint is public and unauthenticated by Supabase (verify_jwt = false
 * in config.toml) because Stripe does not carry a Supabase JWT. Its
 * authentication is the Stripe signature, verified below — nothing else in
 * this function may run before that check passes.
 */

// Pinned explicitly so that upgrading the SDK and moving the API version stay
// two separate, reviewable decisions.
const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-11-20.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

const HANDLED_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.expired",
  "charge.refunded",
]);

async function dispatch(event: Stripe.Event): Promise<string> {
  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed":
      return await handleCheckoutCompleted(
        admin,
        event.data.object as Stripe.Checkout.Session,
      );
    case "checkout.session.expired":
      return await handleCheckoutExpired(
        admin,
        event.data.object as Stripe.Checkout.Session,
      );
    case "charge.refunded":
      return await handleChargeRefunded(admin, event.data.object as Stripe.Charge);
    default:
      return `ignored ${event.type}`;
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = webhookCorsHeaders;

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405, cors);

  const signature = req.headers.get("stripe-signature");
  if (!signature) return jsonResponse({ error: "Missing signature" }, 400, cors);

  // The raw body, read before anything parses it. Signature verification is
  // over the exact bytes Stripe sent; re-serialising parsed JSON breaks it.
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    // Async because Deno's Web Crypto is async. The synchronous
    // constructEvent throws at runtime here.
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      requireEnv("STRIPE_WEBHOOK_SECRET"),
    );
  } catch (error) {
    console.error("stripe-webhook signature verification failed", error);
    return jsonResponse({ error: "Invalid signature" }, 400, cors);
  }

  if (!HANDLED_EVENTS.has(event.type)) {
    return jsonResponse({ received: true, ignored: event.type }, 200, cors);
  }

  const admin = createAdminClient();

  // The database is the lock. claim_stripe_event inserts the event id and
  // reports whether this call is the one that got it, so two concurrent
  // deliveries of the same event cannot both do the work.
  const { data: claimed, error: claimError } = await admin.rpc("claim_stripe_event", {
    p_event_id: event.id,
    p_type: event.type,
  });

  if (claimError) {
    console.error("stripe-webhook could not claim event", event.id, claimError);
    return jsonResponse({ error: "Could not claim event" }, 500, cors);
  }

  if (!claimed) {
    return jsonResponse({ received: true, duplicate: event.id }, 200, cors);
  }

  try {
    const outcome = await dispatch(event);
    // Deliberate server-side audit line: the Supabase function log is the only
    // record of which event ids we acted on, and on what.
    console.info("stripe-webhook", event.type, event.id, outcome);
    return jsonResponse({ received: true }, 200, cors);
  } catch (error) {
    // Release the claim, or the retry Stripe is about to send would be
    // dismissed as a duplicate and the event lost for good.
    await admin.rpc("release_stripe_event", { p_event_id: event.id });
    console.error("stripe-webhook handler failed", event.type, event.id, error);

    // A 500 asks Stripe to retry.
    return jsonResponse({ error: "Handler failed" }, 500, cors);
  }
});
