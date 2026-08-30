import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { ProductsTableRow } from '@/components/admin/ProductsTableRow';
import type { GroupSelectionState } from '@/hooks/use-row-selection';
import type { Category, Product } from '@/types/product';

/**
 * One collapsible category of products.
 *
 * The select-all checkbox is in the table head rather than the accordion
 * trigger: a checkbox inside a button is a control inside a control, which
 * screen readers and the keyboard both handle badly. It also means you cannot
 * tick a category you have not opened and looked at.
 */

type ProductsTableGroupProps = {
  category: Category;
  label: string;
  products: Product[];
  selectionState: GroupSelectionState;
  isSelected: (id: string) => boolean;
  onToggleSelect: (id: string) => void;
  onToggleGroup: (ids: string[]) => void;
  onEdit: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function ProductsTableGroup({
  category,
  label,
  products,
  selectionState,
  isSelected,
  onToggleSelect,
  onToggleGroup,
  onEdit,
  onAdjustStock,
  onDelete,
}: ProductsTableGroupProps) {
  return (
    <AccordionItem value={category} className="overflow-hidden rounded-md border border-border">
      <AccordionTrigger className="px-4 py-3 hover:bg-muted/30 hover:no-underline">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">
            {products.length} product{products.length !== 1 ? 's' : ''}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-0">
        <div className="overflow-x-auto border-t border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="w-10 px-4 py-2.5 text-left">
                  <Checkbox
                    checked={
                      selectionState === 'all'
                        ? true
                        : selectionState === 'some'
                          ? 'indeterminate'
                          : false
                    }
                    onCheckedChange={() => onToggleGroup(products.map((p) => p.id))}
                    aria-label={`Select every product in ${label}`}
                  />
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Brand</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                  Subcategory
                </th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Stock</th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <ProductsTableRow
                  key={product.id}
                  product={product}
                  isSelected={isSelected(product.id)}
                  onToggleSelect={onToggleSelect}
                  onEdit={onEdit}
                  onAdjustStock={onAdjustStock}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
