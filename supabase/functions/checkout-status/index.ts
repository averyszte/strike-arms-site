import { corsHeadersFor, jsonResponse } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";

/**
 * What the checkout success page may know about the order it came back from:
 * whether the payment has been confirmed, and the order number once it has.
 *
 * Orders are not readable by anon, and this does not change that. The caller
 * must hold both the order id and the Stripe session id, which only the
 * browser Stripe redirected arrives with, and it gets back two fields. Any
 * mismatch answers "unknown", the same as an order that does not exist, so
 * the endpoint cannot be used to test ids.
 *
 * The number is assigned by the webhook, which can land a moment after the
 * browser does, so the page polls this until it says "paid".
 */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SESSION_PATTERN = /^cs_(test|live)_[A-Za-z0-9]{1,200}$/;

const PAID = new Set(["paid", "partially_refunded", "refunded"]);
const STILL_PAYABLE = new Set(["pending", "abandoned"]);

type Status = "paid" | "pending" | "closed" | "unknown";

function readIds(body: unknown): { orderId: string; sessionId: string } | null {
  if (typeof body !== "object" || body === null) return null;
  const { orderId, sessionId } = body as Record<string, unknown>;
  if (typeof orderId !== "string" || !UUID_PATTERN.test(orderId)) return null;
  if (typeof sessionId !== "string" || !SESSION_PATTERN.test(sessionId)) return null;
  return { orderId, sessionId };
}

async function lookUp(
  orderId: string,
  sessionId: string,
): Promise<{ status: Status; orderNumber: string | null }> {
  const { data, error } = await createAdminClient()
    .from("orders")
    .select("payment_status, order_number")
    .eq("id", orderId)
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (error) throw new Error(`Could not read order status: ${error.message}`);
  if (!data) return { status: "unknown", orderNumber: null };

  const paymentStatus = data.payment_status as string;
  if (PAID.has(paymentStatus)) {
    return { status: "paid", orderNumber: (data.order_number as string | null) ?? null };
  }
  return { status: STILL_PAYABLE.has(paymentStatus) ? "pending" : "closed", orderNumber: null };
}

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = corsHeadersFor(req);

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405, cors);

  try {
    const ids = readIds(await req.json().catch(() => null));
    if (!ids) return jsonResponse({ status: "unknown", orderNumber: null }, 200, cors);

    return jsonResponse(await lookUp(ids.orderId, ids.sessionId), 200, cors);
  } catch (error) {
    console.error("checkout-status failed", error);
    return jsonResponse({ error: "Could not check the order" }, 500, cors);
  }
});
