import { useState } from 'react';

import { FormError } from '@/components/account/FormError';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { loadErrorMessage } from '@/lib/load-error-message';
import { CARD_TITLE, PANEL } from '@/lib/storefront-styles';

type MarketingCardProps = {
  isOptedIn: boolean;
  onChange: (isOptedIn: boolean) => Promise<void>;
};

/**
 * Marketing email, off unless the customer turns it on. Order emails are
 * not marketing and always go.
 */
export function MarketingCard({ isOptedIn, onChange }: MarketingCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(next: boolean) {
    setIsSaving(true);
    setError(null);
    try {
      await onChange(next);
    } catch (caught: unknown) {
      setError(`Not saved. ${loadErrorMessage(caught)}`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className={`${PANEL} p-6`}>
      <h2 className={`${CARD_TITLE} text-lg`}>Emails from us</h2>
      <div className="mt-4 flex items-start justify-between gap-4">
        <Label htmlFor="marketing-opt-in" className="text-sm font-normal leading-relaxed">
          New stock, events and offers, now and then. Emails about your orders always come, whatever this says.
        </Label>
        <Switch
          id="marketing-opt-in"
          checked={isOptedIn}
          disabled={isSaving}
          onCheckedChange={(next) => void toggle(next)}
        />
      </div>
      <div className="mt-3">
        <FormError message={error} />
      </div>
    </section>
  );
}
