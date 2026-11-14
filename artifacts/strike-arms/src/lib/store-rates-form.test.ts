import assert from "node:assert/strict";
import { test } from "node:test";

import {
  describeRateChanges,
  storeRatesWarnings,
  validateStoreRates,
} from "./store-rates-form.ts";

const SAVED = { shippingFlatCents: 650, freeShippingThresholdCents: 7500, vatRateBasisPoints: 2300 };

test("rates inside the bounds pass", () => {
  assert.deepEqual(
    validateStoreRates({ shippingFlat: "6.50", freeShippingThreshold: "75", vatRate: "23" }),
    {},
  );
});

test("rates outside the database bounds are refused", () => {
  const errors = validateStoreRates({
    shippingFlat: "500",
    freeShippingThreshold: "2000.01",
    vatRate: "31",
  });
  assert.ok(errors.shippingFlat);
  assert.ok(errors.freeShippingThreshold);
  assert.ok(errors.vatRate);
});

test("unusual but allowed rates are warned about", () => {
  assert.deepEqual(storeRatesWarnings(SAVED), []);
  const warnings = storeRatesWarnings({
    shippingFlatCents: 3500,
    freeShippingThresholdCents: 0,
    vatRateBasisPoints: 2100,
  });
  assert.equal(warnings.length, 3);
});

test("only changed rates are listed, old against new", () => {
  const changes = describeRateChanges(SAVED, { ...SAVED, shippingFlatCents: 800 });
  assert.deepEqual(changes, [{ label: "Delivery charge", from: "€6.50", to: "€8.00" }]);
});
