/**
 * Secret access for the Edge Functions.
 *
 * Secrets are read at boot, so changing one in the dashboard does nothing to
 * a running instance — the function must be redeployed to pick it up. Reading
 * them through this module means a missing secret fails loudly on the first
 * request naming the variable, instead of surfacing later as an opaque
 * Stripe or PostgREST error.
 */

export function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(
      `Missing secret ${name}. Set it with \`supabase secrets set ${name}=...\` ` +
        `and then REDEPLOY the function — secrets are read at boot.`,
    );
  }
  return value;
}

export function optionalEnv(name: string): string | undefined {
  return Deno.env.get(name) || undefined;
}
