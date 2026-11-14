import { useMutation, useQueryClient } from '@tanstack/react-query';

import { resolveEnqueueError } from '@/data/failed-emails-repository';
import { ENQUEUE_ERRORS_KEY } from '@/hooks/failed-emails-query-keys';

export function useResolveEnqueueError() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resolveEnqueueError(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ENQUEUE_ERRORS_KEY }),
  });
}
