import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createSubcategory } from '@/data/categories-repository';
import { CATALOGUE_KEYS } from '@/lib/query-keys';
import type { Subcategory } from '@/types/category';

export function useCreateSubcategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Subcategory, 'id'>) => createSubcategory(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATALOGUE_KEYS.subcategoriesRoot }),
  });
}
