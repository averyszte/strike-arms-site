import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { CategoryTree } from '@/components/catalog/CategoryTree';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useBrands } from '@/hooks/useProducts';
import { hasActiveFilters } from '@/lib/category-filters';
import { CONDITION_LABELS, PRODUCT_CONDITIONS } from '@/lib/product-condition';
import type { CategorySlug } from '@/lib/taxonomy';
import type { Category, ProductCondition, ProductFilters } from '@/types/product';

const MAX_PRICE_CENTS = 80000;

// ── ConditionOption ───────────────────────────────────────────────────────────

interface ConditionOptionProps {
  condition: ProductCondition;
  active: boolean;
  onChange: (patch: Partial<ProductFilters>) => void;
}

/**
 * One of two, and picking one clears the other — the same single-select
 * checkbox the brand list uses, so the whole sidebar behaves one way.
 */
function ConditionOption({ condition, active, onChange }: ConditionOptionProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={`condition-${condition}`}
        checked={active}
        onCheckedChange={(checked) =>
          onChange({ condition: checked ? condition : undefined, page: 1 })
        }
      />
      <Label
        htmlFor={`condition-${condition}`}
        className="text-sm cursor-pointer font-normal flex-1"
      >
        {CONDITION_LABELS[condition]}
      </Label>
    </div>
  );
}

// ── FilterSidebarContent ──────────────────────────────────────────────────────

interface FilterSidebarContentProps {
  activeCategorySlug?: CategorySlug;
  activeSubcategorySlug?: string;
  filters: ProductFilters;
  onFilterChange: (patch: Partial<ProductFilters>) => void;
  onNavigate?: () => void;
}

export function FilterSidebarContent({
  activeCategorySlug,
  activeSubcategorySlug,
  filters,
  onFilterChange,
  onNavigate,
}: FilterSidebarContentProps) {
  const { data: brands = [] } = useBrands(activeCategorySlug as Category | undefined);
  const isActive = hasActiveFilters(filters);

  const priceRange: [number, number] = [
    filters.minPrice ?? 0,
    filters.maxPrice ?? MAX_PRICE_CENTS,
  ];

  return (
    <div className="space-y-6">
      {/* Category navigation tree */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">
          Browse
        </p>
        <CategoryTree
          activeCategorySlug={activeCategorySlug}
          activeSubcategorySlug={activeSubcategorySlug}
          onNavigate={onNavigate}
        />
      </div>

      <Separator />

      {/* Clear filters button — only affects brand/price/stock/sale */}
      {isActive && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-foreground"
          onClick={() =>
            onFilterChange({
              brand: undefined,
              minPrice: undefined,
              maxPrice: undefined,
              inStockOnly: false,
              onSaleOnly: false,
              condition: undefined,
            })
          }
        >
          Clear all filters
        </Button>
      )}

      {/* Condition — new stock or a secondhand one-off */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">
          Condition
        </p>
        <div className="space-y-1.5">
          {PRODUCT_CONDITIONS.map((condition) => (
            <ConditionOption
              key={condition}
              condition={condition}
              active={filters.condition === condition}
              onChange={onFilterChange}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Brand */}
      {brands.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">
            Brand
          </p>
          <div className="space-y-1.5">
            {brands.map((b) => (
              <div key={b.slug} className="flex items-center gap-2">
                <Checkbox
                  id={`brand-${b.slug}`}
                  checked={filters.brand === b.slug}
                  onCheckedChange={(checked) =>
                    onFilterChange({ brand: checked ? b.slug : undefined, page: 1 })
                  }
                />
                <Label
                  htmlFor={`brand-${b.slug}`}
                  className="text-sm cursor-pointer font-normal flex-1"
                >
                  {b.name}
                </Label>
                <span className="text-xs text-muted-foreground">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Price range */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">
          Price
        </p>
        <Slider
          min={0}
          max={MAX_PRICE_CENTS}
          step={500}
          value={priceRange}
          onValueChange={([min, max]) =>
            onFilterChange({
              minPrice: min > 0 ? min : undefined,
              maxPrice: max < MAX_PRICE_CENTS ? max : undefined,
              page: 1,
            })
          }
          className="mb-3"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>€{(priceRange[0] / 100).toFixed(0)}</span>
          <span>€{(priceRange[1] / 100).toFixed(0)}</span>
        </div>
      </div>

      <Separator />

      {/* Toggles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="inStockOnly" className="text-sm cursor-pointer">
            In stock only
          </Label>
          <Switch
            id="inStockOnly"
            checked={!!filters.inStockOnly}
            onCheckedChange={(v) => onFilterChange({ inStockOnly: v, page: 1 })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="onSaleOnly" className="text-sm cursor-pointer">
            On sale only
          </Label>
          <Switch
            id="onSaleOnly"
            checked={!!filters.onSaleOnly}
            onCheckedChange={(v) => onFilterChange({ onSaleOnly: v, page: 1 })}
          />
        </div>
      </div>
    </div>
  );
}
