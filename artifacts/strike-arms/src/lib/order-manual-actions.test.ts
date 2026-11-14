import assert from "node:assert/strict";
import { test } from "node:test";

import { canVoidCounterOrder, manualRefundableCents } from "./order-manual-actions.ts";

const SALE = {
  channel: "counter" as const,
  paymentStatus: "paid" as const,
  createdAt: "2026-11-14T23:30:00Z",
  totalCents: 5000,
  refundCents: 1000,
};

test("a counter sale can be voided the same Irish day only", () => {
  assert.equal(canVoidCounterOrder(SALE, new Date("2026-11-14T23:59:00Z")), true);
  assert.equal(canVoidCounterOrder(SALE, new Date("2026-11-15T00:01:00Z")), false);
  assert.equal(canVoidCounterOrder({ ...SALE, channel: "web" }, new Date("2026-11-14T23:59:00Z")), false);
});

test("manual refunds are capped at what is left and need a paid order", () => {
  assert.equal(manualRefundableCents(SALE), 4000);
  assert.equal(manualRefundableCents({ ...SALE, paymentStatus: "refunded" }), 0);
});
