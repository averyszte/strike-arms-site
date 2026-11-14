import { useMutation } from '@tanstack/react-query';

import { setProductsArchived } from '@/data/admin-products-repository';
import { useInvalidateProducts } from '@/hooks/use-invalidate-products';

/** Archive (true) or restore (false). Products are never deleted from here. */
export function useSetProductsArchived() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ ids, isArchived }: { ids: string[]; isArchived: boolean }) =>
      setProductsArchived(ids, isArchived),
    onSettled: invalidate,
  });
}
