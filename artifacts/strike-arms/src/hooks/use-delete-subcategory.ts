import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteSubcategory } from '@/data/categories-repository';
import { CATALOGUE_KEYS } from '@/lib/query-keys';

export function useDeleteSubcategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSubcategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATALOGUE_KEYS.subcategoriesRoot }),
  });
}
