import assert from "node:assert/strict";
import { test } from "node:test";

import { cardImageSrcSet } from "./card-image-srcset.ts";

const STORED = "https://x.supabase.co/storage/v1/object/public/product-images/products/2026/abc.jpg";

test("a stored photo offers the card copy first, the full photo second", () => {
  assert.equal(
    cardImageSrcSet(STORED),
    "https://x.supabase.co/storage/v1/object/public/product-images/products/2026/abc-card.jpg 800w, " +
      `${STORED} 1600w`,
  );
});

test("the placeholder and external images get no srcset", () => {
  assert.equal(cardImageSrcSet("/images/placeholder-product.webp"), undefined);
  assert.equal(cardImageSrcSet("https://example.com/rifle.jpg"), undefined);
});
