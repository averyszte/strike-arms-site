import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAdjustStock, useInventoryHistory } from '@/hooks/use-inventory';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/lib/admin-auth-context';
import {
  EMPTY_STOCK_ADJUSTMENT,
  STOCK_REASONS,
  toSignedAdjustment,
  validateStockAdjustment,
  type StockAdjustmentErrors,
  type StockDirection,
} from '@/lib/stock-adjustment';
import type { Product } from '@/types/product';

interface Props {
  product: Product | null;
  onClose: () => void;
}

export function StockAdjustDialog({ product, onClose }: Props) {
  const [form, setForm] = useState(EMPTY_STOCK_ADJUSTMENT);
  const [errors, setErrors] = useState<StockAdjustmentErrors>({});
  const adjust = useAdjustStock();
  const { data: history = [] } = useInventoryHistory(product?.id ?? null);
  const { user } = useAdminAuth();
  const { toast } = useToast();

  const stockCount = product?.stockCount ?? 0;
  const reservedCount = product?.reservedCount ?? 0;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!product) return;

    const found = validateStockAdjustment(form, stockCount, reservedCount);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    adjust.mutate(
      {
        productId: product.id,
        adjustment: toSignedAdjustment(form),
        reason: form.reason.trim(),
        adjustedBy: user?.id ?? null,
      },
      {
        onSuccess: () => {
          toast({ title: 'Stock updated' });
          onClose();
        },
        onError: () =>
          toast({
            title: 'Error',
            description: 'Stock was not changed',
            variant: 'destructive',
          }),
      },
    );
  }

  return (
    <Dialog open={!!product} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>
            {product?.name} — {stockCount} on the shelf
            {reservedCount > 0 && `, ${reservedCount} reserved for open checkouts`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <ToggleGroup
              type="single"
              value={form.direction}
              onValueChange={(value) => {
                if (value) setForm((f) => ({ ...f, direction: value as StockDirection }));
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="in" className="px-4">In</ToggleGroupItem>
              <ToggleGroupItem value="out" className="px-4">Out</ToggleGroupItem>
            </ToggleGroup>
            <div className="flex-1">
              <Label htmlFor="stock-quantity" className="sr-only">Units</Label>
              <Input
                id="stock-quantity"
                inputMode="numeric"
                placeholder="Units"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              />
            </div>
          </div>
          {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}

          <div>
            <Label htmlFor="stock-reason">Reason</Label>
            <Input
              id="stock-reason"
              className="mt-1.5"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            />
            {errors.reason && <p className="mt-1 text-xs text-destructive">{errors.reason}</p>}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {STOCK_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, reason }))}
                  className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div className="border-t border-border pt-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Recent adjustments
              </p>
              <ul className="max-h-32 space-y-1 overflow-y-auto text-xs">
                {history.slice(0, 8).map((entry) => (
                  <li key={entry.id} className="flex justify-between gap-3">
                    <span className="truncate text-muted-foreground">{entry.reason}</span>
                    <span className="shrink-0 tabular-nums">
                      {entry.adjustment > 0 ? `+${entry.adjustment}` : entry.adjustment}
                      <span className="ml-2 text-muted-foreground">
                        {format(new Date(entry.createdAt), 'dd MMM')}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={adjust.isPending}>
              {adjust.isPending ? 'Saving...' : 'Apply'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
