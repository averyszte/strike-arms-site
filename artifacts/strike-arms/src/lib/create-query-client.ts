import { QueryClient } from '@tanstack/react-query';

import { CUSTOMER_QUERY_ROOT, STALE_TIME_FIVE_MINUTES } from '@/lib/query-keys';

/**
 * Storefront data (catalogue, brands, rates) changes rarely, so it is kept for
 * five minutes and not refetched on every tab switch. Admin and account data
 * keep React Query's defaults: always fresh, refetched on focus.
 *
 * A function rather than a module constant so the build-time prerender
 * (entry-server.tsx) gets a fresh cache for every page it renders.
 */
export function createQueryClient(): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: { staleTime: STALE_TIME_FIVE_MINUTES, refetchOnWindowFocus: false },
    },
  });
  client.setQueryDefaults(['admin'], { staleTime: 0, refetchOnWindowFocus: true });
  client.setQueryDefaults([CUSTOMER_QUERY_ROOT], { staleTime: 0, refetchOnWindowFocus: true });
  return client;
}
