import { Link } from 'wouter';
import { Minus, Plus, Store, Trash2, Truck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format-price';
import type { CartLine } from '@/types/cart';

type CartLineRowProps = {
  line: CartLine;
  wantsDelivery: boolean;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

export function CartLineRow({
  line,
  wantsDelivery,
  onQuantityChange,
  onRemove,
}: CartLineRowProps) {
  const isDelivered = wantsDelivery && line.isShippable;
  const lineTotal = line.unitPriceCents * line.quantity;

  return (
    <li className="flex gap-4 py-5 border-b border-border">
      <Link href={`/products/${line.slug}`} className="shrink-0">
        <img
          src={line.image ?? '/images/placeholder-product.png'}
          alt={line.name}
          className="h-20 w-20 rounded object-cover bg-muted"
          loading="lazy"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${line.slug}`}
          className="font-medium text-foreground hover:text-accent line-clamp-2"
        >
          {line.name}
        </Link>

        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          {isDelivered ? (
            <>
              <Truck className="h-4 w-4" aria-hidden="true" />
              Delivered
            </>
          ) : (
            <>
              <Store className="h-4 w-4" aria-hidden="true" />
              {line.isShippable ? 'Collect in store' : 'Collect in store only'}
            </>
          )}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label={`Reduce quantity of ${line.name}`}
            onClick={() => onQuantityChange(line.productId, line.quantity - 1)}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
            {line.quantity}
          </span>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label={`Increase quantity of ${line.name}`}
            onClick={() => onQuantityChange(line.productId, line.quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            aria-label={`Remove ${line.name} from your cart`}
            onClick={() => onRemove(line.productId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-semibold text-foreground tabular-nums">{formatPrice(lineTotal)}</p>
        {line.quantity > 1 && (
          <p className="mt-1 text-xs text-muted-foreground tabular-nums">
            {formatPrice(line.unitPriceCents)} each
          </p>
        )}
      </div>
    </li>
  );
}
