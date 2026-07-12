import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllForSearch } from '@/data/products-repository';
import { searchProducts } from '@/lib/search-products';

export function useSearchProducts(query: string, debounceMs = 250) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(id);
  }, [query, debounceMs]);

  const { data: allProducts = [] } = useQuery({
    queryKey: ['products-search-pool'],
    queryFn: fetchAllForSearch,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const results = useMemo(
    () => searchProducts(allProducts, debouncedQuery),
    [allProducts, debouncedQuery],
  );

  return { results, query: debouncedQuery };
}
