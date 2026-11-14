import assert from "node:assert/strict";
import { test } from "node:test";

import { CHUNK_RELOAD_GAP_MS, shouldReloadForChunkError } from "./chunk-reload-guard.ts";

test("reloads when there was no earlier reload", () => {
  assert.equal(shouldReloadForChunkError(null, 1_000), true);
  assert.equal(shouldReloadForChunkError("not a number", 1_000), true);
});

test("does not reload again straight after a reload", () => {
  assert.equal(shouldReloadForChunkError("1000", 1_000 + CHUNK_RELOAD_GAP_MS), false);
});

test("reloads again once the gap has passed", () => {
  assert.equal(shouldReloadForChunkError("1000", 1_001 + CHUNK_RELOAD_GAP_MS), true);
});
