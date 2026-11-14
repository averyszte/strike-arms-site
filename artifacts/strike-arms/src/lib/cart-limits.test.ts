import assert from "node:assert/strict";
import { test } from "node:test";

import type { CartLine } from "@/types/cart";

import {
  MAX_CART_LINES,
  canAddToCart,
  isCartLimitError,
  isCartOverLimit,
} from "./cart-limits.ts";

function lines(count: number): CartLine[] {
  return Array.from({ length: count }, (_, i) => ({
    productId: `p${i}`,
    slug: `p${i}`,
    name: `Product ${i}`,
    brand: "Brand",
    image: null,
    unitPriceCents: 1000,
    quantity: 1,
    isShippable: true,
  }));
}

test("a full basket takes no new product, but more of one it holds", () => {
  const full = lines(MAX_CART_LINES);
  assert.equal(canAddToCart(full, "new"), false);
  assert.equal(canAddToCart(full, "p0"), true);
  assert.equal(canAddToCart(lines(MAX_CART_LINES - 1), "new"), true);
});

test("checkout refuses only a basket over the cap", () => {
  assert.equal(isCartOverLimit(lines(MAX_CART_LINES)), false);
  assert.equal(isCartOverLimit(lines(MAX_CART_LINES + 1)), true);
});

test("recognises the server's line-cap message", () => {
  assert.equal(isCartLimitError("A basket can have at most 50 lines."), true);
  assert.equal(isCartLimitError("Something else went wrong."), false);
});
