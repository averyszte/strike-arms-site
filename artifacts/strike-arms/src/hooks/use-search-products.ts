import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { searchCatalogue } from '@/data/products-repository';
import type { Product } from '@/types/product';

/** Stable empty array, so a query with no data does not remount the results. */
const NO_RESULTS: Product[] = [];

/**
 * PostgREST reports its own faults with a PGRST* code -- PGRST202 for a
 * function that is not in the schema, PGRST204 for a column that is not on the
 * table. Those are facts about the database, not weather: asking three more
 * times cannot make search_products exist.
 */
function isDeterministicApiError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' && code.startsWith('PGRST');
}

/** Debounced live product search for the header dropdown. */
export function useSearchProducts(query: string, debounceMs = 250) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(id);
  }, [query, debounceMs]);

  const term = debouncedQuery.trim();

  const { data, isError, isPending } = useQuery({
    // Lowercased, so "M4" and "m4" are one cache entry rather than two
    // identical round trips -- the search itself is case-insensitive.
    queryKey: ['product-search', term.toLowerCase()],
    queryFn: () => searchCatalogue(term),
    // Below two characters every result is noise, and asking costs a round
    // trip to be told so.
    enabled: term.length >= 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    // Hold the last term's results while the next are in flight. Without this
    // the panel empties on every keystroke and reads as "no results".
    placeholderData: (previous) => previous,
    // A retried deterministic failure is worse than no retry: the panel holds
    // a wrong answer -- "no results" -- for the seven seconds the backoff
    // takes, and then says the true thing anyway. A dropped connection is
    // worth one more attempt.
    retry: (failureCount, error) => !isDeterministicApiError(error) && failureCount < 2,
  });

  // isError is returned rather than folded into an empty list. A search that
  // failed and a search that found nothing are different answers, and the
  // caller has to be able to say so -- "no results for rifle" when the request
  // actually 404'd sends people away believing the shop does not stock one.
  return { results: data ?? NO_RESULTS, isError, isPending, query: debouncedQuery };
}
