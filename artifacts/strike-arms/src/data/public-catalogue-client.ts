/**
 * A REST-only client for the public catalogue reads (N-031, PD5).
 *
 * supabase-js bundles Auth, Realtime (with phoenix), Storage and Functions
 * clients alongside PostgREST. The storefront's first screen needs only
 * PostgREST, and pulling the whole client into the entry chunk cost about
 * 200 kB raw on every first visit. This builds the PostgREST client on its
 * own, with the anon key, so the full client (supabase-client.ts) is loaded
 * only by the pages that need it: account, admin, checkout, enquiries.
 *
 * Every read through this client is anonymous. That is what the storefront
 * repositories already assume: each pins `is_published = true`, and the
 * catalogue_counts view and search_products RPC are security invoker with
 * the same filter, so a signed-in customer or admin got exactly the rows an
 * anonymous visitor gets. Anything that needs the user's session (admin
 * reads, account data, writes) must keep using supabase-client.ts.
 */

import { PostgrestClient } from '@supabase/postgrest-js';
import type { Database } from '@/types/database';
import { verifySupabaseConfig } from '@/lib/verify-supabase-config';

const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

verifySupabaseConfig(url, anonKey);

/** The same headers supabase-js sends for a request with no session. */
export const publicCatalogue = new PostgrestClient<Database>(`${url}/rest/v1`, {
  headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
});
