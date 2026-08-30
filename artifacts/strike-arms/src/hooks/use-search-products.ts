import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { searchCatalogue } from '@/data/products-repository';
import type { Product } from '@/types/product';

/** Stable empty array, so a query with no data does not remount the results. */
const NO_RESULTS: Product[] = [];

/** Debounced live product search for the header dropdown. */
export function useSearchProducts(query: string, debounceMs = 250) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(id);
  }, [query, debounceMs]);

  const term = debouncedQuery.trim();

  const { data } = useQuery({
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
  });

  return { results: data ?? NO_RESULTS, query: debouncedQuery };
}
