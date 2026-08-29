import { Link } from 'wouter';
import { ShoppingBag } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function EmptyCart() {
  return (
    <div className="rounded-lg border border-border bg-card px-6 py-16 text-center">
      <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-foreground">Your cart is empty</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Browse the range and add something to get started. Not sure where to begin? Our guides
        cover the basics.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/store">Shop the range</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/guides">Read the guides</Link>
        </Button>
      </div>
    </div>
  );
}
