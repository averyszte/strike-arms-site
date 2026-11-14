import { supabase } from '@/lib/supabase';

/**
 * The only caller of the refund Edge Function.
 *
 * Nothing here writes to the order. The function records the refund on the
 * order straight after Stripe accepts it and says whether that worked
 * (isRecorded); when it did not, the webhook records it a moment later.
 */

/** An error whose message came from the server and is safe to show. */
export class RefundError extends Error {}

export type RefundResult = {
  refundId: string;
  amountCents: number;
  /** Stripe's own: 'succeeded', 'pending', 'failed', 'requires_action'. */
  status: string;
  /**
   * False when Stripe took the refund but the order row could not be written
   * straight away (M-006). The webhook records it shortly after.
   */
  isRecorded: boolean;
};

type RefundResponse = Partial<RefundResult> & { error?: string };

export type RefundRequest = {
  orderId: string;
  /** Null refunds the whole outstanding balance. */
  amountCents: number | null;
  attemptId: string;
  reason: string | null;
};

export async function requestRefund(request: RefundRequest): Promise<RefundResult> {
  const { data, error } = await supabase.functions.invoke<RefundResponse>('refund-order', {
    body: request,
  });

  if (error) throw new RefundError(await readErrorMessage(error));

  if (!data?.refundId || typeof data.amountCents !== 'number') {
    throw new RefundError('Stripe did not confirm the refund. Check the Stripe dashboard.');
  }

  return {
    refundId: data.refundId,
    amountCents: data.amountCents,
    status: data.status ?? 'unknown',
    isRecorded: data.isRecorded === true,
  };
}

async function readErrorMessage(error: unknown): Promise<string> {
  const fallback = 'The refund could not be sent. Please try again.';
  const context = (error as { context?: unknown })?.context;

  if (context instanceof Response) {
    try {
      const body: unknown = await context.json();
      const message = (body as { error?: unknown })?.error;
      if (typeof message === 'string' && message.length > 0) return message;
    } catch {
      return fallback;
    }
  }

  return fallback;
}
