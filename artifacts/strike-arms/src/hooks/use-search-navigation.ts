import { useCallback } from 'react';
import { useLocation } from 'wouter';

import type { Product } from '@/types/product';

/** Where the header search sends the shopper: a product, the results page, or the whole store. */
export function useSearchNavigation(query: string, closeAndClear: () => void) {
  const [, navigate] = useLocation();

  const goToProduct = useCallback(
    (p: Product) => {
      navigate(`/products/${p.slug}`);
      closeAndClear();
    },
    [navigate, closeAndClear],
  );

  const submitSearch = useCallback(() => {
    if (!query.trim()) return;
    navigate(`/store?q=${encodeURIComponent(query.trim())}`);
    closeAndClear();
  }, [query, navigate, closeAndClear]);

  const browseAll = useCallback(() => {
    navigate('/store');
    closeAndClear();
  }, [navigate, closeAndClear]);

  return { goToProduct, submitSearch, browseAll };
}
