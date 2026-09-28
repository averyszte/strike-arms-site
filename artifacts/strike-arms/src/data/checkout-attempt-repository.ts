/**
 * The id that ties a shopper's checkout tries together, kept in this tab.
 *
 * create-checkout-session abandons the pending order from an earlier try with
 * the same id, which gives back the stock that order was holding. When the id
 * lived only in a ref, coming back from Stripe's cancel link reloaded the page,
 * made a new id, and left the first order holding the stock for 35 minutes: a
 * shopper retrying a one-off item was told it was no longer available.
 *
 * Session storage rather than local: a second tab is a second checkout. If
 * storage is unavailable (some private modes) this falls back to an id for
 * the page's lifetime, which is what it did before.
 */

const STORAGE_KEY = 'strike-arms:checkout-attempt';

let fallbackId: string | null = null;

export function getCheckoutAttemptId(): string {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    const created = crypto.randomUUID();
    window.sessionStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    fallbackId ??= crypto.randomUUID();
    return fallbackId;
  }
}

/** Once an order is paid, the next checkout is a new attempt. */
export function clearCheckoutAttemptId(): void {
  fallbackId = null;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored, so nothing to clear.
  }
}
