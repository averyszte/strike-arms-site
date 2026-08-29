import { AlertCircle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { formatPrice } from '@/lib/format-price';
import type { ResolvedCounterLine } from '@/lib/counter-order-totals';
import type { ItemFulfillmentMethod } from '@/types/order';

/**
 * The lines on the sale.
 *
 * Each one carries its own collect-or-post choice, because a customer can walk
 * out with a rifle and have the BBs posted in the same transaction. The toggle
 * is disabled on anything the catalogue says may not be shipped rather than
 * hidden — an admin looking for it should see why it is not available.
 */

type CounterOrderLinesProps = {
  lines: ResolvedCounterLine[];
  onQuantityChange: (productId: string, quantity: number) => void;
  onMethodChange: (productId: string, method: ItemFulfillmentMethod) => void;
  onRemove: (productId: string) => void;
};

export function CounterOrderLines({
  lines,
  onQuantityChange,
  onMethodChange,
  onRemove,
}: CounterOrderLinesProps) {
  if (lines.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
        No products yet. Search above to add the first one.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-md border border-border">
      {lines.map((line) => (
        <li key={line.productId} className="p-3">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {line.product.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatPrice(line.unitPriceCents)} each
              </p>
            </div>

            <Input
              type="number"
              min={1}
              value={line.quantity}
              aria-label={`Quantity of ${line.product.name}`}
              className="h-8 w-16 shrink-0 text-center"
              onChange={(event) => {
                // An emptied box parses as NaN, which would render as a blank
                // quantity and submit one. One is the floor the database uses.
                const parsed = Number.parseInt(event.target.value, 10);
                onQuantityChange(line.productId, Number.isNaN(parsed) ? 1 : parsed);
              }}
            />

            <p className="w-20 shrink-0 text-right text-sm font-semibold text-foreground">
              {formatPrice(line.subtotalCents)}
            </p>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label={`Remove ${line.product.name}`}
              onClick={() => onRemove(line.productId)}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <ToggleGroup
              type="single"
              size="sm"
              value={line.fulfillmentMethod}
              aria-label={`How ${line.product.name} is handed over`}
              onValueChange={(value) => {
                // Radix clears the value when the active item is clicked again.
                // A line always has a method, so an empty value is ignored.
                if (value) onMethodChange(line.productId, value as ItemFulfillmentMethod);
              }}
            >
              <ToggleGroupItem value="pickup" className="h-7 px-3 text-xs">
                Collect
              </ToggleGroupItem>
              <ToggleGroupItem
                value="delivery"
                disabled={!line.product.isShippable}
                className="h-7 px-3 text-xs"
              >
                Post
              </ToggleGroupItem>
            </ToggleGroup>

            {line.problem && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {line.problem}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
