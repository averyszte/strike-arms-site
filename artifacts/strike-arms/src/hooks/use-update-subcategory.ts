import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateSubcategory } from '@/data/categories-repository';
import { CATALOGUE_KEYS } from '@/lib/query-keys';

export function useUpdateSubcategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: { name?: string; sortOrder?: number };
    }) => updateSubcategory(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATALOGUE_KEYS.subcategoriesRoot }),
  });
}
