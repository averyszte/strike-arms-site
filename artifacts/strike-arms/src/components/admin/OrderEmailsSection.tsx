import { useState } from 'react';
import { format } from 'date-fns';
import { Send } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOrderEmails } from '@/hooks/use-order-emails';
import { useResendOrderEmail } from '@/hooks/use-resend-order-email';
import { useToast } from '@/hooks/use-toast';
import { adminErrorMessage } from '@/lib/admin-error-message';
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
 * address, so correcting a mistyped email and resending is the fix. It asks
 * first, naming the address: the customer gets a second copy (M-042).
 */
export function OrderEmailsSection({ orderId }: { orderId: string }) {
  const { data: emails, isError } = useOrderEmails(orderId);
  const resend = useResendOrderEmail(orderId);
  const { toast } = useToast();
  const [confirming, setConfirming] = useState<OrderEmail | null>(null);

  async function handleResend(email: OrderEmail) {
    try {
      await resend.mutateAsync(email.id);
      toast({ title: 'Email queued', description: 'It goes out within a minute.' });
    } catch (error) {
      toast({ title: 'Not resent', description: adminErrorMessage(error), variant: 'destructive' });
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
                onClick={() => setConfirming(email)}
              >
                <Send className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Resend
              </Button>
            )}
          </li>
        ))}
      </ul>

      <AlertDialog open={confirming !== null} onOpenChange={open => !open && setConfirming(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resend this email?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirming && `${ORDER_EMAIL_LABELS[confirming.eventType]} goes to ${orderEmailRecipient(confirming)} again.`}{' '}
              If the address is wrong, correct it on the order first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirming) void handleResend(confirming);
                setConfirming(null);
              }}
            >
              Resend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
