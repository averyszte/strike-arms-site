import { useId, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  BRAND_COLLAPSE_AT,
  previewFacetOptions,
  toggleFacetValue,
  visibleFacetOptions,
} from '@/lib/facet-options';
import type { BrandFacet } from '@/types/catalog-facets';
import type { ProductFilters } from '@/types/product';

/**
 * Brands as a multi-select: ticking two shows both (OR inside the facet),
 * while brand still narrows against price, condition and the rest (AND
 * across facets). Counts read "what you would get if you ticked this".
 */

interface BrandFilterProps {
  brands: BrandFacet[];
  selected?: string[];
  onFilterChange: (patch: Partial<ProductFilters>) => void;
}

export function BrandFilter({ brands, selected = [], onFilterChange }: BrandFilterProps) {
  const id = useId();
  const [isExpanded, setIsExpanded] = useState(false);
  const options = visibleFacetOptions(brands, selected);
  const { shown, hiddenCount } = previewFacetOptions(options, selected, isExpanded);
  const isCollapsible = options.length > BRAND_COLLAPSE_AT;

  if (options.length === 0) {
    return <p className="text-sm text-muted-foreground">No brands match these filters.</p>;
  }

  return (
    <div className="space-y-1.5">
      {shown.map((brand) => (
        <div key={brand.slug} className="flex items-center gap-2">
          <Checkbox
            id={`${id}-${brand.slug}`}
            checked={selected.includes(brand.slug)}
            onCheckedChange={(checked) =>
              onFilterChange({ brands: toggleFacetValue(selected, brand.slug, checked === true) })
            }
          />
          <Label
            htmlFor={`${id}-${brand.slug}`}
            className="flex-1 cursor-pointer text-sm font-normal"
          >
            {brand.name}
          </Label>
          <span className="text-xs tabular-nums text-muted-foreground">{brand.count}</span>
        </div>
      ))}
      {isCollapsible && (
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="pt-1 text-sm font-bold text-accent hover:underline"
        >
          {isExpanded ? 'Show fewer' : `Show ${hiddenCount} more`}
        </button>
      )}
    </div>
  );
}
