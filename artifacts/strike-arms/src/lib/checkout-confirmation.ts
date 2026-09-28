import type { CheckoutStatus } from '@/types/checkout-status';

/**
 * What the success page tells the shopper, from what checkout-status said.
 *
 * - confirming: still waiting for the webhook; the page keeps asking.
 * - paid: confirmed, with the order number. Only now is the cart cleared.
 * - delayed: still pending when the page stopped asking, or the check failed.
 *   The shopper may well have paid, so the page says not to pay again.
 * - unconfirmed: the order expired, or the link never matched an order.
 *
 * "unknown" keeps the page asking rather than giving up at once: the session
 * id is written to the order best-effort, and the webhook fills it in if that
 * write was lost.
 */
export type ConfirmationState = 'confirming' | 'paid' | 'delayed' | 'unconfirmed';

/** Two seconds apart, so a minute of asking before the page gives up. */
export const CONFIRMATION_POLL_MS = 2000;
export const CONFIRMATION_MAX_POLLS = 30;

export function confirmationState(
  result: CheckoutStatus | undefined,
  polls: number,
  isError: boolean,
): ConfirmationState {
  if (result?.status === 'paid') return 'paid';
  if (result?.status === 'closed') return 'unconfirmed';
  if (isError) return 'delayed';
  if (polls < CONFIRMATION_MAX_POLLS) return 'confirming';
  return result?.status === 'unknown' ? 'unconfirmed' : 'delayed';
}

/** Whether the page should ask again. */
export function shouldPollAgain(state: ConfirmationState): boolean {
  return state === 'confirming';
}
