import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import type { OrderEmail } from '@/types/order-email';

type NotificationJobRow = Database['public']['Tables']['notification_jobs']['Row'];

function rowToOrderEmail(row: NotificationJobRow): OrderEmail {
  return {
    id: row.id,
    eventType: row.event_type,
    recipient: row.recipient,
    status: row.status,
    attemptCount: row.attempt_count,
    lastError: row.last_error,
    sentAt: row.sent_at,
    createdAt: row.created_at,
  };
}

export async function listOrderEmails(orderId: string): Promise<OrderEmail[]> {
  const { data, error } = await supabase
    .from('notification_jobs')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToOrderEmail);
}

/**
 * Queues a fresh copy, to the order's current address. The worker sends it
 * within a minute.
 */
export async function resendOrderEmail(jobId: string): Promise<void> {
  const { error } = await supabase.rpc('resend_notification', { p_job_id: jobId });
  if (error) throw new Error(error.message);
}
