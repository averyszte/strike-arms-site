import { Search } from 'lucide-react';

import { CardImage } from '@/components/catalog/card-image';
import { effectivePriceCents, hasDiscount } from '@/lib/effective-price';
import { formatPrice } from '@/lib/format-price';
import { getCategory } from '@/lib/taxonomy';
import type { Product } from '@/types/product';

interface Props {
  id: string;
  product: Product;
  isActive: boolean;
  onSelect: () => void;
  onHover: () => void;
  onPointerDown: (e: React.MouseEvent) => void;
}

/**
 * One product in the header search dropdown.
 *
 * Split out of SearchDropdown so that component stays about the behaviour of
 * the search box -- focus, keyboard, which of four states the panel is in --
 * rather than also being the markup for a row.
 *
 * The row is the listbox option itself, not a button inside one: the input
 * keeps focus and points at the highlighted row with aria-activedescendant
 * (the ARIA combobox pattern), and Enter in the input picks it. A mouse click
 * is a plain onClick; the mousedown is cancelled so the input keeps focus and
 * its blur does not close the panel first.
 */
export function SearchResultRow({ id, product, isActive, onSelect, onHover, onPointerDown }: Props) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={isActive}
      onMouseDown={onPointerDown}
      onClick={onSelect}
      onMouseEnter={onHover}
      className={`cursor-pointer border-b border-border/40 last:border-b-0 ${isActive ? 'bg-accent/10' : 'hover:bg-muted/50'}`}
    >
      <div className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors">
        <div className="w-9 h-9 bg-white rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
          {product.images[0] ? (
            <CardImage src={product.images[0]} alt="" sizes="36px" className="w-full h-full object-contain p-0.5" />
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
          {hasDiscount(product.price, product.salePrice) ? (
            <>
              <p className="text-sm font-semibold text-accent">
                {formatPrice(effectivePriceCents(product.price, product.salePrice))}
              </p>
              <p className="text-[11px] line-through text-muted-foreground">
                {formatPrice(product.price)}
              </p>
            </>
          ) : (
            <p className="text-sm font-semibold">{formatPrice(product.price)}</p>
          )}
        </div>
      </div>
    </li>
  );
}
