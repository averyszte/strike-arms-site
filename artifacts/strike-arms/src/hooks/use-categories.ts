import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from '@/data/categories-repository';
import type { Category } from '@/types/product';
import type { Subcategory } from '@/types/category';

export function useSubcategories(category?: Category) {
  return useQuery({
    queryKey: ['subcategories', category ?? 'all'],
    queryFn: () => listSubcategories(category),
  });
}

export function useCreateSubcategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Subcategory, 'id'>) => createSubcategory(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subcategories'] }),
  });
}

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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subcategories'] }),
  });
}

export function useDeleteSubcategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSubcategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subcategories'] }),
  });
}
