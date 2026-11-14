import { useState } from 'react';
import { OctagonAlert } from 'lucide-react';

import { AdminLoadError } from '@/components/admin/AdminLoadError';
import { PaymentAlertRow } from '@/components/admin/dashboard/payment-alert-row';
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
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import {
  useHandledPaymentAlerts,
  useOpenPaymentAlerts,
  useSetPaymentAlertResolved,
} from '@/hooks/use-payment-alerts';
import { loadErrorMessage } from '@/lib/load-error-message';

/**
 * Money Stripe took that no order accounts for (migration 029).
 *
 * Not one of the operational alerts, because there is no screen to link to:
 * the order does not exist, so this card is where it gets resolved. A refund
 * in Stripe closes a row by itself; "Mark handled" is for a payment settled
 * some other way, and it confirms first and offers an undo (M-035).
 *
 * A failed read shows the error, not nothing: an empty card would read as
 * "no problems".
 */
export function UnmatchedPaymentsCard() {
  const open = useOpenPaymentAlerts();
  const [isShowingHandled, setIsShowingHandled] = useState(false);
  const handled = useHandledPaymentAlerts(isShowingHandled);
  const setResolved = useSetPaymentAlertResolved();
  const { toast } = useToast();
  const [toHandle, setToHandle] = useState<string | null>(null);

  if (open.isError) {
    return (
      <AdminLoadError
        what="the payments with no order"
        error={open.error}
        isRetrying={open.isFetching}
        onRetry={() => void open.refetch()}
      />
    );
  }

  const alerts = open.data ?? [];
  if (alerts.length === 0 && !isShowingHandled) return null;

  async function change(id: string, isResolved: boolean): Promise<boolean> {
    try {
      await setResolved.mutateAsync({ id, isResolved });
      return true;
    } catch (error) {
      toast({ title: 'Not changed', description: loadErrorMessage(error), variant: 'destructive' });
      return false;
    }
  }

  async function confirmHandle() {
    const id = toHandle;
    setToHandle(null);
    if (!id || !(await change(id, true))) return;
    toast({
      title: 'Marked handled',
      action: (
        <ToastAction altText="Undo" onClick={() => void change(id, false)}>
          Undo
        </ToastAction>
      ),
    });
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-destructive">
          <OctagonAlert className="h-4 w-4" aria-hidden="true" />
          Payments with no order
        </CardTitle>
        <Button type="button" variant="ghost" size="sm" onClick={() => setIsShowingHandled(v => !v)}>
          {isShowingHandled ? 'Hide handled' : 'Show handled'}
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {alerts.map(alert => (
            <PaymentAlertRow
              key={alert.id}
              alert={alert}
              isBusy={setResolved.isPending}
              onHandle={() => setToHandle(alert.id)}
            />
          ))}
          {isShowingHandled &&
            (handled.data ?? []).map(alert => (
              <PaymentAlertRow
                key={alert.id}
                alert={alert}
                isBusy={setResolved.isPending}
                onReopen={() => void change(alert.id, false)}
              />
            ))}
        </ul>
        {isShowingHandled && handled.isError && (
          <p className="text-sm text-destructive">Could not load the handled payments.</p>
        )}
      </CardContent>

      <AlertDialog open={toHandle !== null} onOpenChange={o => !o && setToHandle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark this payment handled?</AlertDialogTitle>
            <AlertDialogDescription>
              Only if it was refunded or settled outside the site. It leaves this card.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmHandle()}>Mark handled</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
