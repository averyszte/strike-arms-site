import { useMutation, useQueryClient } from '@tanstack/react-query';

import { resendOrderEmail } from '@/data/order-emails-repository';
import { ADMIN_KEYS } from '@/lib/query-keys';

export function useResendOrderEmail(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => resendOrderEmail(jobId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.orderEmails(orderId) });
    },
  });
}
