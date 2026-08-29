import type { CounterOrderDraft, CounterOrderInput, CounterOrderLine } from '@/types/order';

/**
 * The counter-sale form's state, and the checks run before it is submitted.
 *
 * These are for fast feedback, not safety. create_counter_order validates the
 * same things again — it is the only side that can, because it is the only
 * side that decides prices. What they add is the difference between a
 * field-level message and a raw constraint violation in a toast.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Irish routing key + unique identifier, e.g. "K67 T9H9". */
const EIRCODE_PATTERN = /^[A-Z]\d{2}\s?[A-Z0-9]{4}$/i;

export const EMPTY_COUNTER_ORDER_DRAFT: CounterOrderDraft = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  paymentMethod: 'cash',
  channel: 'counter',
  notes: '',
  ageVerified: false,
  shippingLine1: '',
  shippingLine2: '',
  shippingCity: '',
  shippingCounty: '',
  shippingEircode: '',
};

export type CounterOrderFieldErrors = Partial<Record<keyof CounterOrderDraft | 'lines', string>>;

export function validateCounterOrder(
  draft: CounterOrderDraft,
  lines: { problem: string | null }[],
  hasDeliveryLines: boolean,
): CounterOrderFieldErrors {
  const errors: CounterOrderFieldErrors = {};

  // customer_name is still NOT NULL, so an anonymous sale needs something in
  // the box. "Counter sale" is a perfectly good answer.
  if (draft.customerName.trim().length < 2) {
    errors.customerName = 'Give a name for the sale — "Counter sale" will do.';
  }

  if (lines.length === 0) {
    errors.lines = 'Add at least one product.';
  } else if (lines.some((line) => line.problem !== null)) {
    errors.lines = 'Fix the highlighted lines before saving.';
  }

  const email = draft.customerEmail.trim();

  if (hasDeliveryLines) {
    // orders_customer_email_present refuses any non-pickup order without an
    // email, and there is nowhere to send a dispatch note without one either.
    if (!EMAIL_PATTERN.test(email)) {
      errors.customerEmail = 'Anything being posted needs an email address.';
    }
    if (draft.shippingLine1.trim() === '') {
      errors.shippingLine1 = 'Give a delivery address.';
    }
    if (draft.shippingCity.trim() === '') {
      errors.shippingCity = 'Give a town or city.';
    }
    if (!EIRCODE_PATTERN.test(draft.shippingEircode.trim())) {
      errors.shippingEircode = 'Give a valid Eircode.';
    }
  } else if (email !== '' && !EMAIL_PATTERN.test(email)) {
    errors.customerEmail = 'That does not look like an email address.';
  }

  return errors;
}

/** Empty means "not given" on a form and null in the database. */
function trimmedOrNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function draftToCounterOrderInput(
  draft: CounterOrderDraft,
  lines: CounterOrderLine[],
  hasDeliveryLines: boolean,
): CounterOrderInput {
  return {
    lines,
    customerName: draft.customerName.trim(),
    customerEmail: trimmedOrNull(draft.customerEmail),
    customerPhone: trimmedOrNull(draft.customerPhone),
    paymentMethod: draft.paymentMethod,
    channel: draft.channel,
    notes: trimmedOrNull(draft.notes),
    ageVerified: draft.ageVerified,
    // An address typed and then switched back to collection is not sent. It
    // would pass every constraint and leave a delivery address sitting on an
    // order nobody is delivering, which is how a parcel gets posted by mistake.
    shippingLine1: hasDeliveryLines ? trimmedOrNull(draft.shippingLine1) : null,
    shippingLine2: hasDeliveryLines ? trimmedOrNull(draft.shippingLine2) : null,
    shippingCity: hasDeliveryLines ? trimmedOrNull(draft.shippingCity) : null,
    shippingCounty: hasDeliveryLines ? trimmedOrNull(draft.shippingCounty) : null,
    shippingEircode: hasDeliveryLines ? trimmedOrNull(draft.shippingEircode) : null,
  };
}
