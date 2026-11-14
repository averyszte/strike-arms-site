import { useMutation, useQueryClient } from '@tanstack/react-query';

import { resendOrderEmail } from '@/data/order-emails-repository';
import { FAILED_EMAILS_KEY } from '@/hooks/failed-emails-query-keys';

export function useResendFailedEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => resendOrderEmail(jobId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FAILED_EMAILS_KEY });
      qc.invalidateQueries({ queryKey: ['admin', 'order-emails'] });
    },
  });
}
