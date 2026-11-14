/**
 * After a deploy, a tab opened before it can ask for a page chunk that no
 * longer exists. Reloading picks up the new build; this guard stops a chunk
 * that is genuinely broken from reloading the page in a loop.
 */

/** The sessionStorage key holding when the last such reload happened. */
export const CHUNK_RELOAD_KEY = "strike-arms:chunk-reload-at";

/** The least time between two automatic reloads. */
export const CHUNK_RELOAD_GAP_MS = 10_000;

/** Whether to reload now, given when the last reload was (raw stored value). */
export function shouldReloadForChunkError(lastReloadAt: string | null, now: number): boolean {
  const last = lastReloadAt === null ? Number.NaN : Number(lastReloadAt);
  if (!Number.isFinite(last)) return true;
  return now - last > CHUNK_RELOAD_GAP_MS;
}
