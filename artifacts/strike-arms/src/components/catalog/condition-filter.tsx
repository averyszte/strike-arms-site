import { useId } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CONDITION_LABELS, PRODUCT_CONDITIONS } from '@/lib/product-condition';
import type { ProductCondition, ProductFilters } from '@/types/product';

/**
 * New or pre-loved. Picking one clears the other: with two options, ticking
 * both is the same as ticking neither. A condition with nothing under the
 * other filters is left out unless it is the one switched on.
 */

interface ConditionFilterProps {
  selected?: ProductCondition;
  counts?: Record<ProductCondition, number>;
  onFilterChange: (patch: Partial<ProductFilters>) => void;
}

export function ConditionFilter({ selected, counts, onFilterChange }: ConditionFilterProps) {
  const id = useId();
  const options = PRODUCT_CONDITIONS.filter(
    (condition) => !counts || counts[condition] > 0 || condition === selected,
  );

  return (
    <div className="space-y-1.5">
      {options.map((condition) => (
        <div key={condition} className="flex items-center gap-2">
          <Checkbox
            id={`${id}-${condition}`}
            checked={selected === condition}
            onCheckedChange={(checked) =>
              onFilterChange({ condition: checked === true ? condition : undefined })
            }
          />
          <Label
            htmlFor={`${id}-${condition}`}
            className="flex-1 cursor-pointer text-sm font-normal"
          >
            {CONDITION_LABELS[condition]}
          </Label>
          {counts && (
            <span className="text-xs tabular-nums text-muted-foreground">{counts[condition]}</span>
          )}
        </div>
      ))}
    </div>
  );
}
