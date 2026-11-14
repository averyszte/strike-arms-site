/**
 * Secret access for the Edge Functions.
 *
 * Secrets are read at boot, so changing one in the dashboard does nothing to
 * a running instance: the function must be redeployed to pick it up. Reading
 * them through this module means a missing secret fails loudly on the first
 * request naming the variable, instead of surfacing later as an opaque
 * Stripe or PostgREST error.
 */

/** A required secret is not set. The message names it, never a value. */
export class MissingSecretError extends Error {
  readonly secretName: string;

  constructor(name: string) {
    super(
      `Missing secret ${name}. Set it with \`supabase secrets set ${name}=...\` ` +
        `and then REDEPLOY the function. Secrets are read at boot.`,
    );
    this.name = "MissingSecretError";
    this.secretName = name;
  }
}

export function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new MissingSecretError(name);
  return value;
}

export function optionalEnv(name: string): string | undefined {
  return Deno.env.get(name) || undefined;
}

/** The names in `names` that are not set, for a check before any work starts. */
export function missingEnv(names: readonly string[]): string[] {
  return names.filter((name) => !optionalEnv(name));
}

/**
 * Whether this is the local Supabase stack rather than the hosted project.
 * The hosted SUPABASE_URL is always https; the local stack's is http (for
 * example http://kong:8000 inside Docker). Unlike a request's Origin header,
 * a caller cannot set this, so it is what the local-only escape hatches use.
 * Unset counts as hosted, so a misconfigured deploy fails closed.
 */
export function isLocalStack(): boolean {
  const url = optionalEnv("SUPABASE_URL");
  return url !== undefined && url.startsWith("http://");
}
