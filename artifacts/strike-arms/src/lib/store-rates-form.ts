import type { StoreRates } from '@/types/store-settings';

/**
 * The rates as they are typed: euros and a percentage, not cents and basis
 * points. Storing them as strings while editing means a half-typed "7." does
 * not round-trip into 700 and back onto the screen as "7.00".
 */
export type StoreRatesForm = {
  shippingFlat: string;
  freeShippingThreshold: string;
  vatRate: string;
};

export type StoreRatesErrors = Partial<Record<keyof StoreRatesForm, string>>;

// Euros with at most two decimals. Number() alone accepts "1e3" and hex.
const EUROS = /^\d+(\.\d{1,2})?$/;
// A percentage with at most two decimals, so 23 and 13.5 both work.
const PERCENT = /^\d+(\.\d{1,2})?$/;

const MAX_VAT_PERCENT = 100;

export function ratesToForm(rates: StoreRates): StoreRatesForm {
  return {
    shippingFlat: (rates.shippingFlatCents / 100).toFixed(2),
    freeShippingThreshold: (rates.freeShippingThresholdCents / 100).toFixed(2),
    vatRate: String(rates.vatRateBasisPoints / 100),
  };
}

/**
 * Rounds rather than truncates, and rounds the *scaled* value: 6.5 euro is
 * 649.9999... in binary, and Math.round on the scaled number lands on 650
 * where a bare `| 0` lands on 649 and undercharges by a cent forever.
 */
export function formToRates(form: StoreRatesForm): StoreRates {
  return {
    shippingFlatCents: Math.round(Number(form.shippingFlat) * 100),
    freeShippingThresholdCents: Math.round(Number(form.freeShippingThreshold) * 100),
    vatRateBasisPoints: Math.round(Number(form.vatRate) * 100),
  };
}

/**
 * These three numbers decide what every customer is charged, so a typo here is
 * not a display bug -- it is money. Nothing is coerced quietly: a field that is
 * not a plain amount is rejected rather than parsed into whatever Number()
 * makes of it.
 */
export function validateStoreRates(form: StoreRatesForm): StoreRatesErrors {
  const errors: StoreRatesErrors = {};

  if (!EUROS.test(form.shippingFlat.trim())) {
    errors.shippingFlat = 'Enter an amount in euro, e.g. 6.50';
  }

  if (!EUROS.test(form.freeShippingThreshold.trim())) {
    errors.freeShippingThreshold = 'Enter an amount in euro, e.g. 75.00';
  }

  const vat = Number(form.vatRate.trim());
  if (!PERCENT.test(form.vatRate.trim()) || vat > MAX_VAT_PERCENT) {
    errors.vatRate = 'Enter a rate between 0 and 100, e.g. 23';
  }

  return errors;
}

/** True when nothing was actually changed, so a no-op does not hit the network. */
export function ratesAreUnchanged(form: StoreRatesForm, saved: StoreRates): boolean {
  const next = formToRates(form);
  return (
    next.shippingFlatCents === saved.shippingFlatCents &&
    next.freeShippingThresholdCents === saved.freeShippingThresholdCents &&
    next.vatRateBasisPoints === saved.vatRateBasisPoints
  );
}
