import { supabase } from '@/lib/supabase';
import { rowToOrder, rowToOrderStatusLog } from '@/lib/order-mappers';
import type {
  Order,
  OrderStatusLogEntry,
  OrderListFilters,
  FulfillmentStatus,
  CounterOrderInput,
  CounterOrderResult,
} from '@/types/order';

export async function listOrders(
  filters: OrderListFilters = {},
): Promise<{ items: Order[]; total: number }> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 25;

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .eq('is_archived', filters.isArchived ?? false)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (filters.paymentStatus) query = query.eq('payment_status', filters.paymentStatus);
  if (filters.fulfillmentStatus) query = query.eq('fulfillment_status', filters.fulfillmentStatus);
  if (filters.search) {
    query = query.or(
      `customer_name.ilike.%${filters.search}%,` +
      `customer_email.ilike.%${filters.search}%,` +
      `order_number.ilike.%${filters.search}%`,
    );
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { items: (data ?? []).map((r) => rowToOrder(r)), total: count ?? 0 };
}

export async function getOrder(id: string): Promise<Order | null> {
  const [orderResult, itemsResult] = await Promise.all([
    supabase.from('orders').select('*').eq('id', id).maybeSingle(),
    supabase.from('order_items').select('*').eq('order_id', id).order('product_name'),
  ]);

  if (orderResult.error) throw orderResult.error;
  if (itemsResult.error) throw itemsResult.error;
  if (!orderResult.data) return null;

  return rowToOrder(orderResult.data, itemsResult.data ?? []);
}

export async function getOrderByStripeSession(sessionId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToOrder(data) : null;
}

export async function updateOrderFulfillment(
  id: string,
  status: FulfillmentStatus,
): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ fulfillment_status: status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToOrder(data);
}

export async function addOrderNote(id: string, note: string): Promise<void> {
  const { error } = await supabase.from('orders').update({ notes: note }).eq('id', id);
  if (error) throw error;
}

/**
 * Moves an order out of the working list, or brings it back.
 *
 * There is no delete anywhere in this file on purpose. An order is the record
 * of money changing hands; archiving is the admin saying they are finished
 * with it, which is a different thing from it never having happened.
 */
export async function setOrderArchived(id: string, isArchived: boolean): Promise<void> {
  const { error } = await supabase.from('orders').update({ is_archived: isArchived }).eq('id', id);
  if (error) throw error;
}

/**
 * Every order, archived ones included, for the dashboard.
 *
 * The exclusion this used to carry was the florist's bug: archiving is
 * workflow tidy-up, not a refund, so all-time revenue shrank every time the
 * owner tidied up. Callers that want only live work filter with workQueue().
 */
export async function listAllOrdersWithItems(): Promise<Order[]> {
  const [ordersResult, itemsResult] = await Promise.all([
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('order_items').select('*'),
  ]);
  if (ordersResult.error) throw ordersResult.error;
  if (itemsResult.error) throw itemsResult.error;

  const allItems = itemsResult.data ?? [];
  return (ordersResult.data ?? []).map(row =>
    rowToOrder(
      row,
      allItems.filter(item => item.order_id === row.id),
    ),
  );
}

export async function getOrderStatusLog(orderId: string): Promise<OrderStatusLogEntry[]> {
  const { data, error } = await supabase
    .from('order_status_log')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToOrderStatusLog);
}

/**
 * Rings up a sale made in the shop or over the phone.
 *
 * There is no insert here, and deliberately no INSERT policy on orders for it
 * to use: an admin session writing rows straight through PostgREST could set
 * its own prices, totals and VAT. The function prices every line from the
 * catalogue, takes the stock, and assigns the order number in one transaction.
 */
export async function createCounterOrder(
  input: CounterOrderInput,
): Promise<CounterOrderResult> {
  const { data, error } = await supabase.rpc('create_counter_order', {
    p_lines: input.lines.map((line) => ({
      product_id: line.productId,
      quantity: line.quantity,
      fulfillment_method: line.fulfillmentMethod,
    })),
    p_customer_name: input.customerName,
    p_customer_email: input.customerEmail,
    p_customer_phone: input.customerPhone,
    p_payment_method: input.paymentMethod,
    p_channel: input.channel,
    p_notes: input.notes,
    p_age_verified: input.ageVerified,
    p_shipping_line1: input.shippingLine1,
    p_shipping_line2: input.shippingLine2,
    p_shipping_city: input.shippingCity,
    p_shipping_county: input.shippingCounty,
    p_shipping_eircode: input.shippingEircode,
  });

  if (error) throw error;
  return { orderId: data.order_id, orderNumber: data.order_number };
}
