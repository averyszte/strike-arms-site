import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { listOrderEmails, resendOrderEmail } from '@/data/order-emails-repository';

function orderEmailsKey(orderId: string | null) {
  return ['admin', 'order-emails', orderId] as const;
}

export function useOrderEmails(orderId: string | null) {
  return useQuery({
    queryKey: orderEmailsKey(orderId),
    queryFn: () => listOrderEmails(orderId as string),
    enabled: orderId !== null,
  });
}

export function useResendOrderEmail(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => resendOrderEmail(jobId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderEmailsKey(orderId) });
    },
  });
}
