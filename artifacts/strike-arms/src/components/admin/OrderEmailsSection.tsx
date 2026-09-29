import { format } from 'date-fns';
import { Send } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOrderEmails, useResendOrderEmail } from '@/hooks/use-order-emails';
import { useToast } from '@/hooks/use-toast';
import { loadErrorMessage } from '@/lib/load-error-message';
import {
  ORDER_EMAIL_LABELS,
  ORDER_EMAIL_STATUS_LABELS,
  canResendOrderEmail,
  orderEmailRecipient,
} from '@/lib/order-email-display';
import type { OrderEmail } from '@/types/order-email';

/**
 * The emails this order has sent or queued (030), with a resend for one that
 * failed or never arrived. A resend is a fresh email to the order's current
 * address, so correcting a mistyped email and resending is the fix.
 */
export function OrderEmailsSection({ orderId }: { orderId: string }) {
  const { data: emails, isError } = useOrderEmails(orderId);
  const resend = useResendOrderEmail(orderId);
  const { toast } = useToast();

  async function handleResend(email: OrderEmail) {
    try {
      await resend.mutateAsync(email.id);
      toast({ title: 'Email queued', description: 'It goes out within a minute.' });
    } catch (error) {
      toast({ title: 'Not resent', description: loadErrorMessage(error), variant: 'destructive' });
    }
  }

  return (
    <section className="border-t border-border pt-4">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Emails
      </h3>
      {isError && <p className="text-xs text-muted-foreground">Could not load the emails for this order.</p>}
      {emails?.length === 0 && (
        <p className="text-xs text-muted-foreground">No emails for this order.</p>
      )}
      <ul className="space-y-3">
        {emails?.map(email => (
          <li key={email.id} className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">
                {ORDER_EMAIL_LABELS[email.eventType]}
                <Badge
                  variant={email.status === 'failed' ? 'destructive' : 'outline'}
                  className="ml-2 text-[10px]"
                >
                  {ORDER_EMAIL_STATUS_LABELS[email.status]}
                </Badge>
              </p>
              <p className="truncate text-xs text-muted-foreground">
                To {orderEmailRecipient(email)} · {format(new Date(email.sentAt ?? email.createdAt), 'dd MMM, HH:mm')}
              </p>
              {email.status !== 'sent' && email.lastError && (
                <p className="mt-0.5 break-words text-xs text-destructive">{email.lastError}</p>
              )}
            </div>
            {canResendOrderEmail(email) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={resend.isPending}
                onClick={() => void handleResend(email)}
              >
                <Send className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Resend
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
