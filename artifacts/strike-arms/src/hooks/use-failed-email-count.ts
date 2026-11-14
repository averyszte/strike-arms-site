import { useEnqueueErrors } from '@/hooks/use-enqueue-errors';
import { useFailedEmails } from '@/hooks/use-failed-emails';

/** Total for the dashboard alert. Undefined until both lists have loaded. */
export function useFailedEmailCount(): number | undefined {
  const failed = useFailedEmails();
  const enqueue = useEnqueueErrors();
  if (!failed.data || !enqueue.data) return undefined;
  return failed.data.length + enqueue.data.length;
}
