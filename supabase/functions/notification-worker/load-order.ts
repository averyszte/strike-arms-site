import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

/**
 * The order as an email needs it, read fresh when the email is sent rather
 * than copied into the job, so a corrected address or name is what goes out.
 */

export type EmailOrderItem = {
  name: string;
  quantity: number;
  subtotalCents: number;
  isPosted: boolean;
};

export type EmailOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  channel: string;
  paymentMethod: string;
  fulfillmentMethod: "pickup" | "delivery" | "mixed";
  totalCents: number;
  shippingCents: number;
  vatCents: number;
  refundCents: number;
  address: string[];
  notes: string | null;
  trackingNumber: string | null;
  needsAttention: boolean;
  items: EmailOrderItem[];
};

type ItemRow = {
  product_name: string;
  quantity: number;
  subtotal_cents: number;
  fulfillment_method: string;
};

function addressLines(row: Record<string, unknown>): string[] {
  return [
    row.shipping_name,
    row.shipping_line1,
    row.shipping_line2,
    row.shipping_city,
    row.shipping_county,
    row.shipping_eircode,
  ].filter((part): part is string => typeof part === "string" && part.trim() !== "");
}

export async function loadEmailOrder(
  admin: SupabaseClient,
  orderId: string,
): Promise<EmailOrder> {
  const { data: row, error } = await admin
    .from("orders")
    .select("*, order_items(product_name, quantity, subtotal_cents, fulfillment_method)")
    .eq("id", orderId)
    .single();

  if (error || !row) throw new Error(`Order ${orderId} not found: ${error?.message ?? ""}`);
  if (!row.order_number) throw new Error(`Order ${orderId} has no number; it is not paid`);

  const items = ((row.order_items ?? []) as ItemRow[]).map((item) => ({
    name: item.product_name,
    quantity: item.quantity,
    subtotalCents: item.subtotal_cents,
    isPosted: item.fulfillment_method === "delivery",
  }));

  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    channel: row.channel,
    paymentMethod: row.payment_method,
    fulfillmentMethod: row.fulfillment_method,
    totalCents: row.total_cents,
    shippingCents: row.shipping_cents,
    vatCents: row.vat_cents,
    refundCents: row.refund_cents,
    address: addressLines(row),
    notes: row.notes,
    trackingNumber: row.tracking_number ?? null,
    needsAttention: row.attention_reason !== null,
    items,
  };
}
