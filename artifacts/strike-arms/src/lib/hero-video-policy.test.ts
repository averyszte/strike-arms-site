import assert from "node:assert/strict";
import { test } from "node:test";

import { isSlowConnectionType, shouldPlayHeroVideo } from "./hero-video-policy.ts";

const WIDE = { isWideScreen: true, isSavingData: false, isSlowConnection: false, prefersReducedMotion: false };

test("plays on a wide screen with no data-saver, slow link or reduced motion", () => {
  assert.equal(shouldPlayHeroVideo(WIDE), true);
});

test("shows the poster on a phone or tablet, with data-saver, on a slow link, or with reduced motion", () => {
  assert.equal(shouldPlayHeroVideo({ ...WIDE, isWideScreen: false }), false);
  assert.equal(shouldPlayHeroVideo({ ...WIDE, isSavingData: true }), false);
  assert.equal(shouldPlayHeroVideo({ ...WIDE, isSlowConnection: true }), false);
  assert.equal(shouldPlayHeroVideo({ ...WIDE, prefersReducedMotion: true }), false);
});

test("treats 3g and slower as slow, and an unknown type as fast", () => {
  assert.equal(isSlowConnectionType("3g"), true);
  assert.equal(isSlowConnectionType("slow-2g"), true);
  assert.equal(isSlowConnectionType("4g"), false);
  assert.equal(isSlowConnectionType(undefined), false);
});
