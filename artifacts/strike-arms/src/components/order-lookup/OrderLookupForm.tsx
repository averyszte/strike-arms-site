import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CARD_TITLE, CTA_PRIMARY_SM, PANEL } from '@/lib/storefront-styles';
import type { OrderLookupInput } from '@/types/order-lookup';

type OrderLookupFormProps = {
  isPending: boolean;
  onSubmit: (input: OrderLookupInput) => void;
};

export function OrderLookupForm({ isPending, onSubmit }: OrderLookupFormProps) {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({ orderNumber: orderNumber.trim(), email: email.trim() });
  };

  return (
    <section className={`${PANEL} p-6`}>
      <h2 className={`${CARD_TITLE} text-lg`}>Find your order</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Your order number is in your confirmation email and starts with SA-.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="lookup-order-number">Order number</Label>
          <Input
            id="lookup-order-number"
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            placeholder="SA-2026-0001"
            autoComplete="off"
            maxLength={20}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lookup-email">Email used at checkout</Label>
          <Input
            id="lookup-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            maxLength={254}
            required
          />
        </div>
        <Button type="submit" className={CTA_PRIMARY_SM} disabled={isPending}>
          <Search className="h-4 w-4" aria-hidden="true" />
          {isPending ? 'Looking up' : 'Find order'}
        </Button>
      </form>
    </section>
  );
}
