import assert from "node:assert/strict";
import { test } from "node:test";

import { cardImageSrcSet, resizedProductImage } from "./card-image-srcset.ts";

const STORED = "https://x.supabase.co/storage/v1/object/public/product-images/products/2026/abc.jpg";
const RENDER = "https://x.supabase.co/storage/v1/render/image/public/product-images/products/2026/abc.jpg";

test("a stored photo is resized through the render endpoint", () => {
  assert.equal(resizedProductImage(STORED, 320), `${RENDER}?width=320&quality=75`);
});

test("a stored photo offers every width, smallest first", () => {
  assert.equal(
    cardImageSrcSet(STORED),
    [160, 320, 480, 640, 960].map((w) => `${RENDER}?width=${w}&quality=75 ${w}w`).join(", "),
  );
});

test("an existing query string is replaced, not doubled", () => {
  assert.equal(resizedProductImage(`${STORED}?v=2`, 160), `${RENDER}?width=160&quality=75`);
});

test("the placeholder and external images get no srcset", () => {
  assert.equal(cardImageSrcSet("/images/placeholder-product.webp"), undefined);
  assert.equal(cardImageSrcSet("https://example.com/rifle.jpg"), undefined);
});
