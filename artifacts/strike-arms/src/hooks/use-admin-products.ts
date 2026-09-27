import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listAllProducts,
  listProducts,
  createProduct,
  updateProduct,
  bulkUpdateProducts,
  setProductsArchived,
} from '@/data/admin-products-repository';
import type {
  AdminProductListFilters,
  NewProduct,
  ProductBulkPatch,
  ProductPatch,
} from '@/types/product';

export const ALL_PRODUCTS_KEY = ['admin', 'products', 'all'] as const;

/**
 * The whole catalogue, archived included. `enabled` lets a dialog ask for it
 * only once it is open, rather than every visit to the products page paying
 * for a read of everything.
 */
export function useAdminProducts({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ALL_PRODUCTS_KEY,
    queryFn: listAllProducts,
    enabled,
  });
}

/** One page of the products list, filtered on the server. */
export function useAdminProductsList(filters: AdminProductListFilters) {
  return useQuery({
    queryKey: ['admin', 'products', 'list', filters],
    queryFn: () => listProducts(filters),
    // Keeps the current page on screen while the next one or a new search
    // loads, instead of dropping to a spinner on every keystroke.
    placeholderData: keepPreviousData,
  });
}

/** Every product write invalidates the same three caches. */
function useProductInvalidation() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ['admin', 'products'] });
    void qc.invalidateQueries({ queryKey: ['products'] });
    void qc.invalidateQueries({ queryKey: ['subcategories'] });
  };
}

export function useCreateProduct() {
  const qc = useQueryClient();
  const invalidate = useProductInvalidation();
  return useMutation({
    mutationFn: ({ input, openingStock }: { input: NewProduct; openingStock: number }) =>
      createProduct(input, openingStock),
    onSuccess: ({ product }) => {
      invalidate();
      void qc.invalidateQueries({ queryKey: ['admin', 'inventory', product.id] });
    },
  });
}

export function useUpdateProduct() {
  const invalidate = useProductInvalidation();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: ProductPatch }) => updateProduct(id, patch),
    onSuccess: invalidate,
  });
}

export function useBulkUpdateProducts() {
  const invalidate = useProductInvalidation();
  return useMutation({
    mutationFn: ({ ids, patch }: { ids: string[]; patch: ProductBulkPatch }) =>
      bulkUpdateProducts(ids, patch),
    onSuccess: invalidate,
  });
}

/** Archive (true) or restore (false). Products are never deleted from here. */
export function useSetProductsArchived() {
  const invalidate = useProductInvalidation();
  return useMutation({
    mutationFn: ({ ids, isArchived }: { ids: string[]; isArchived: boolean }) =>
      setProductsArchived(ids, isArchived),
    onSettled: invalidate,
  });
}
