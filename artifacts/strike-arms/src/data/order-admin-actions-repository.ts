import { supabase } from '@/data/supabase-client';
import type { FulfillmentStatus } from '@/types/order';

/**
 * The order RPCs from the audit migrations (041, 046). Each checks
 * is_admin_aal2() and writes its own audit row, so there is nothing for the
 * browser to log.
 */

export type ManualRefundResult = { refundCents: number; paymentStatus: string };
export type VoidResult = { orderNumber: string | null; refundedCents: number; isCancelled: boolean };

/** Cash or goodwill handed back outside Stripe (M-033). The note is required. */
export async function recordManualRefund(
  orderId: string,
  amountCents: number,
  note: string,
): Promise<ManualRefundResult> {
  const { data, error } = await supabase.rpc('record_manual_refund', {
    p_order_id: orderId,
    p_amount_cents: amountCents,
    p_note: note,
  });
  if (error) throw new Error(error.message);
  return { refundCents: data.refund_cents, paymentStatus: data.payment_status };
}

/** Undoes a mistaken counter sale on the day it was made (M-033). */
export async function voidCounterOrder(orderId: string, reason: string): Promise<VoidResult> {
  const { data, error } = await supabase.rpc('void_counter_order', {
    p_order_id: orderId,
    p_reason: reason,
  });
  if (error) throw new Error(error.message);
  return {
    orderNumber: data.order_number,
    refundedCents: data.refunded_cents,
    isCancelled: data.cancelled,
  };
}

/** How many customers a bulk status change would email (M-017). */
export async function previewStatusEmails(
  orderIds: string[],
  status: FulfillmentStatus,
): Promise<number> {
  const { data, error } = await supabase.rpc('preview_status_emails', {
    p_order_ids: orderIds,
    p_status: status,
  });
  if (error) throw new Error(error.message);
  return data ?? 0;
}
