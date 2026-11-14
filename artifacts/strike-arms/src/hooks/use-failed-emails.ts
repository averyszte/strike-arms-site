import { useQuery } from '@tanstack/react-query';

import { listFailedEmails } from '@/data/failed-emails-repository';
import { FAILED_EMAILS_KEY } from '@/hooks/failed-emails-query-keys';

export function useFailedEmails() {
  return useQuery({ queryKey: FAILED_EMAILS_KEY, queryFn: listFailedEmails });
}
