import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adjustStock, getInventoryHistory } from '@/data/inventory-repository';

export function useInventoryHistory(productId: string | null) {
  return useQuery({
    queryKey: ['admin', 'inventory', productId],
    queryFn: () => getInventoryHistory(productId!),
    enabled: !!productId,
  });
}

type AdjustInput = {
  productId: string;
  adjustment: number;
  reason: string;
  adjustedBy: string | null;
};

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, adjustment, reason, adjustedBy }: AdjustInput) =>
      adjustStock(productId, adjustment, reason, adjustedBy),
    onSuccess: (_result, { productId }) => {
      // The public catalogue reads the same stock_count, so a shelf corrected
      // in the admin has to stop showing as available on the shop at once.
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['admin', 'inventory', productId] });
    },
  });
}
