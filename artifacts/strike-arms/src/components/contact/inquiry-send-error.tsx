import { AlertCircle } from 'lucide-react';

import { BUSINESS } from '@/lib/site-config';

/** Why an enquiry did not send, with the shop phone as the way round it. */
export function InquirySendError({ message }: { message: string }) {
  return (
    <p className="flex items-start gap-2 rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      {message} You can also ring the shop on {BUSINESS.telephone}.
    </p>
  );
}
