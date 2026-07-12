import { useState } from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  inStock: boolean;
  onAdd: (quantity: number) => void;
}

export function ProductAddToCart({ inStock, onAdd }: Props) {
  const [qty, setQty] = useState(1);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center border border-border rounded-md">
        <button
          onClick={() => setQty(q => Math.max(1, q - 1))}
          disabled={qty <= 1}
          className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-8 text-center text-sm font-medium select-none">{qty}</span>
        <button
          onClick={() => setQty(q => Math.min(99, q + 1))}
          disabled={qty >= 99}
          className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          aria-label="Increase quantity"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <Button
        onClick={() => onAdd(qty)}
        disabled={!inStock}
        className="flex-1 flex items-center justify-center gap-2"
        size="lg"
      >
        <ShoppingCart className="w-4 h-4" />
        {inStock ? 'Add to Cart' : 'Out of Stock'}
      </Button>
    </div>
  );
}
