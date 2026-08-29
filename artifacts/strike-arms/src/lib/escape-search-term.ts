/**
 * Make a user-typed search term safe to interpolate into a PostgREST filter.
 *
 * PostgREST parses `.or()` as a comma-separated list with parenthesised
 * groups, so a term containing a comma or bracket does not fail loudly — it
 * silently reinterprets the rest of the query as more filter clauses. The
 * percent and underscore are ilike wildcards, and a trailing backslash
 * escapes our own closing delimiter.
 *
 * Everything in that set is stripped rather than escaped: none of it is
 * meaningful in a product search, and stripping cannot be got wrong.
 */
const POSTGREST_UNSAFE = /[,()%_\\"']/g;

export function escapeSearchTerm(raw: string): string {
  return raw.replace(POSTGREST_UNSAFE, ' ').trim();
}
