import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useBulkUpdateProducts } from '@/hooks/use-admin-products';
import { useToast } from '@/hooks/use-toast';
import { loadErrorMessage } from '@/lib/load-error-message';

export type SoldProduct = { id: string; name: string };

interface Props {
  products: SoldProduct[];
  onClose: () => void;
}

/**
 * After a counter sale: was that the last one? (M-038). Stock is not counted
 * (D1), so the website keeps selling it until someone unticks "in stock".
 * Nothing is ticked by default: most sales are not the last unit.
 */
export function CounterOrderStockPrompt({ products, onClose }: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const update = useBulkUpdateProducts();
  const { toast } = useToast();

  function toggle(id: string, isChecked: boolean) {
    setSelected(current => {
      const next = new Set(current);
      if (isChecked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function save() {
    const ids = [...selected];
    if (ids.length === 0) return onClose();
    update.mutate(
      { ids, patch: { inStock: false } },
      {
        onSuccess: () => {
          toast({ title: ids.length === 1 ? 'Marked out of stock' : `${ids.length} marked out of stock` });
          onClose();
        },
        onError: error =>
          toast({ title: 'Not changed', description: loadErrorMessage(error), variant: 'destructive' }),
      },
    );
  }

  return (
    <Dialog open onOpenChange={open => !open && !update.isPending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as out of stock?</DialogTitle>
          <DialogDescription>
            Tick anything that has just sold out, so it stops selling on the website.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 py-2">
          {products.map(product => (
            <li key={product.id} className="flex items-center gap-2">
              <Checkbox
                id={`sold-out-${product.id}`}
                checked={selected.has(product.id)}
                onCheckedChange={value => toggle(product.id, value === true)}
              />
              <label htmlFor={`sold-out-${product.id}`} className="text-sm text-foreground">
                {product.name}
              </label>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={update.isPending}>
            All still in stock
          </Button>
          <Button type="button" onClick={save} disabled={selected.size === 0 || update.isPending}>
            {update.isPending ? 'Saving...' : 'Mark out of stock'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
