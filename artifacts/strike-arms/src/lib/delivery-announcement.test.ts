import assert from "node:assert/strict";
import { test } from "node:test";

import { DELIVERY_ANNOUNCEMENT_FALLBACK, deliveryAnnouncement } from "./delivery-announcement.ts";

const RATES = { shippingFlatCents: 1250, freeShippingThresholdCents: 12000, vatRateBasisPoints: 2300 };

test("a round threshold is shown without cents", () => {
  assert.deepEqual(deliveryAnnouncement(RATES), {
    full: "Free delivery in Ireland on orders of €120 or more",
    short: "Free delivery on orders of €120+",
  });
});

test("a threshold with cents keeps them", () => {
  assert.match(deliveryAnnouncement({ ...RATES, freeShippingThresholdCents: 9950 }).full, /€99\.50 or more$/);
});

test("no rates yet means no figure is quoted", () => {
  assert.equal(deliveryAnnouncement(undefined).full, DELIVERY_ANNOUNCEMENT_FALLBACK);
});

test("a zero threshold means everything is free", () => {
  assert.equal(
    deliveryAnnouncement({ ...RATES, freeShippingThresholdCents: 0 }).full,
    "Free delivery anywhere in the Republic of Ireland",
  );
});
