import type { CartLine } from '@/types/cart';

/** Matches MAX_LINES in create-checkout-session/parse-request.ts. */
export const MAX_CART_LINES = 50;

/** Matches MAX_QUANTITY_PER_LINE in create-checkout-session/parse-request.ts. */
export const MAX_QUANTITY_PER_LINE = 20;

export const CART_FULL_MESSAGE =
  `Your basket can hold up to ${MAX_CART_LINES} different items. ` +
  'Please remove something before adding more, or contact the shop about a larger order.';

/** Whether a product can go in the basket: a product already there only gains quantity. */
export function canAddToCart(lines: readonly CartLine[], productId: string): boolean {
  return lines.length < MAX_CART_LINES || lines.some((line) => line.productId === productId);
}

/** Whether checkout should refuse the basket before asking the server. */
export function isCartOverLimit(lines: readonly CartLine[]): boolean {
  return lines.length > MAX_CART_LINES;
}

/** The server's wording for the same refusal, so it can be shown as CART_FULL_MESSAGE. */
export function isCartLimitError(message: string): boolean {
  return /at most \d+ lines/i.test(message);
}
