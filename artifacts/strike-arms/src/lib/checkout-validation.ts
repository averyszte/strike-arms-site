import type { CheckoutDetails } from '@/types/cart';

/**
 * Client-side checks on the checkout form.
 *
 * These exist to give fast, field-level feedback. They are not a security
 * boundary — the Edge Function validates the same things again, because
 * anything checked only in the browser is not checked at all.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Irish routing key + unique identifier, e.g. "K67 T9H9". */
const EIRCODE_PATTERN = /^[A-Z]\d{2}\s?[A-Z0-9]{4}$/i;

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
