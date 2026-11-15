import assert from "node:assert/strict";
import { test } from "node:test";

import { publicImageSrcSet, scaledImagePath } from "./public-image-srcset.ts";

test("a scaled copy keeps the folder and extension", () => {
  assert.equal(scaledImagePath("/images/playstyles/sniper.webp", 640), "/images/playstyles/sniper-640.webp");
});

test("the srcset lists the copies, then the original at its full width", () => {
  assert.equal(
    publicImageSrcSet("/images/x.webp", [640, 1280], 1900),
    "/images/x-640.webp 640w, /images/x-1280.webp 1280w, /images/x.webp 1900w",
  );
});
