import assert from "node:assert/strict";
import { test } from "node:test";

import { cardVariantOf } from "./product-image-variants.ts";

test("the card copy sits beside the full photo, query kept", () => {
  assert.equal(cardVariantOf("products/2026/abc.jpg"), "products/2026/abc-card.jpg");
  assert.equal(
    cardVariantOf("https://x.supabase.co/storage/v1/object/public/product-images/products/2026/abc.png?v=1"),
    "https://x.supabase.co/storage/v1/object/public/product-images/products/2026/abc-card.png?v=1",
  );
});

test("a path with no extension is left alone", () => {
  assert.equal(cardVariantOf("products/2026.v/abc"), "products/2026.v/abc");
});
