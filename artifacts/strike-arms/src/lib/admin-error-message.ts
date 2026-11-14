/**
 * Bulk-action failures that name what failed (M-040).
 *
 * A bulk write keeps going past a refused row and then throws this, so the
 * toast can say "Not changed: Specna M4, Ares AK" instead of "Some updates
 * failed", and nobody has to work out which ones by hand.
 */

export class PartialWriteError extends Error {
  readonly failedIds: string[];
  readonly total: number;

  constructor(failedIds: string[], total: number, reason: string) {
    super(reason || 'The update was refused.');
    this.name = 'PartialWriteError';
    this.failedIds = failedIds;
    this.total = total;
  }
}

const NAMED = 5;

/** "A, B and C", or "A, B, C, D, E and 3 more". */
export function listNames(names: string[]): string {
  const shown = names.slice(0, NAMED);
  const rest = names.length - shown.length;
  if (rest > 0) return `${shown.join(', ')} and ${rest} more`;
  if (shown.length <= 1) return shown.join('');
  return `${shown.slice(0, -1).join(', ')} and ${shown[shown.length - 1]}`;
}

/**
 * The toast description for a failed bulk write. nameOf turns an id into
 * something a person recognises; an id it does not know is counted, not shown.
 */
export function failedItemsMessage(
  error: unknown,
  nameOf: (id: string) => string | undefined,
  fallback: string,
): string {
  if (!(error instanceof PartialWriteError)) return fallback;
  const names = error.failedIds.flatMap(id => nameOf(id) ?? []);
  const unnamed = error.failedIds.length - names.length;
  if (unnamed > 0) names.push(`${unnamed} other${unnamed === 1 ? '' : 's'}`);
  const done = error.total - error.failedIds.length;
  const head = `Not changed: ${listNames(names)}.`;
  const tail = done > 0 ? ` The other ${done} went through.` : '';
  return `${head}${tail} ${error.message}`;
}
