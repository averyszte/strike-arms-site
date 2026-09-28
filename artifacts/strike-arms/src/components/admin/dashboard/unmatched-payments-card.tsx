import { format } from 'date-fns';
import { ExternalLink, OctagonAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useOpenPaymentAlerts, useResolvePaymentAlert } from '@/hooks/use-payment-alerts';
import { loadErrorMessage } from '@/lib/load-error-message';
import { stripePaymentUrl } from '@/lib/stripe-dashboard-link';
import type { PaymentAlert } from '@/types/payment-alert';

/**
 * Money Stripe took that no order accounts for (migration 029).
 *
 * Not one of the operational alerts, because there is no screen to link to:
 * the order does not exist, so this card is where it gets resolved. It shows
 * only while something is open. A refund in Stripe closes a row by itself;
 * "Mark handled" is for a payment settled some other way.
 *
 * A failed read shows nothing rather than an error: the migration check on
 * the same dashboard already says when 029 has not been pushed.
 */

function fmtAmount(alert: PaymentAlert): string {
  if (alert.amountCents === null) return 'Unknown amount';
  const currency = (alert.currency ?? 'eur').toUpperCase();
  return `${(alert.amountCents / 100).toFixed(2)} ${currency}`;
}

export function UnmatchedPaymentsCard() {
  const { data: alerts } = useOpenPaymentAlerts();
  const resolve = useResolvePaymentAlert();
  const { toast } = useToast();

  if (!alerts || alerts.length === 0) return null;

  async function handleResolve(id: string) {
    try {
      await resolve.mutateAsync(id);
    } catch (error) {
      toast({ title: 'Not marked', description: loadErrorMessage(error), variant: 'destructive' });
    }
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-destructive">
          <OctagonAlert className="h-4 w-4" aria-hidden="true" />
          Payments with no order
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {alerts.map((alert) => (
            <li key={alert.id} className="space-y-1.5 py-3">
              <p className="text-sm font-medium text-foreground">
                {fmtAmount(alert)} · {format(new Date(alert.createdAt), 'dd MMM yyyy, HH:mm')}
                {alert.customerEmail && (
                  <span className="font-normal text-muted-foreground"> · {alert.customerEmail}</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">{alert.detail}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {alert.stripePaymentIntent && (
                  <Button asChild variant="outline" size="sm">
                    <a href={stripePaymentUrl(alert.stripePaymentIntent)} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-1.5 h-4 w-4" aria-hidden="true" />
                      Open in Stripe
                    </a>
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={resolve.isPending}
                  onClick={() => void handleResolve(alert.id)}
                >
                  Mark handled
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
