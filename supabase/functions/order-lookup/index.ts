import { corsHeadersFor, jsonResponse } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";

/**
 * Guest order lookup, for /account (decision D1: no customer accounts in v1).
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
 * Not rate limited yet. That lands with the checkout rate limit migration,
 * which can key this endpoint the same way.
 */

const ORDER_NUMBER_PATTERN = /^SA-\d{4}-\d{4,8}$/;
const MAX_EMAIL_LENGTH = 254;

const NOT_FOUND = { found: false } as const;

type LookupRequest = { orderNumber: string; email: string };

function readRequest(body: unknown): LookupRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const { orderNumber, email } = body as Record<string, unknown>;
  if (typeof orderNumber !== "string" || typeof email !== "string") return null;

  const number = orderNumber.replace(/\s+/g, "").toUpperCase();
  const address = email.trim().toLowerCase();
  if (!ORDER_NUMBER_PATTERN.test(number)) return null;
  if (address.length > MAX_EMAIL_LENGTH || !address.includes("@")) return null;
  return { orderNumber: number, email: address };
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

async function lookUp({ orderNumber, email }: LookupRequest) {
  const admin = createAdminClient();
  const { data: order, error } = await admin
    .from("orders")
    .select(
      "id, order_number, customer_email, payment_status, fulfillment_status, " +
        "fulfillment_method, total_cents, shipping_cents, refund_cents, paid_at, created_at",
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) throw new Error(`Could not read the order: ${error.message}`);
  if (!order) return NOT_FOUND;

  const row = order as unknown as Record<string, unknown>;
  const stored = typeof row.customer_email === "string" ? row.customer_email : "";
  if (stored.trim().toLowerCase() !== email) return NOT_FOUND;

  const { data: items, error: itemsError } = await admin
    .from("order_items")
    .select(
      "product_slug, product_name, brand, unit_price_cents, quantity, subtotal_cents, fulfillment_method",
    )
    .eq("order_id", row.id as string)
    .order("product_name");

  if (itemsError) throw new Error(`Could not read the order items: ${itemsError.message}`);

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
      items: ((items ?? []) as ItemRow[]).map(toItem),
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

    return jsonResponse(await lookUp(request), 200, cors);
  } catch (error) {
    console.error("order-lookup failed", error);
    return jsonResponse({ error: "Could not look up the order" }, 500, cors);
  }
});
