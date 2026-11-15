import type { CheckoutDetails } from '@/types/cart';

/**
 * The checkout form's typed details, kept in this tab so coming back from
 * Stripe's cancel link does not empty the form (N-054).
 *
 * Session storage, like the checkout attempt id: it ends with the tab, and a
 * second tab is a second checkout. The age tick and the bot-check token are
 * never stored; the shopper confirms their age again on each attempt. Every
 * access is wrapped, because storage can be missing or blocked (some private
 * modes), and then the form simply starts empty as it did before.
 */

const STORAGE_KEY = 'strike-arms:checkout-draft';

export type CheckoutDraft = Omit<CheckoutDetails, 'ageConfirmed' | 'wantsDelivery'>;

const DRAFT_FIELDS: readonly (keyof CheckoutDraft)[] = [
  'customerName',
  'customerEmail',
  'customerPhone',
  'shippingName',
  'shippingLine1',
  'shippingLine2',
  'shippingCity',
  'shippingCounty',
  'shippingEircode',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Only the known string fields survive, so a tampered entry cannot add others. */
function toDraft(value: unknown): Partial<CheckoutDraft> | null {
  if (!isRecord(value)) return null;
  const draft: Partial<CheckoutDraft> = {};
  for (const field of DRAFT_FIELDS) {
    const entry = value[field];
    if (typeof entry === 'string') draft[field] = entry.slice(0, 500);
  }
  return draft;
}

export function loadCheckoutDraft(): Partial<CheckoutDraft> | null {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    return stored ? toDraft(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
}

export function saveCheckoutDraft(details: CheckoutDetails): void {
  const draft: Partial<CheckoutDraft> = {};
  for (const field of DRAFT_FIELDS) draft[field] = details[field];
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Storage is unavailable; the form still works, it just is not kept.
  }
}

export function clearCheckoutDraft(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored, so nothing to clear.
  }
}
