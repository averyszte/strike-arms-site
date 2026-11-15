import assert from "node:assert/strict";
import { test } from "node:test";

import { shouldTrackPath } from "./analytics-config.ts";

test("shop pages are tracked", () => {
  assert.equal(shouldTrackPath("/"), true);
  assert.equal(shouldTrackPath("/products/some-rifle"), true);
  assert.equal(shouldTrackPath("/administration-guide"), true);
  assert.equal(shouldTrackPath("/accounts-faq"), true);
});

test("admin, account and checkout pages are not tracked", () => {
  assert.equal(shouldTrackPath("/admin"), false);
  assert.equal(shouldTrackPath("/admin/orders"), false);
  assert.equal(shouldTrackPath("/account/orders"), false);
  assert.equal(shouldTrackPath("/checkout/success"), false);
});
