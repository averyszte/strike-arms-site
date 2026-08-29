import type { Database } from '@/types/database';
import type {
  Order,
  OrderItem,
  OrderStatusLogEntry,
  ShippingAddress,
} from '@/types/order';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];
type OrderStatusLogRow = Database['public']['Tables']['order_status_log']['Row'];

/**
 * A pickup order stores no address, so the whole block is absent rather than a
 * record of empty strings. line1 is the column the schema requires on any
 * delivered order, which makes it the reliable test.
 */
function rowToShippingAddress(row: OrderRow): ShippingAddress | null {
  if (!row.shipping_line1) return null;

  return {
    name: row.shipping_name ?? '',
    line1: row.shipping_line1,
    line2: row.shipping_line2,
    city: row.shipping_city ?? '',
    county: row.shipping_county,
    eircode: row.shipping_eircode ?? '',
  };
}

export function rowToOrder(row: OrderRow, items?: OrderItemRow[]): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    stripeSessionId: row.stripe_session_id,
    stripePaymentIntent: row.stripe_payment_intent,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    channel: row.channel,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    fulfillmentStatus: row.fulfillment_status,
    fulfillmentMethod: row.fulfillment_method,
    totalCents: row.total_cents,
    vatCents: row.vat_cents,
    refundCents: row.refund_cents,
    shippingCents: row.shipping_cents,
    shippingAddress: rowToShippingAddress(row),
    paidAt: row.paid_at,
    refundedAt: row.refunded_at,
    ageVerified: row.age_verified,
    notes: row.notes,
    isArchived: row.is_archived,
    items: items?.map(rowToOrderItem),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToOrderItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    productSlug: row.product_slug,
    productName: row.product_name,
    productImage: row.product_image,
    brand: row.brand,
    unitPriceCents: row.unit_price_cents,
    quantity: row.quantity,
    subtotalCents: row.subtotal_cents,
    fulfillmentMethod: row.fulfillment_method,
  };
}

export function rowToOrderStatusLog(row: OrderStatusLogRow): OrderStatusLogEntry {
  return {
    id: row.id,
    orderId: row.order_id,
    field: row.field,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    changedBy: row.changed_by,
    note: row.note,
    createdAt: row.created_at,
  };
}
