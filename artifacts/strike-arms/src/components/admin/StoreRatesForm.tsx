import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateStoreRates } from '@/hooks/use-store-rates';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/format-price';
import { StoreRatesConfirmDialog } from '@/components/admin/settings/StoreRatesConfirmDialog';
import {
  describeRateChanges,
  formToRates,
  ratesAreUnchanged,
  ratesToForm,
  storeRatesWarnings,
  validateStoreRates,
  type RateChange,
  type StoreRatesErrors,
} from '@/lib/store-rates-form';
import type { StoreRates } from '@/types/store-settings';

interface Props {
  rates: StoreRates;
}

export function StoreRatesForm({ rates }: Props) {
  const [form, setForm] = useState(() => ratesToForm(rates));
  const [errors, setErrors] = useState<StoreRatesErrors>({});
  const [changes, setChanges] = useState<RateChange[] | null>(null);
  const update = useUpdateStoreRates();
  const { toast } = useToast();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const found = validateStoreRates(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    if (ratesAreUnchanged(form, rates)) {
      toast({ title: 'Nothing to save' });
      return;
    }

    // M-029: a slip goes live for every customer, so show old against new first.
    setChanges(describeRateChanges(rates, formToRates(form)));
  }

  function save() {
    setChanges(null);
    update.mutate(formToRates(form), {
      onSuccess: (saved) => {
        setForm(ratesToForm(saved));
        toast({ title: 'Rates updated' });
      },
      onError: (error: Error) =>
        toast({ title: 'Not saved', description: error.message, variant: 'destructive' }),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-5">
      <div>
        <Label htmlFor="shipping-flat">Delivery charge</Label>
        <Input
          id="shipping-flat"
          className="mt-1.5"
          inputMode="decimal"
          value={form.shippingFlat}
          onChange={(e) => setForm((f) => ({ ...f, shippingFlat: e.target.value }))}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Charged once per order that is being posted. In euro, up to 100.
        </p>
        {errors.shippingFlat && (
          <p className="mt-1 text-xs text-destructive">{errors.shippingFlat}</p>
        )}
      </div>

      <div>
        <Label htmlFor="free-threshold">Free delivery over</Label>
        <Input
          id="free-threshold"
          className="mt-1.5"
          inputMode="decimal"
          value={form.freeShippingThreshold}
          onChange={(e) => setForm((f) => ({ ...f, freeShippingThreshold: e.target.value }))}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Orders at or above this drop the {formatPrice(rates.shippingFlatCents)} charge. Set it to
          0 to make every delivery free.
        </p>
        {errors.freeShippingThreshold && (
          <p className="mt-1 text-xs text-destructive">{errors.freeShippingThreshold}</p>
        )}
      </div>

      <div>
        <Label htmlFor="vat-rate">VAT rate (%)</Label>
        <Input
          id="vat-rate"
          className="mt-1.5"
          inputMode="decimal"
          value={form.vatRate}
          onChange={(e) => setForm((f) => ({ ...f, vatRate: e.target.value }))}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Prices on the site are VAT inclusive, so this is the rate extracted from a total, not
          added to it. Changing it changes what is reported to Revenue -- check with the accountant
          before touching it.
        </p>
        {errors.vatRate && <p className="mt-1 text-xs text-destructive">{errors.vatRate}</p>}
      </div>

      <Button type="submit" disabled={update.isPending}>
        {update.isPending ? 'Saving...' : 'Save rates'}
      </Button>

      <StoreRatesConfirmDialog
        changes={changes}
        warnings={changes ? storeRatesWarnings(formToRates(form)) : []}
        onCancel={() => setChanges(null)}
        onConfirm={save}
      />
    </form>
  );
}
