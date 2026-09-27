/**
 * The message inside whatever a failed read threw.
 *
 * Supabase's PostgrestError is a plain object with a `message`, not an Error,
 * so an `instanceof Error` check alone drops the one line that says what went
 * wrong. A browser that is offline throws a TypeError ("Failed to fetch"),
 * which is an Error. Anything else gets a sentence rather than "[object Object]".
 */
export function loadErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const { message } = error as { message: unknown };
    if (typeof message === 'string' && message) return message;
  }
  return 'No reason was given.';
}
