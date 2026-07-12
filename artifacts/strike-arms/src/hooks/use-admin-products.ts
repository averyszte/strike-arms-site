import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/data/products-repository';
import type { Product } from '@/types/product';

export function useAdminProducts() {
  return useQuery({
    queryKey: ['admin', 'products'],
    queryFn: listAllProducts,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Product, 'id' | 'createdAt'>) => createProduct(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['subcategories'] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Product> }) =>
      updateProduct(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['subcategories'] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['subcategories'] });
    },
  });
}
