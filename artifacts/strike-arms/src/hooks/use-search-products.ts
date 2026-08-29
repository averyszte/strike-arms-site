import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { fetchAllForSearch } from '@/data/products-repository';
import { searchProducts } from '@/lib/search-products';

/** Debounced live product search for the header dropdown. */
export function useSearchProducts(query: string, debounceMs = 250) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(id);
  }, [query, debounceMs]);

  // Gated on a real query: the pool is the whole published catalogue, and
  // before this was a database call it cost nothing to fetch on every page
  // load. searchProducts ignores anything shorter than two characters, so
  // this fetches exactly when a result could be produced.
  const isSearching = debouncedQuery.trim().length >= 2;

  const { data: allProducts = [] } = useQuery({
    queryKey: ['products-search-pool'],
    queryFn: fetchAllForSearch,
    enabled: isSearching,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const results = useMemo(
    () => searchProducts(allProducts, debouncedQuery),
    [allProducts, debouncedQuery],
  );

  return { results, query: debouncedQuery };
}
