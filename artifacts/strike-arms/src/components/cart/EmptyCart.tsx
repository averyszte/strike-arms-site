import { Link } from 'wouter';
import { ArrowRight, ShoppingBag } from 'lucide-react';

import {
  CARD_TITLE,
  CTA_ARROW,
  CTA_PRIMARY_SM,
  CTA_SECONDARY_SM,
  PANEL,
} from '@/lib/storefront-styles';

export function EmptyCart() {
  return (
    <div className={`${PANEL} px-6 py-16 text-center`}>
      <ShoppingBag className="mx-auto h-10 w-10 text-accent" aria-hidden="true" />
      <h2 className={`${CARD_TITLE} mt-4 text-lg`}>Your cart is empty</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Browse the range and add something to get started. Not sure where to begin? Our guides
        cover the basics.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/store" className={CTA_PRIMARY_SM}>
          Shop the range
          <ArrowRight className={CTA_ARROW} aria-hidden="true" />
        </Link>
        <Link href="/guides" className={CTA_SECONDARY_SM}>
          Read the guides
        </Link>
      </div>
    </div>
  );
}
