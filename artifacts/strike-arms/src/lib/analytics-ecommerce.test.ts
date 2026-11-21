import assert from "node:assert/strict";
import { test } from "node:test";

import { buildEcommercePayload, centsToEuros } from "./analytics-ecommerce.ts";

const LINE = { productId: "p1", name: "BBs", brand: "asg", unitPriceCents: 1199, quantity: 3 };

test("money goes to GA4 in euros, not cents", () => {
  assert.equal(centsToEuros(24000), 240);
  assert.equal(centsToEuros(1199), 11.99);
});

test("the payload totals price times quantity and keeps the order id", () => {
  const payload = buildEcommercePayload([LINE, { ...LINE, productId: "p2", unitPriceCents: 500, quantity: 1 }], "SA-1001");
  assert.equal(payload.currency, "EUR");
  assert.equal(payload.value, 40.97);
  assert.equal(payload.items.length, 2);
  assert.equal(payload.items[0].price, 11.99);
  assert.equal(payload.transaction_id, "SA-1001");
});

test("no order id means no transaction_id key, and no category means no item_category", () => {
  const payload = buildEcommercePayload([LINE]);
  assert.equal("transaction_id" in payload, false);
  assert.equal("item_category" in payload.items[0], false);
});
