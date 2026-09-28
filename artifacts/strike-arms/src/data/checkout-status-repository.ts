import { supabase } from '@/lib/supabase';
import type { CheckoutPaymentStatus, CheckoutStatus } from '@/types/checkout-status';

/**
 * The only caller of the checkout-status Edge Function: whether the order the
 * success page came back from has been confirmed paid, and its number.
 */

const STATUSES: readonly CheckoutPaymentStatus[] = ['paid', 'pending', 'closed', 'unknown'];

function isStatus(value: unknown): value is CheckoutPaymentStatus {
  return typeof value === 'string' && (STATUSES as readonly string[]).includes(value);
}

export async function fetchCheckoutStatus(
  orderId: string,
  sessionId: string,
): Promise<CheckoutStatus> {
  const { data, error } = await supabase.functions.invoke<unknown>('checkout-status', {
    body: { orderId, sessionId },
  });

  if (error) throw new Error('Could not check the order');

  const body = (data ?? {}) as { status?: unknown; orderNumber?: unknown };
  return {
    status: isStatus(body.status) ? body.status : 'unknown',
    orderNumber: typeof body.orderNumber === 'string' ? body.orderNumber : null,
  };
}
