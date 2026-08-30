import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts,
  bulkDeleteProducts,
} from '@/data/admin-products-repository';
import type { Product, ProductBulkPatch } from '@/types/product';

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

/** Every product write invalidates the same three caches. */
function useProductInvalidation() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['admin', 'products'] });
    qc.invalidateQueries({ queryKey: ['products'] });
    qc.invalidateQueries({ queryKey: ['subcategories'] });
  };
}

export function useBulkUpdateProducts() {
  const invalidate = useProductInvalidation();
  return useMutation({
    mutationFn: ({ ids, patch }: { ids: string[]; patch: ProductBulkPatch }) =>
      bulkUpdateProducts(ids, patch),
    onSuccess: invalidate,
  });
}

export function useBulkDeleteProducts() {
  const invalidate = useProductInvalidation();
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteProducts(ids),
    onSuccess: invalidate,
  });
}
