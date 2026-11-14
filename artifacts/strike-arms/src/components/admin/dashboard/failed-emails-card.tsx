import { useState } from 'react';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { MailWarning, RotateCw } from 'lucide-react';

import { AdminLoadError } from '@/components/admin/AdminLoadError';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useEnqueueErrors,
  useFailedEmails,
  useResendFailedEmail,
  useResolveEnqueueError,
} from '@/hooks/use-failed-emails';
import { useToast } from '@/hooks/use-toast';
import type { FailedEmail } from '@/lib/failed-emails';
import { loadErrorMessage } from '@/lib/load-error-message';
import { ORDER_EMAIL_LABELS } from '@/lib/order-email-display';

const WHEN = 'dd MMM, HH:mm';

function recipientOf(email: FailedEmail): string {
  return email.recipient === 'owner' ? 'the shop' : email.recipient;
}

/**
 * Emails that are not going to arrive (M-010). Shown only while there is
 * one, or when the list could not be read: a failed read must not look like
 * "nothing failed".
 */
export function FailedEmailsCard() {
  const failed = useFailedEmails();
  const enqueue = useEnqueueErrors();
  const resend = useResendFailedEmail();
  const resolve = useResolveEnqueueError();
  const { toast } = useToast();
  const [toResend, setToResend] = useState<FailedEmail | null>(null);

  const query = failed.isError ? failed : enqueue.isError ? enqueue : null;
  if (query) {
    return (
      <AdminLoadError
        what="the failed emails"
        error={query.error}
        isRetrying={query.isFetching}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const jobs = failed.data ?? [];
  const errors = enqueue.data ?? [];
  if (jobs.length === 0 && errors.length === 0) return null;

  function confirmResend() {
    if (!toResend) return;
    resend.mutate(toResend.id, {
      onSuccess: () => toast({ title: 'Queued again', description: 'It goes out within a minute.' }),
      onError: error =>
        toast({ title: 'Not resent', description: loadErrorMessage(error), variant: 'destructive' }),
    });
    setToResend(null);
  }

  function markHandled(id: string) {
    resolve.mutate(id, {
      onError: error =>
        toast({ title: 'Not marked', description: loadErrorMessage(error), variant: 'destructive' }),
    });
  }

  return (
    <Card id="failed-emails" className="border-destructive/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-destructive">
          <MailWarning className="h-4 w-4" aria-hidden="true" />
          Emails not sent
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {jobs.map(job => (
            <li key={job.id} className="flex flex-wrap items-start gap-2 py-3">
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  {ORDER_EMAIL_LABELS[job.eventType]} to {recipientOf(job)}
                  {job.orderNumber && (
                    <Link
                      href={`/admin/orders?q=${encodeURIComponent(job.orderNumber)}`}
                      className="ml-1 font-normal text-accent hover:underline"
                    >
                      {job.orderNumber}
                    </Link>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(job.createdAt), WHEN)} · {job.lastError ?? 'No reason was given.'}
                </p>
              </div>
              {job.canResend && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={resend.isPending}
                  onClick={() => setToResend(job)}
                >
                  <RotateCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Send again
                </Button>
              )}
            </li>
          ))}
          {errors.map(error => (
            <li key={error.id} className="flex flex-wrap items-start gap-2 py-3">
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  An email could not be queued ({error.source})
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(error.createdAt), WHEN)} · {error.detail}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={resolve.isPending}
                onClick={() => markHandled(error.id)}
              >
                Mark handled
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>

      <AlertDialog open={toResend !== null} onOpenChange={open => !open && setToResend(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send this email again?</AlertDialogTitle>
            <AlertDialogDescription>
              A fresh copy goes to the address on the order now. If the address was wrong, fix it on
              the order first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResend}>Send again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
