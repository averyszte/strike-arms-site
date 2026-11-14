import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  listEnqueueErrors,
  listFailedEmails,
  resolveEnqueueError,
} from '@/data/failed-emails-repository';
import { resendOrderEmail } from '@/data/order-emails-repository';

const FAILED_KEY = ['admin', 'failed-emails'] as const;
const ENQUEUE_KEY = ['admin', 'enqueue-errors'] as const;

export function useFailedEmails() {
  return useQuery({ queryKey: FAILED_KEY, queryFn: listFailedEmails });
}

export function useEnqueueErrors() {
  return useQuery({ queryKey: ENQUEUE_KEY, queryFn: listEnqueueErrors });
}

/** Total for the dashboard alert. Undefined until both lists have loaded. */
export function useFailedEmailCount(): number | undefined {
  const failed = useFailedEmails();
  const enqueue = useEnqueueErrors();
  if (!failed.data || !enqueue.data) return undefined;
  return failed.data.length + enqueue.data.length;
}

export function useResendFailedEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => resendOrderEmail(jobId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FAILED_KEY });
      qc.invalidateQueries({ queryKey: ['admin', 'order-emails'] });
    },
  });
}

export function useResolveEnqueueError() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resolveEnqueueError(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ENQUEUE_KEY }),
  });
}
