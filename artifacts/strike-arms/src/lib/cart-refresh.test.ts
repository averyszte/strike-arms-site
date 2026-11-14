import assert from "node:assert/strict";
import { test } from "node:test";

import type { CartLine } from "@/types/cart";
import type { FreshCartDetails } from "@/types/cart-freshness";

import { hasCartChanges, refreshCartLines } from "./cart-refresh.ts";

const LINE: CartLine = {
  productId: "p1",
  slug: "p1",
  name: "Rifle",
  brand: "Brand",
  image: null,
  unitPriceCents: 10_000,
  quantity: 1,
  isShippable: true,
};

function fresh(details: Partial<FreshCartDetails>): Map<string, FreshCartDetails> {
  const row: FreshCartDetails = {
    productId: "p1",
    name: "Rifle",
    unitPriceCents: 10_000,
    isShippable: true,
    isInStock: true,
    ...details,
  };
  return new Map([[row.productId, row]]);
}

test("an unchanged, in-stock line reports nothing", () => {
  const result = refreshCartLines([LINE], fresh({}));
  assert.equal(hasCartChanges(result.changes), false);
});

test("an out-of-stock line stays in the cart and is named", () => {
  const result = refreshCartLines([LINE], fresh({ isInStock: false }));
  assert.deepEqual(result.changes.outOfStock, ["Rifle"]);
  assert.equal(result.lines.length, 1);
  assert.equal(hasCartChanges(result.changes), true);
});

test("a product no longer for sale is removed and named", () => {
  const result = refreshCartLines([LINE], new Map());
  assert.deepEqual(result.changes.removed, ["Rifle"]);
  assert.equal(result.lines.length, 0);
});
