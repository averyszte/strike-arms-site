import assert from "node:assert/strict";
import { test } from "node:test";

import type { CheckoutDetails } from "@/types/cart";

import { validateCheckoutDetails } from "./checkout-validation.ts";

const DELIVERY: CheckoutDetails = {
  customerName: "Test Shopper",
  customerEmail: "shopper@example.com",
  customerPhone: "",
  ageConfirmed: true,
  wantsDelivery: true,
  shippingName: "Test Shopper",
  shippingLine1: "1 Main Street",
  shippingLine2: "",
  shippingCity: "Dublin",
  shippingCounty: "Dublin",
  shippingEircode: "",
};

function eircodeError(eircode: string): string | undefined {
  return validateCheckoutDetails({ ...DELIVERY, shippingEircode: eircode }).shippingEircode;
}

test("accepts ordinary Eircodes, with or without the space", () => {
  assert.equal(eircodeError("K67 T9H9"), undefined);
  assert.equal(eircodeError("d02x285"), undefined);
});

test("accepts Dublin 6W, the one routing key with a letter in it", () => {
  assert.equal(eircodeError("D6W XY12"), undefined);
  assert.equal(eircodeError("d6wxy12"), undefined);
});

test("refuses codes outside the Eircode format", () => {
  assert.notEqual(eircodeError("D6X XY12"), undefined);
  assert.notEqual(eircodeError("B12 3456"), undefined);
  assert.notEqual(eircodeError("K67 T9H"), undefined);
  assert.notEqual(eircodeError(""), undefined);
});
