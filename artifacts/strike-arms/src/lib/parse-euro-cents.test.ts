import assert from "node:assert/strict";
import { test } from "node:test";

import { formatCentsPlain, formatPrice } from "./format-price.ts";
import { parseEuroCents } from "./parse-euro-cents.ts";

test("formatting keeps two decimals", () => {
  assert.equal(formatPrice(18900), "€189.00");
  assert.equal(formatCentsPlain(5), "0.05");
});

test("parsing rounds rather than truncates", () => {
  assert.equal(parseEuroCents("6.50"), 650);
  assert.equal(parseEuroCents(" 24.99 "), 2499);
  assert.equal(parseEuroCents("10"), 1000);
});

test("parsing refuses what is not a euro amount", () => {
  assert.equal(parseEuroCents("abc"), null);
  assert.equal(parseEuroCents("1.234"), null);
  assert.equal(parseEuroCents("-5"), null);
  assert.equal(parseEuroCents(""), null);
});

test("format then parse is the identity", () => {
  for (const cents of [0, 1, 99, 650, 18900, 123456]) {
    assert.equal(parseEuroCents(formatCentsPlain(cents)), cents);
  }
});

test("parsing refuses the formats the old per-site parsers also refused", () => {
  // Three decimals, a thousands separator, exponent and hex notation all used
  // to reach Number() or parseFloat() somewhere; none is a euro amount here.
  assert.equal(parseEuroCents("12.345"), null);
  assert.equal(parseEuroCents("1,000.50"), null);
  assert.equal(parseEuroCents("1e3"), null);
  assert.equal(parseEuroCents("0x10"), null);
  assert.equal(parseEuroCents("12."), null);
  assert.equal(parseEuroCents(".5"), null);
});

test("parsing rounds the scaled value, so binary fractions keep their cent", () => {
  // 19.99 * 100 is 1998.9999999999998; truncating it would give 1998.
  assert.equal(parseEuroCents("19.99"), 1999);
  assert.equal(parseEuroCents("0.29"), 29);
  assert.equal(parseEuroCents("8.7"), 870);
});
