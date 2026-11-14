import { strict as assert } from "node:assert";
import { test } from "node:test";

import { IS_COMING_SOON, shouldShowComingSoon } from "./coming-soon-gate.ts";

const LIVE = "strikearms.ie";

test("other hosts and the preview pass are never gated", () => {
  assert.equal(shouldShowComingSoon("strike-arms.pages.dev", "/", false), false);
  assert.equal(shouldShowComingSoon("localhost", "/cart", false), false);
  assert.equal(shouldShowComingSoon(LIVE, "/cart", true), false);
});

test("money and account links stay open on the live domain", { skip: !IS_COMING_SOON }, () => {
  for (const path of [
    "/admin",
    "/admin/orders",
    "/auth/confirm",
    "/checkout/success",
    "/account",
    "/account/",
    "/account/confirm",
    "/account/reset",
    "/account/details",
  ]) {
    assert.equal(shouldShowComingSoon(LIVE, path, false), false, path);
  }
});

test("shopping and sign-up stay behind the holding page", { skip: !IS_COMING_SOON }, () => {
  for (const path of ["/", "/cart", "/store", "/account/sign-up", "/account/sign-in", "/administrator", "/checkout/successful"]) {
    assert.equal(shouldShowComingSoon(LIVE, path, false), true, path);
    assert.equal(shouldShowComingSoon(`www.${LIVE}`, path, false), true, path);
  }
});
