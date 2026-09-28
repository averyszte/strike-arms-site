import { supabase } from '@/lib/supabase';
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

/** For a payment settled some way the webhook cannot see. */
export async function resolvePaymentAlert(id: string): Promise<void> {
  const { error } = await supabase
    .from('payment_alerts')
    .update({ resolved_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}
