import { useQuery } from '@tanstack/react-query';

import { listSubcategories } from '@/data/categories-repository';
import { CATALOGUE_KEYS } from '@/lib/query-keys';
import type { Category } from '@/types/product';

export function useSubcategories(category?: Category) {
  return useQuery({
    queryKey: CATALOGUE_KEYS.subcategories(category),
    queryFn: () => listSubcategories(category),
  });
}
