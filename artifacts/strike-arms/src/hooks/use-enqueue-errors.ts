import { useQuery } from '@tanstack/react-query';

import { listEnqueueErrors } from '@/data/failed-emails-repository';
import { ENQUEUE_ERRORS_KEY } from '@/hooks/failed-emails-query-keys';

export function useEnqueueErrors() {
  return useQuery({ queryKey: ENQUEUE_ERRORS_KEY, queryFn: listEnqueueErrors });
}
