/**
 * A non-2xx reply from an Edge Function arrives from supabase-js as an error
 * with the Response attached. The functions put a message safe to show in
 * its `error` field; these read it, or give back the fallback.
 */

export type FunctionErrorReply = {
  /** The HTTP status, or null when there was no response (a network failure). */
  status: number | null;
  /** The parsed JSON body, or an empty object when it was missing or not JSON. */
  body: Record<string, unknown>;
};

/** The status and body of a failed function call, read once. */
export async function readFunctionError(error: unknown): Promise<FunctionErrorReply> {
  const context = (error as { context?: unknown })?.context;
  if (!(context instanceof Response)) return { status: null, body: {} };

  try {
    const body: unknown = await context.json();
    const isRecord = typeof body === 'object' && body !== null && !Array.isArray(body);
    return { status: context.status, body: isRecord ? (body as Record<string, unknown>) : {} };
  } catch {
    return { status: context.status, body: {} };
  }
}

/** The `error` field of a reply, when it is a non-empty string. */
export function replyMessage(reply: FunctionErrorReply, fallback: string): string {
  const message = reply.body.error;
  return typeof message === 'string' && message.length > 0 ? message : fallback;
}

export async function functionErrorMessage(error: unknown, fallback: string): Promise<string> {
  return replyMessage(await readFunctionError(error), fallback);
}
