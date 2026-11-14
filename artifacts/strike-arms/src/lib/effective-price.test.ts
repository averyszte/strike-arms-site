import assert from "node:assert/strict";
import { test } from "node:test";

import { effectivePriceCents, hasDiscount } from "./effective-price.ts";

test("a lower sale price is what the customer pays", () => {
  assert.equal(effectivePriceCents(5000, 4000), 4000);
  assert.equal(hasDiscount(5000, 4000), true);
});

test("no sale price means the list price", () => {
  assert.equal(effectivePriceCents(5000), 5000);
  assert.equal(effectivePriceCents(5000, null), 5000);
  assert.equal(hasDiscount(5000, undefined), false);
});

test("a sale price at or above the list price is ignored (M-025)", () => {
  assert.equal(effectivePriceCents(5000, 5000), 5000);
  assert.equal(effectivePriceCents(5000, 6000), 5000);
  assert.equal(hasDiscount(5000, 5000), false);
});
