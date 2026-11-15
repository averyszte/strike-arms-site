import { Info } from 'lucide-react';

/** Shown on the cart after the shopper backs out of Stripe's payment page (N-054). */
export function PaymentCancelledNotice() {
  return (
    <p
      role="status"
      className="mb-6 flex items-start gap-2 rounded border border-border bg-muted/40 p-4 text-sm text-foreground"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      Payment not completed. Your basket and details are saved, so you can try again when you are ready.
    </p>
  );
}
