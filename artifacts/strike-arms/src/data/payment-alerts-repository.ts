import { supabase } from '@/data/supabase-client';
import type { Database } from '@/types/database';
import type { PaymentAlert } from '@/types/payment-alert';

type PaymentAlertRow = Database['public']['Tables']['payment_alerts']['Row'];

function rowToPaymentAlert(row: PaymentAlertRow): PaymentAlert {
  return {
    id: row.id,
    stripePaymentIntent: row.stripe_payment_intent,
    amountCents: row.amount_cents,
    currency: row.currency,
    customerEmail: row.customer_email,
    detail: row.detail,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
  };
}

export async function listOpenPaymentAlerts(): Promise<PaymentAlert[]> {
  const { data, error } = await supabase
    .from('payment_alerts')
    .select('*')
    .is('resolved_at', null)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToPaymentAlert);
}

/** The last handled ones, for the "Show handled" view (M-035). */
export async function listHandledPaymentAlerts(): Promise<PaymentAlert[]> {
  const { data, error } = await supabase
    .from('payment_alerts')
    .select('*')
    .not('resolved_at', 'is', null)
    .order('resolved_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToPaymentAlert);
}

/**
 * Marks one handled, or (with null) opens it again for the undo. Throws when
 * no row changed, so an AAL1 session or a stale id never reads as done.
 */
export async function setPaymentAlertResolved(id: string, isResolved: boolean): Promise<void> {
  const { data, error } = await supabase
    .from('payment_alerts')
    .update({ resolved_at: isResolved ? new Date().toISOString() : null })
    .eq('id', id)
    .select('id');

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('Nothing was updated. Reload and try again.');
}
