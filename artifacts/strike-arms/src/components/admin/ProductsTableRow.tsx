import { Archive, ArchiveRestore, Boxes, Edit2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatBrand } from '@/lib/format-brand';
import { formatPrice } from '@/lib/format-price';
import { formatSubcategoryName } from '@/lib/format-subcategory';
import { stockLevel, type StockLevel } from '@/lib/stock-levels';
import type { Product } from '@/types/product';

interface Props {
  product: Product;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  /** Archives a live product, or restores an archived one. */
  onArchiveToggle: (product: Product) => void;
}

const STOCK_COLOURS: Record<StockLevel, string> = {
  out: 'text-destructive',
  low: 'text-yellow-600 dark:text-yellow-500',
  ok: 'text-green-600',
};

function StatusBadge({ product }: { product: Product }) {
  if (product.isArchived) {
    return (
      <Badge variant="secondary" className="text-[10px]">
        Archived
      </Badge>
    );
  }
  if (product.isPublished) {
    return <Badge className="bg-green-600 text-[10px] text-white hover:bg-green-600">Live</Badge>;
  }
  return (
    <Badge variant="outline" className="text-[10px]">
      Draft
    </Badge>
  );
}

export function ProductsTableRow({
  product,
  isSelected,
  onToggleSelect,
  onEdit,
  onAdjustStock,
  onArchiveToggle,
}: Props) {
  return (
    <tr
      className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
      data-state={isSelected ? 'selected' : undefined}
    >
      <td className="w-10 px-4 py-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(product.id)}
          aria-label={`Select ${product.name}`}
        />
      </td>
      <td className="px-4 py-3">
        <p className="line-clamp-1 font-medium text-foreground">{product.name}</p>
        <p className="font-mono text-xs text-muted-foreground">{product.slug}</p>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{formatBrand(product.brand)}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {formatSubcategoryName(product.subcategory)}
      </td>
      <td className="px-4 py-3 text-right">
        {product.salePrice != null ? (
          <div>
            <span className="font-semibold text-accent">{formatPrice(product.salePrice)}</span>
            <span className="ml-1 text-xs text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          </div>
        ) : (
          <span>{formatPrice(product.price)}</span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        <span className={STOCK_COLOURS[stockLevel(product)]}>{product.stockCount ?? 0}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <StatusBadge product={product} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            title="Adjust stock"
            onClick={() => onAdjustStock(product)}
          >
            <Boxes className="h-3.5 w-3.5" />
            <span className="sr-only">Adjust stock</span>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            title="Edit"
            onClick={() => onEdit(product)}
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            title={product.isArchived ? 'Restore as draft' : 'Archive'}
            onClick={() => onArchiveToggle(product)}
          >
            {product.isArchived ? (
              <ArchiveRestore className="h-3.5 w-3.5" />
            ) : (
              <Archive className="h-3.5 w-3.5" />
            )}
            <span className="sr-only">{product.isArchived ? 'Restore as draft' : 'Archive'}</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}
