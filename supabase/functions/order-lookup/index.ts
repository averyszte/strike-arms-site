import { corsHeadersFor, jsonResponse } from "../_shared/cors.ts";
import { clientIp } from "../_shared/client-ip.ts";
import { RATE_LIMITED_MESSAGE, withinRateLimits } from "../_shared/rate-limit.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { verifyTurnstile } from "../_shared/turnstile.ts";

/**
 * Guest order lookup, for /account. Stays when customer accounts land: it is
 * how a guest, or anyone following the link in a status email, sees an order.
 *
 * Orders are not readable by anon, and this does not change that. The caller
 * must hold the order number and the email it was placed with, and gets back
 * where the order is and what is in it. Never the name, address or phone:
 * order numbers run in sequence, so the email is the only secret, and a
 * leaked email should reveal as little as possible.
 *
 * A wrong email answers exactly like a number that does not exist, so the
 * endpoint cannot be used to confirm that an order number is real.
 *
 * Guarded like checkout (migration 035, Phase 2 item 17): a Turnstile token,
 * and limits per address and per order number, so the email cannot be
 * guessed at by brute force.
 */

const ORDER_NUMBER_PATTERN = /^SA-\d{4}-\d{4,8}$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_TOKEN_LENGTH = 2048;
const TURNSTILE_ACTION = "order-lookup";
const TEN_MINUTES = 10 * 60;
const HOUR = 60 * 60;

const NOT_FOUND = { found: false } as const;

type LookupRequest = { orderNumber: string; email: string; turnstileToken: string | null };

function readRequest(body: unknown): LookupRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const { orderNumber, email, turnstileToken } = body as Record<string, unknown>;
  if (typeof orderNumber !== "string" || typeof email !== "string") return null;
  const token = typeof turnstileToken === "string" && turnstileToken.length <= MAX_TOKEN_LENGTH
    ? turnstileToken
    : null;

  const number = orderNumber.replace(/\s+/g, "").toUpperCase();
  const address = email.trim().toLowerCase();
  if (!ORDER_NUMBER_PATTERN.test(number)) return null;
  if (address.length > MAX_EMAIL_LENGTH || !address.includes("@")) return null;
  return { orderNumber: number, email: address, turnstileToken: token };
}

type Refusal = { status: number; error: string };

/** Null when the lookup may go ahead; otherwise what to answer with. */
async function guard(req: Request, request: LookupRequest): Promise<Refusal | null> {
  const ip = clientIp(req);
  const limits = [
    { scope: "lookup:order", value: request.orderNumber, max: 10, windowSeconds: HOUR },
  ];
  if (ip) limits.push({ scope: "lookup:ip", value: ip, max: 10, windowSeconds: TEN_MINUTES });

  if (!(await withinRateLimits(createAdminClient(), limits))) {
    return { status: 429, error: RATE_LIMITED_MESSAGE };
  }

  const check = await verifyTurnstile(request.turnstileToken, TURNSTILE_ACTION, ip);
  return check.ok ? null : { status: check.status, error: check.error };
}

type ItemRow = {
  product_slug: string;
  product_name: string;
  brand: string;
  unit_price_cents: number;
  quantity: number;
  subtotal_cents: number;
  fulfillment_method: string;
};

function toItem(row: ItemRow) {
  return {
    slug: row.product_slug,
    name: row.product_name,
    brand: row.brand,
    unitPriceCents: row.unit_price_cents,
    quantity: row.quantity,
    subtotalCents: row.subtotal_cents,
    fulfillmentMethod: row.fulfillment_method,
  };
}

type HistoryRow = { to_status: string; created_at: string };

async function loadItems(admin: ReturnType<typeof createAdminClient>, orderId: string) {
  const { data, error } = await admin
    .from("order_items")
    .select(
      "product_slug, product_name, brand, unit_price_cents, quantity, subtotal_cents, fulfillment_method",
    )
    .eq("order_id", orderId)
    .order("product_name");

  if (error) throw new Error(`Could not read the order items: ${error.message}`);
  return ((data ?? []) as ItemRow[]).map(toItem);
}

/**
 * When each fulfilment step happened, for the tracker. The status and the
 * time only: who made the change and any note stay staff-side.
 */
async function loadHistory(admin: ReturnType<typeof createAdminClient>, orderId: string) {
  const { data, error } = await admin
    .from("order_status_log")
    .select("to_status, created_at")
    .eq("order_id", orderId)
    .eq("field", "fulfillment_status")
    .order("created_at");

  if (error) throw new Error(`Could not read the order history: ${error.message}`);
  return ((data ?? []) as HistoryRow[]).map((row) => ({ status: row.to_status, at: row.created_at }));
}

async function lookUp({ orderNumber, email }: LookupRequest) {
  const admin = createAdminClient();
  const { data: order, error } = await admin
    .from("orders")
    .select(
      "id, order_number, customer_email, payment_status, fulfillment_status, " +
        "fulfillment_method, total_cents, shipping_cents, refund_cents, tracking_number, paid_at, created_at",
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) throw new Error(`Could not read the order: ${error.message}`);
  if (!order) return NOT_FOUND;

  const row = order as unknown as Record<string, unknown>;
  const stored = typeof row.customer_email === "string" ? row.customer_email : "";
  if (stored.trim().toLowerCase() !== email) return NOT_FOUND;

  const orderId = row.id as string;
  const [items, history] = await Promise.all([loadItems(admin, orderId), loadHistory(admin, orderId)]);

  return {
    found: true,
    order: {
      orderNumber: row.order_number,
      placedAt: row.paid_at ?? row.created_at,
      paymentStatus: row.payment_status,
      fulfillmentStatus: row.fulfillment_status,
      fulfillmentMethod: row.fulfillment_method,
      totalCents: row.total_cents,
      shippingCents: row.shipping_cents,
      refundCents: row.refund_cents,
      trackingNumber: row.tracking_number ?? null,
      items,
      history,
    },
  };
}

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = corsHeadersFor(req);

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405, cors);

  try {
    const request = readRequest(await req.json().catch(() => null));
    if (!request) return jsonResponse(NOT_FOUND, 200, cors);

    const refusal = await guard(req, request);
    if (refusal) return jsonResponse({ error: refusal.error }, refusal.status, cors);

    return jsonResponse(await lookUp(request), 200, cors);
  } catch (error) {
    console.error("order-lookup failed", error);
    return jsonResponse({ error: "Could not look up the order" }, 500, cors);
  }
});
