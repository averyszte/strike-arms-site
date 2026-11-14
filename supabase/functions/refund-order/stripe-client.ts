import Stripe from "npm:stripe@17.3.1";
import { requireEnv } from "../_shared/env.ts";

// Pinned explicitly so that upgrading the SDK and moving the API version stay
// two separate, reviewable decisions. SDK 17.3.1 types only list
// 2024-10-28.acacia, so the newer version string needs a type cast; the
// runtime sends it unchanged.
export const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-11-20.acacia" as Stripe.LatestApiVersion,
  httpClient: Stripe.createFetchHttpClient(),
});
