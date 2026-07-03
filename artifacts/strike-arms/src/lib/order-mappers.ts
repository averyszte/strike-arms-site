import type { Database } from '@/types/database';
import type { Order, OrderItem, OrderStatusLogEntry } from '@/types/order';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];
type OrderStatusLogRow = Database['public']['Tables']['order_status_log']['Row'];

export function rowToOrder(row: OrderRow, items?: OrderItemRow[]): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    stripeSessionId: row.stripe_session_id,
    stripePaymentIntent: row.stripe_payment_intent,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    paymentStatus: row.payment_status,
    fulfillmentStatus: row.fulfillment_status,
    totalCents: row.total_cents,
    vatCents: row.vat_cents,
    refundCents: row.refund_cents,
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
