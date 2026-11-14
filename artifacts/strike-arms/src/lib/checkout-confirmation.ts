import type { CheckoutStatus } from '@/types/checkout-status';

/**
 * What the success page tells the shopper, from what checkout-status said.
 *
 * - confirming: still waiting for the webhook; the page keeps asking.
 * - paid: confirmed, with the order number. Only now is the cart cleared.
 * - delayed: still pending after the first minute, or the check failed. The
 *   shopper may well have paid, so the page says not to pay again, and keeps
 *   asking every ten seconds for ten more minutes (a late webhook still lands).
 * - unconfirmed: the order expired, or the link never matched an order.
 *
 * "unknown" keeps the page asking rather than giving up at once: the session
 * id is written to the order best-effort, and the webhook fills it in if that
 * write was lost.
 */
export type ConfirmationState = 'confirming' | 'paid' | 'delayed' | 'unconfirmed';

/** Two seconds apart, so a minute of quick asking before the page says "delayed". */
export const CONFIRMATION_POLL_MS = 2000;
export const CONFIRMATION_MAX_POLLS = 30;

/** Then every ten seconds for ten more minutes. */
export const DELAYED_POLL_MS = 10_000;
export const DELAYED_MAX_POLLS = CONFIRMATION_MAX_POLLS + 60;

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

/**
 * How long until the page asks again, or false to stop. `attempts` counts
 * failed checks as well as answers, so a run of errors still stops in the end.
 */
export function nextPollDelay(state: ConfirmationState, attempts: number): number | false {
  if (state === 'confirming') return CONFIRMATION_POLL_MS;
  if (state === 'delayed' && attempts < DELAYED_MAX_POLLS) return DELAYED_POLL_MS;
  return false;
}
