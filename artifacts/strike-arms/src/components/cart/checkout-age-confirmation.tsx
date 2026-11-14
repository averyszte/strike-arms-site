import { Link } from 'wouter';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { TEXT_LINK } from '@/lib/storefront-styles';

type Props = {
  checked: boolean;
  error?: string;
  onChange: (checked: boolean) => void;
};

/** The over-18 tick box, with the terms and returns the order is placed under. */
export function CheckoutAgeConfirmation({ checked, error, onChange }: Props) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <Checkbox
          id="age-confirmed"
          checked={checked}
          aria-describedby={error ? 'age-confirmed-error' : undefined}
          onCheckedChange={(next) => onChange(next === true)}
        />
        <Label htmlFor="age-confirmed" className="cursor-pointer font-normal leading-snug">
          I confirm I am 18 years of age or over.
        </Label>
      </div>
      {error && (
        <p id="age-confirmed-error" className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      )}
      <p className="mt-3 text-sm text-muted-foreground">
        By placing your order you agree to our{' '}
        <Link href="/terms" className={TEXT_LINK}>
          terms of sale
        </Link>
        . Most online orders can be cancelled within 14 days: see{' '}
        <Link href="/returns" className={TEXT_LINK}>
          returns
        </Link>
        .
      </p>
    </div>
  );
}
