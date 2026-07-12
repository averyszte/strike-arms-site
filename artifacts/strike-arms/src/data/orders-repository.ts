import { supabase } from '@/lib/supabase';
import { rowToOrder, rowToOrderStatusLog } from '@/lib/order-mappers';
import type {
  Order,
  OrderStatusLogEntry,
  OrderListFilters,
  FulfillmentStatus,
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

export async function archiveOrder(id: string): Promise<void> {
  const { error } = await supabase.from('orders').update({ is_archived: true }).eq('id', id);
  if (error) throw error;
}

export async function listAllOrdersWithItems(): Promise<Order[]> {
  const [ordersResult, itemsResult] = await Promise.all([
    supabase
      .from('orders')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false }),
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
