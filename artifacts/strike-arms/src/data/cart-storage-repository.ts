import type { CartLine } from '@/types/cart';

/**
 * Reading and writing the cart in localStorage.
 *
 * Anything stored client-side is untrusted input on the way back in, so the
 * stored value is validated field by field rather than cast. A corrupt or
 * hand-edited cart is discarded, not rendered.
 */

const STORAGE_KEY = 'strike-arms:cart:v1';

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) return false;
  const line = value as Record<string, unknown>;

  return (
    typeof line.productId === 'string' &&
    typeof line.slug === 'string' &&
    typeof line.name === 'string' &&
    typeof line.brand === 'string' &&
    (line.image === null || typeof line.image === 'string') &&
    typeof line.unitPriceCents === 'number' &&
    Number.isInteger(line.unitPriceCents) &&
    typeof line.quantity === 'number' &&
    Number.isInteger(line.quantity) &&
    line.quantity > 0 &&
    typeof line.isShippable === 'boolean'
  );
}

export function loadCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isCartLine);
  } catch {
    // Private browsing, a disabled store, or malformed JSON. An empty cart is
    // the right answer to all three.
    return [];
  }
}

export function saveCart(lines: CartLine[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // A cart that cannot be persisted still works for this session.
  }
}
