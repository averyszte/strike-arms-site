import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CONFIRMATION_MAX_POLLS,
  CONFIRMATION_POLL_MS,
  DELAYED_MAX_POLLS,
  DELAYED_POLL_MS,
  confirmationState,
  nextPollDelay,
} from "./checkout-confirmation.ts";

test("asks quickly while confirming, then slowly while delayed", () => {
  assert.equal(nextPollDelay("confirming", 0), CONFIRMATION_POLL_MS);
  assert.equal(nextPollDelay("delayed", CONFIRMATION_MAX_POLLS), DELAYED_POLL_MS);
});

test("stops asking once delayed has run its course, or the order is settled", () => {
  assert.equal(nextPollDelay("delayed", DELAYED_MAX_POLLS), false);
  assert.equal(nextPollDelay("paid", 1), false);
  assert.equal(nextPollDelay("unconfirmed", 1), false);
});

test("a failed check is delayed, never unconfirmed", () => {
  assert.equal(confirmationState(undefined, 0, true), "delayed");
});

test("still pending after the quick minute is delayed", () => {
  assert.equal(confirmationState(undefined, CONFIRMATION_MAX_POLLS - 1, false), "confirming");
  assert.equal(confirmationState(undefined, CONFIRMATION_MAX_POLLS, false), "delayed");
});
