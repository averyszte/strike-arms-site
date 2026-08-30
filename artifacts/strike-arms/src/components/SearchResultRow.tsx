import { Search } from 'lucide-react';

import { formatPrice } from '@/lib/format-price';
import { getCategory } from '@/lib/taxonomy';
import type { Product } from '@/types/product';

interface Props {
  product: Product;
  isActive: boolean;
  onSelect: () => void;
  onHover: () => void;
}

/**
 * One product in the header search dropdown.
 *
 * Split out of SearchDropdown so that component stays about the behaviour of
 * the search box -- focus, keyboard, which of four states the panel is in --
 * rather than also being the markup for a row.
 *
 * onMouseDown rather than onClick, deliberately: the input's onBlur closes the
 * panel, and blur fires before click, so a click handler here would never run.
 */
export function SearchResultRow({ product, isActive, onSelect, onHover }: Props) {
  return (
    <li role="option" aria-selected={isActive}>
      <button
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-border/40 last:border-b-0 ${
          isActive ? 'bg-accent/10' : 'hover:bg-muted/50'
        }`}
        onMouseDown={onSelect}
        onMouseEnter={onHover}
      >
        <div className="w-9 h-9 bg-muted rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
          {product.images[0] ? (
            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
          <p className="text-xs text-muted-foreground">
            {getCategory(product.category)?.shortLabel ?? product.category}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {product.salePrice ? (
            <>
              <p className="text-sm font-semibold text-accent">{formatPrice(product.salePrice)}</p>
              <p className="text-[11px] line-through text-muted-foreground">
                {formatPrice(product.price)}
              </p>
            </>
          ) : (
            <p className="text-sm font-semibold">{formatPrice(product.price)}</p>
          )}
        </div>
      </button>
    </li>
  );
}
