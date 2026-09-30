/**
 * A non-2xx reply from an Edge Function arrives from supabase-js as an error
 * with the Response attached. The functions put a message safe to show in
 * its `error` field; this reads it, or gives back the fallback.
 */
export async function functionErrorMessage(error: unknown, fallback: string): Promise<string> {
  const context = (error as { context?: unknown })?.context;
  if (!(context instanceof Response)) return fallback;

  try {
    const body: unknown = await context.json();
    const message = (body as { error?: unknown })?.error;
    return typeof message === 'string' && message.length > 0 ? message : fallback;
  } catch {
    return fallback;
  }
}
