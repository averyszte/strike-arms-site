import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { availableStock, counterUnitPriceCents } from '@/lib/counter-order-totals';
import { formatPrice } from '@/lib/format-price';
import { searchProducts } from '@/lib/search-products';
import type { Product } from '@/types/product';

/**
 * Finding the thing on the counter.
 *
 * A select of the whole catalogue is unusable with a customer waiting, so this
 * is the same scored search the shop header uses. Unpublished products are
 * included on purpose: stock that is in the shop but not yet on the website is
 * a real sale, and create_counter_order allows it.
 */

const MAX_RESULTS = 6;

type CounterOrderProductPickerProps = {
  products: Product[];
  isLoading: boolean;
  /** Ids already on the order, so a second add is a quantity change instead. */
  addedIds: Set<string>;
  onAdd: (product: Product) => void;
};

export function CounterOrderProductPicker({
  products,
  isLoading,
  addedIds,
  onAdd,
}: CounterOrderProductPickerProps) {
  const [query, setQuery] = useState('');

  const matches = useMemo(
    () => searchProducts(products, query, MAX_RESULTS),
    [products, query],
  );

  const isSearching = query.trim().length >= 2;

  return (
    <div>
      <Label htmlFor="counter-product-search">Add a product</Label>
      <div className="relative mt-1.5">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="counter-product-search"
          value={query}
          placeholder={isLoading ? 'Loading catalogue…' : 'Search by name or brand'}
          disabled={isLoading}
          className="pl-9"
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {isSearching && matches.length === 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          Nothing matches “{query.trim()}”.
        </p>
      )}

      {matches.length > 0 && (
        <ul className="mt-2 divide-y divide-border rounded-md border border-border">
          {matches.map((product) => {
            const available = availableStock(product);

            return (
              <li key={product.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted/40 disabled:opacity-50"
                  disabled={addedIds.has(product.id)}
                  onClick={() => {
                    onAdd(product);
                    setQuery('');
                  }}
                >
                  <Plus className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-foreground">{product.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {available} available
                      {product.isShippable ? '' : ' · collection only'}
                      {product.isPublished ? '' : ' · not on the website'}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-medium text-foreground">
                    {formatPrice(counterUnitPriceCents(product))}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
