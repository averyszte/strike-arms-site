import { useMutation, useQueryClient } from '@tanstack/react-query';

import { requestRefund, type RefundRequest } from '@/data/refunds-repository';

/**
 * Invalidates the order afterwards, but the refreshed row will usually still
 * say "paid": Stripe's charge.refunded webhook is what moves it, and that
 * arrives a moment later. The dialog says so rather than letting the admin
 * read an unchanged badge as a failed refund and press the button again.
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
