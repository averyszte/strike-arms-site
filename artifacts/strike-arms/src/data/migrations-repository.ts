import { supabase } from '@/lib/supabase';

/**
 * What the database says it has applied.
 *
 * The one interesting case is the function being missing. applied_migrations()
 * arrives in migration 016, so on a database that is behind, the check itself
 * is one of the things that has not been installed. PostgREST answers that
 * with PGRST202 rather than an empty list, and the caller has to be able to
 * tell the two apart: "nothing is applied" and "I cannot tell" are different
 * answers and only one of them should look reassuring.
 */

/** PostgREST: the function does not exist in the exposed schema. */
const FUNCTION_MISSING = 'PGRST202';

export type AppliedMigrations = { kind: 'ok'; versions: string[] } | { kind: 'check-missing' };

export async function listAppliedMigrations(): Promise<AppliedMigrations> {
  const { data, error } = await supabase.rpc('applied_migrations');

  if (error) {
    if (error.code === FUNCTION_MISSING) return { kind: 'check-missing' };
    throw new Error(error.message);
  }

  return { kind: 'ok', versions: (data ?? []).map((row) => row.version) };
}
