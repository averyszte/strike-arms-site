import { useState, type FormEvent } from 'react';
import { ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSetTrackingNumber } from '@/hooks/use-orders';
import { useToast } from '@/hooks/use-toast';
import { loadErrorMessage } from '@/lib/load-error-message';
import { anPostTrackingUrl, readTrackingNumber } from '@/lib/tracking-number';
import type { Order } from '@/types/order';

/**
 * The An Post number for the posted part of an order. Optional: the customer
 * sees it as a tracking link on /account and in the "on its way" email, so
 * add it before marking the order Posted if you want it in that email.
 */
export function OrderTrackingNumberField({ order }: { order: Order }) {
  const [draft, setDraft] = useState(order.trackingNumber ?? '');
  const [error, setError] = useState<string | null>(null);
  const setTracking = useSetTrackingNumber();
  const { toast } = useToast();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const input = readTrackingNumber(draft);
    if ('error' in input) {
      setError(input.error);
      return;
    }
    setError(null);
    try {
      await setTracking.mutateAsync({ orderId: order.id, trackingNumber: input.value });
      toast({ title: input.value ? 'Tracking number saved' : 'Tracking number removed' });
    } catch (caught) {
      toast({
        title: 'Tracking number not saved',
        description: loadErrorMessage(caught),
        variant: 'destructive',
      });
    }
  }

  return (
    <section>
      <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        An Post tracking
      </h3>
      <form onSubmit={(event) => void handleSubmit(event)} className="flex gap-2">
        <Input
          aria-label="An Post tracking number"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="e.g. CE123456789IE"
          maxLength={40}
          className="h-8 text-sm"
          aria-invalid={error !== null}
        />
        <Button type="submit" size="sm" variant="outline" disabled={setTracking.isPending}>
          Save
        </Button>
      </form>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      <p className="mt-1 text-xs text-muted-foreground">
        Optional. Add it before marking the order Posted and the customer's email includes the link.
      </p>
      {order.trackingNumber && (
        <a
          href={anPostTrackingUrl(order.trackingNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-xs text-foreground underline"
        >
          Check it on An Post
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      )}
    </section>
  );
}
