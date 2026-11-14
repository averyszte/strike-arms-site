import { useMutation, useQueryClient } from '@tanstack/react-query';

import { requestRefund, type RefundRequest, type RefundResult } from '@/data/refunds-repository';

export type { RefundResult };

/**
 * Invalidates the order afterwards. When the function could not record the
 * refund itself (isRecorded false) the refreshed row still says "paid" until
 * the webhook arrives, so the sheet shows a pending marker rather than
 * letting an unchanged badge read as a failed refund.
 */
export function useRefundOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (request: RefundRequest) => requestRefund(request),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'order'] });
    },
  });
}
