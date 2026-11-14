import Stripe from "npm:stripe@17.3.1";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { webhookCorsHeaders, jsonResponse } from "../_shared/cors.ts";
import { requireEnv } from "../_shared/env.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { claimEvent, type ClaimOutcome, errorText, settleEvent } from "./event-claim.ts";
import {
  handleAsyncPayment,
  handleCheckoutCompleted,
  handleCheckoutExpired,
} from "./handlers.ts";
import {
  handleChargeRefunded,
  handleDisputeCreated,
  handleRefundUpdated,
} from "./refund-handlers.ts";

/**
 * Stripe's view of what happened, applied to our orders.
 *
 * This endpoint is public and unauthenticated by Supabase (verify_jwt = false
 * in config.toml) because Stripe does not carry a Supabase JWT. Its
 * authentication is the Stripe signature, verified below; nothing else in
 * this function may run before that check passes.
 */

// Pinned explicitly so that upgrading the SDK and moving the API version stay
// two separate, reviewable decisions.
const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-11-20.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

// Each of these must also be ticked on the endpoint in the Stripe dashboard,
// or Stripe never sends it.
const HANDLED_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "charge.refunded",
  "charge.refund.updated",
  "charge.dispute.created",
]);

async function dispatch(admin: SupabaseClient, event: Stripe.Event): Promise<string> {
  const object = event.data.object;
  switch (event.type) {
    case "checkout.session.completed":
      return await handleCheckoutCompleted(admin, object as Stripe.Checkout.Session, event.id);
    case "checkout.session.async_payment_succeeded":
      return await handleAsyncPayment(admin, object as Stripe.Checkout.Session, event.id, true);
    case "checkout.session.async_payment_failed":
      return await handleAsyncPayment(admin, object as Stripe.Checkout.Session, event.id, false);
    case "checkout.session.expired":
      return await handleCheckoutExpired(admin, object as Stripe.Checkout.Session);
    case "charge.refunded":
      return await handleChargeRefunded(admin, object as Stripe.Charge);
    case "charge.refund.updated":
      return await handleRefundUpdated(admin, object as Stripe.Refund);
    case "charge.dispute.created":
      return await handleDisputeCreated(admin, object as Stripe.Dispute);
    default:
      return `ignored ${event.type}`;
  }
}

/**
 * Claims the event, handles it, and settles the claim. Every step's result is
 * checked: a 200 tells Stripe to stop sending the event, so it is only
 * answered once the work and the record of it have both been written.
 */
async function processEvent(event: Stripe.Event, cors: Record<string, string>): Promise<Response> {
  const admin = createAdminClient();

  let claim: ClaimOutcome;
  try {
    claim = await claimEvent(admin, event.id, event.type);
  } catch (error) {
    console.error("stripe-webhook could not claim event", event.id, errorText(error));
    return jsonResponse({ error: "Could not claim event" }, 500, cors);
  }

  if (claim === "done") return jsonResponse({ received: true, duplicate: event.id }, 200, cors);
  if (claim === "busy") {
    // Another run holds it. Not a 2xx, so Stripe tries again; by then that run
    // has settled it, or its claim has gone stale and the retry takes over.
    return jsonResponse({ error: "Event is already being handled" }, 409, cors);
  }

  let outcome: string;
  try {
    outcome = await dispatch(admin, event);
  } catch (error) {
    const failure = errorText(error);
    console.error("stripe-webhook handler failed", event.type, event.id, failure);
    // Marked failed so the retry Stripe is about to send can claim it again.
    // If even that cannot be written, the claim goes stale in two minutes.
    await settleEvent(admin, event.id, failure);
    return jsonResponse({ error: "Handler failed" }, 500, cors);
  }

  // Deliberate server-side audit line: the Supabase function log is the only
  // record of which event ids we acted on, and on what.
  console.info("stripe-webhook", event.type, event.id, outcome);

  if (!(await settleEvent(admin, event.id, null))) {
    // The work is done, but the log does not say so. A retry repeats it, which
    // every handler is written to survive.
    return jsonResponse({ error: "Could not record event" }, 500, cors);
  }
  return jsonResponse({ received: true }, 200, cors);
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
    console.error("stripe-webhook signature verification failed", errorText(error));
    return jsonResponse({ error: "Invalid signature" }, 400, cors);
  }

  if (!HANDLED_EVENTS.has(event.type)) {
    return jsonResponse({ received: true, ignored: event.type }, 200, cors);
  }

  return await processEvent(event, cors);
});
