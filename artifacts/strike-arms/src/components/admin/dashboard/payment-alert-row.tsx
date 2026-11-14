import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatCentsPlain } from '@/lib/format-price';
import { stripePaymentUrl } from '@/lib/stripe-dashboard-link';
import type { PaymentAlert } from '@/types/payment-alert';

function fmtAmount(alert: PaymentAlert): string {
  if (alert.amountCents === null) return 'Unknown amount';
  const currency = (alert.currency ?? 'eur').toUpperCase();
  return `${formatCentsPlain(alert.amountCents)} ${currency}`;
}

interface Props {
  alert: PaymentAlert;
  isBusy: boolean;
  /** Absent for a handled row, which only offers "Open again". */
  onHandle?: () => void;
  onReopen?: () => void;
}

export function PaymentAlertRow({ alert, isBusy, onHandle, onReopen }: Props) {
  return (
    <li className="space-y-1.5 py-3">
      <p className="text-sm font-medium text-foreground">
        {fmtAmount(alert)} · {format(new Date(alert.createdAt), 'dd MMM yyyy, HH:mm')}
        {alert.customerEmail && (
          <span className="font-normal text-muted-foreground"> · {alert.customerEmail}</span>
        )}
      </p>
      <p className="text-xs text-muted-foreground">{alert.detail}</p>
      {alert.resolvedAt && (
        <p className="text-xs text-muted-foreground">
          Handled {format(new Date(alert.resolvedAt), 'dd MMM yyyy, HH:mm')}
        </p>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        {alert.stripePaymentIntent && (
          <Button asChild variant="outline" size="sm">
            <a href={stripePaymentUrl(alert.stripePaymentIntent)} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Open in Stripe
            </a>
          </Button>
        )}
        {onHandle && (
          <Button type="button" variant="ghost" size="sm" disabled={isBusy} onClick={onHandle}>
            Mark handled
          </Button>
        )}
        {onReopen && (
          <Button type="button" variant="ghost" size="sm" disabled={isBusy} onClick={onReopen}>
            Open again
          </Button>
        )}
      </div>
    </li>
  );
}
