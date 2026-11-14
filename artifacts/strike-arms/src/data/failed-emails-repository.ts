import { supabase } from '@/data/supabase-client';
import { stillFailed, type EnqueueError, type FailedEmail } from '@/lib/failed-emails';

/** How far back a failure is still worth showing. */
const LOOKBACK_DAYS = 30;

function since(): string {
  return new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

async function orderNumbers(orderIds: string[]): Promise<Map<string, string | null>> {
  if (orderIds.length === 0) return new Map();
  const { data, error } = await supabase.from('orders').select('id, order_number').in('id', orderIds);
  if (error) throw new Error(error.message);
  return new Map((data ?? []).map(row => [row.id, row.order_number]));
}

/** Dead-lettered jobs with no later copy queued or sent (M-010). */
export async function listFailedEmails(): Promise<FailedEmail[]> {
  const { data: failed, error } = await supabase
    .from('notification_jobs')
    .select('*')
    .eq('status', 'failed')
    .gte('created_at', since())
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  const rows = failed ?? [];
  const orderIds = [...new Set(rows.flatMap(r => (r.order_id ? [r.order_id] : [])))];

  let later: { orderId: string | null; eventType: string; recipient: string; createdAt: string }[] = [];
  if (orderIds.length > 0) {
    const { data: copies, error: copiesError } = await supabase
      .from('notification_jobs')
      .select('order_id, event_type, recipient, created_at')
      .in('order_id', orderIds)
      .in('status', ['pending', 'sent']);
    if (copiesError) throw new Error(copiesError.message);
    later = (copies ?? []).map(c => ({
      orderId: c.order_id, eventType: c.event_type, recipient: c.recipient, createdAt: c.created_at,
    }));
  }

  const numbers = await orderNumbers(orderIds);
  const keyed = rows.map(r => ({
    id: r.id,
    eventType: r.event_type,
    recipient: r.recipient,
    orderId: r.order_id,
    orderNumber: r.order_id ? (numbers.get(r.order_id) ?? null) : null,
    lastError: r.last_error,
    createdAt: r.created_at,
    canResend: r.order_id !== null,
  }));
  return stillFailed(keyed, later);
}

/** Emails that could not even be queued, still unresolved (042). */
export async function listEnqueueErrors(): Promise<EnqueueError[]> {
  const { data, error } = await supabase
    .from('notification_enqueue_errors')
    .select('*')
    .is('resolved_at', null)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []).map(row => ({
    id: row.id,
    source: row.source,
    eventType: row.event_type,
    orderId: row.order_id,
    detail: row.detail,
    createdAt: row.created_at,
  }));
}

export async function resolveEnqueueError(id: string): Promise<void> {
  const { data, error } = await supabase
    .from('notification_enqueue_errors')
    .update({ resolved_at: new Date().toISOString() })
    .eq('id', id)
    .select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('Nothing was updated. Reload and try again.');
}
