import type { CheckoutDetails } from '@/types/cart';

/**
 * Client-side checks on the checkout form.
 *
 * These exist to give fast, field-level feedback. They are not a security
 * boundary — the Edge Function validates the same things again, because
 * anything checked only in the browser is not checked at all.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Irish routing key + unique identifier, e.g. "K67 T9H9" or "D6W XY12". The
 * routing key is a letter and two digits, or D6W for Dublin 6W; both parts use
 * the Eircode alphabet. Keep in step with create-checkout-session/parse-request.ts.
 */
const EIRCODE_PATTERN = /^([AC-FHKNPRTV-Y]\d{2}|D6W)\s?[0-9AC-FHKNPRTV-Y]{4}$/i;

export type CheckoutFieldErrors = Partial<Record<keyof CheckoutDetails, string>>;

export function validateCheckoutDetails(details: CheckoutDetails): CheckoutFieldErrors {
  const errors: CheckoutFieldErrors = {};

  if (details.customerName.trim().length < 2) {
    errors.customerName = 'Please give us your name.';
  }

  if (!EMAIL_PATTERN.test(details.customerEmail.trim())) {
    errors.customerEmail = 'Please give a valid email address.';
  }

  if (!details.ageConfirmed) {
    errors.ageConfirmed = 'You must confirm you are 18 or over.';
  }

  if (details.wantsDelivery) {
    if (details.shippingLine1.trim() === '') {
      errors.shippingLine1 = 'Please give a delivery address.';
    }
    if (details.shippingCity.trim() === '') {
      errors.shippingCity = 'Please give a town or city.';
    }
    if (!EIRCODE_PATTERN.test(details.shippingEircode.trim())) {
      errors.shippingEircode = 'Please give a valid Eircode.';
    }
  }

  return errors;
}

export const EMPTY_CHECKOUT_DETAILS: CheckoutDetails = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  ageConfirmed: false,
  wantsDelivery: false,
  shippingName: '',
  shippingLine1: '',
  shippingLine2: '',
  shippingCity: '',
  shippingCounty: '',
  shippingEircode: '',
};
