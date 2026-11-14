import assert from "node:assert/strict";
import { test } from "node:test";

import { shouldPlayHeroVideo } from "./hero-video-policy.ts";

const WIDE = { isWideScreen: true, isSavingData: false, prefersReducedMotion: false };

test("plays on a wide screen with no data-saver or reduced motion", () => {
  assert.equal(shouldPlayHeroVideo(WIDE), true);
});

test("shows the poster on a phone, with data-saver, or with reduced motion", () => {
  assert.equal(shouldPlayHeroVideo({ ...WIDE, isWideScreen: false }), false);
  assert.equal(shouldPlayHeroVideo({ ...WIDE, isSavingData: true }), false);
  assert.equal(shouldPlayHeroVideo({ ...WIDE, prefersReducedMotion: true }), false);
});
