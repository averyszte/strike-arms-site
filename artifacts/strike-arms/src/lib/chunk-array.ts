/**
 * Splits a list into fixed-size batches.
 *
 * Used where a single request would otherwise carry every id at once: a
 * PostgREST `in.()` of a few hundred UUIDs makes a URL long enough to be
 * refused by something in the middle before it reaches the database.
 */
export function chunkArray<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
}
