import assert from "node:assert/strict";
import { test } from "node:test";

import {
  PartialWriteError,
  adminErrorMessage,
  describeAdminError,
  failedItemsMessage,
  listNames,
} from "./admin-error-message.ts";

test("listNames joins with 'and' and caps at five", () => {
  assert.equal(listNames(["A"]), "A");
  assert.equal(listNames(["A", "B", "C"]), "A, B and C");
  assert.equal(listNames(["A", "B", "C", "D", "E", "F", "G"]), "A, B, C, D, E and 2 more");
});

test("failedItemsMessage names the failed rows and counts the rest", () => {
  const names = new Map([["1", "Specna M4"], ["2", "Ares AK"]]);
  const error = new PartialWriteError(["1", "2", "9"], 10, "Refused.");
  assert.equal(
    failedItemsMessage(error, id => names.get(id), "fallback"),
    "Not changed: Specna M4, Ares AK and 1 other. The other 7 went through. Refused.",
  );
  assert.equal(failedItemsMessage(new Error("x"), () => undefined, "fallback"), "fallback");
});

test("describeAdminError replaces machine wording and keeps the shop's own sentences (N-078)", () => {
  const slug = { code: "23505", message: 'duplicate key value violates unique constraint "products_slug_key"' };
  assert.equal(
    describeAdminError(slug).message,
    "Another product already uses this web address. Change the web address and save again.",
  );
  assert.equal(describeAdminError(slug).details, slug.message);
  assert.match(adminErrorMessage(new Error("JWT expired")), /sign-in has expired/);
  assert.match(adminErrorMessage(new TypeError("Failed to fetch")), /Could not reach the server/);
  const ours = { code: "23514", message: "SA-2026-0012 is not paid, so it cannot be marked shipped" };
  assert.deepEqual(describeAdminError(ours), { message: ours.message, details: null });
});
