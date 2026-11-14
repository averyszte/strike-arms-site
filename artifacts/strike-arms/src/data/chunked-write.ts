import { chunkArray } from '@/lib/chunk-array';
import { loadErrorMessage } from '@/lib/load-error-message';
import { PartialWriteError } from '@/lib/admin-error-message';
import { ID_CHUNK } from '@/data/orders-bulk-reads';

type ChunkResult = { data: { id: string }[] | null; error: unknown };

/**
 * Runs a bulk update chunk by chunk and keeps going past a refused chunk, so
 * the result says which rows did not change rather than "some failed"
 * (M-034, M-040). Chunked because PostgREST puts the id filter in the URL.
 */
export async function writeInChunks(
  ids: string[],
  write: (batch: string[]) => PromiseLike<ChunkResult>,
): Promise<void> {
  const failedIds: string[] = [];
  let reason: string | null = null;

  for (const batch of chunkArray(ids, ID_CHUNK)) {
    const { data, error } = await write(batch);
    if (error) {
      failedIds.push(...batch);
      reason ??= loadErrorMessage(error);
      continue;
    }
    const written = new Set((data ?? []).map(row => row.id));
    const missed = batch.filter(id => !written.has(id));
    if (missed.length > 0) {
      failedIds.push(...missed);
      reason ??= 'Nothing was saved for these. Reload and try again.';
    }
  }

  if (failedIds.length > 0) throw new PartialWriteError(failedIds, ids.length, reason ?? '');
}
