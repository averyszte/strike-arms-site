import { Accordion } from '@/components/ui/accordion';
import { ProductsTableGroup } from '@/components/admin/ProductsTableGroup';
import type { GroupSelectionState } from '@/hooks/use-row-selection';
import type { ProductGroup } from '@/lib/group-products';
import type { Product } from '@/types/product';

/**
 * One page of products, split into category accordions.
 *
 * Every group starts open: a page is 25 rows, and a closed accordion on a
 * search result hides the thing that was searched for. The key remounts the
 * accordion when the rows change, so a new page opens fully too.
 */

type ProductsGroupsProps = {
  groups: ProductGroup[];
  emptyMessage: string;
  groupState: (ids: string[]) => GroupSelectionState;
  isSelected: (id: string) => boolean;
  onToggleSelect: (id: string) => void;
  onToggleGroup: (ids: string[]) => void;
  onEdit: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  onArchiveToggle: (product: Product) => void;
};

export function ProductsGroups({ groups, emptyMessage, groupState, ...rest }: ProductsGroupsProps) {
  if (groups.length === 0) {
    return (
      <div className="rounded-md border border-border px-4 py-12 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const categories = groups.map((group) => group.category);
  const rowKey = groups.flatMap((group) => group.products.map((p) => p.id)).join(',');

  return (
    <Accordion key={rowKey} type="multiple" defaultValue={categories} className="space-y-2">
      {groups.map((group) => (
        <ProductsTableGroup
          key={group.category}
          category={group.category}
          label={group.label}
          products={group.products}
          selectionState={groupState(group.products.map((p) => p.id))}
          isSelected={rest.isSelected}
          onToggleSelect={rest.onToggleSelect}
          onToggleGroup={rest.onToggleGroup}
          onEdit={rest.onEdit}
          onAdjustStock={rest.onAdjustStock}
          onArchiveToggle={rest.onArchiveToggle}
        />
      ))}
    </Accordion>
  );
}
