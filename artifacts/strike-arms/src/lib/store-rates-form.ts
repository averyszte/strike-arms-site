import type { StoreRates } from '@/types/store-settings';
// Relative, not @/: node --test runs store-rates-form.test.ts with no alias map.
import { formatCentsPlain, formatPrice } from './format-price.ts';
import { isEuroAmount, parseEuroCents } from './parse-euro-cents.ts';

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

// Euros are checked by isEuroAmount (W-03): Number() alone accepts "1e3" and hex.
// A percentage with at most two decimals, so 23 and 13.5 both work.
const PERCENT = /^\d+(\.\d{1,2})?$/;

// Hard limits, the same as the 043 check constraints: anything outside them
// cannot be meant, and the database would refuse it anyway (M-029).
export const MAX_SHIPPING_CENTS = 10_000;
export const MAX_THRESHOLD_CENTS = 200_000;
export const MAX_VAT_BASIS_POINTS = 3_000;

// Soft limits: allowed, but the confirm step calls them out.
const WARN_SHIPPING_CENTS = 3_000;
const IRISH_VAT_BASIS_POINTS = [0, 900, 1_350, 2_300];

export function ratesToForm(rates: StoreRates): StoreRatesForm {
  return {
    shippingFlat: formatCentsPlain(rates.shippingFlatCents),
    freeShippingThreshold: formatCentsPlain(rates.freeShippingThresholdCents),
    vatRate: String(rates.vatRateBasisPoints / 100),
  };
}

/**
 * Rounds rather than truncates, and rounds the *scaled* value: 6.5 euro is
 * 649.9999... in binary, and Math.round on the scaled number lands on 650
 * where a bare `| 0` lands on 649 and undercharges by a cent forever.
 *
 * Only meaningful after validateStoreRates has passed; a euro field that is
 * not an amount comes back as NaN, as Number() made of it before.
 */
export function formToRates(form: StoreRatesForm): StoreRates {
  return {
    shippingFlatCents: parseEuroCents(form.shippingFlat) ?? Number.NaN,
    freeShippingThresholdCents: parseEuroCents(form.freeShippingThreshold) ?? Number.NaN,
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
  const rates = formToRates(form);

  if (!isEuroAmount(form.shippingFlat) || rates.shippingFlatCents > MAX_SHIPPING_CENTS) {
    errors.shippingFlat = 'Enter an amount in euro between 0 and 100, e.g. 6.50';
  }

  if (
    !isEuroAmount(form.freeShippingThreshold) ||
    rates.freeShippingThresholdCents > MAX_THRESHOLD_CENTS
  ) {
    errors.freeShippingThreshold = 'Enter an amount in euro between 0 and 2,000, e.g. 75.00';
  }

  if (!PERCENT.test(form.vatRate.trim()) || rates.vatRateBasisPoints > MAX_VAT_BASIS_POINTS) {
    errors.vatRate = 'Enter a rate between 0 and 30, e.g. 23';
  }

  return errors;
}

/**
 * Values that are allowed but unusual, shown in the confirm step so a slip
 * (30 euro delivery, a threshold of 0, a VAT rate Ireland does not use) is
 * seen before it reaches every customer.
 */
export function storeRatesWarnings(rates: StoreRates): string[] {
  const warnings: string[] = [];
  if (rates.shippingFlatCents > WARN_SHIPPING_CENTS) {
    warnings.push('Delivery is over 30 euro.');
  }
  if (rates.freeShippingThresholdCents === 0) {
    warnings.push('A threshold of 0 makes every delivery free.');
  }
  if (!IRISH_VAT_BASIS_POINTS.includes(rates.vatRateBasisPoints)) {
    warnings.push('VAT is not one of the Irish rates (0, 9, 13.5 or 23 per cent).');
  }
  return warnings;
}

export type RateChange = { label: string; from: string; to: string };

function percent(basisPoints: number): string {
  return `${basisPoints / 100}%`;
}

/** Old against new, only for the rates that changed. */
export function describeRateChanges(saved: StoreRates, next: StoreRates): RateChange[] {
  const rows: RateChange[] = [
    { label: 'Delivery charge', from: formatPrice(saved.shippingFlatCents), to: formatPrice(next.shippingFlatCents) },
    {
      label: 'Free delivery over',
      from: formatPrice(saved.freeShippingThresholdCents),
      to: formatPrice(next.freeShippingThresholdCents),
    },
    { label: 'VAT rate', from: percent(saved.vatRateBasisPoints), to: percent(next.vatRateBasisPoints) },
  ];
  return rows.filter(row => row.from !== row.to);
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
