import assert from "node:assert/strict";
import { test } from "node:test";

import { functionErrorMessage, replyMessage } from "./function-error-message.ts";

const reply = (body: Record<string, unknown>) => ({ status: 400, body });

test("a known generic code gets the shopper wording", () => {
  assert.equal(
    replyMessage(reply({ error: "x", code: "rate_limited" }), "fallback"),
    "Too many attempts in a short time. Please wait a few minutes and try again.",
  );
  assert.match(replyMessage(reply({ code: "captcha_failed" }), ""), /bot check did not pass/);
});

test("invalid_request keeps the server's specific message, mapped only when it is missing", () => {
  assert.equal(replyMessage(reply({ error: "Email is required.", code: "invalid_request" }), "f"), "Email is required.");
  assert.match(replyMessage(reply({ code: "invalid_request" }), "f"), /was not accepted/);
});

test("an unknown or missing code behaves as before", () => {
  assert.equal(replyMessage(reply({ error: "Server said so", code: "other" }), "f"), "Server said so");
  assert.equal(replyMessage(reply({}), "fallback"), "fallback");
});

test("a function error carrying a Response is read through", async () => {
  const error = { context: new Response(JSON.stringify({ code: "captcha_missing" }), { status: 400 }) };
  assert.equal(await functionErrorMessage(error, ""), "Please complete the bot check and try again.");
  assert.equal(await functionErrorMessage(new Error("network"), "fallback"), "fallback");
});
