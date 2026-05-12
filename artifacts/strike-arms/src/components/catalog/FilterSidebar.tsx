import { Link } from 'wouter';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useBrands } from '@/hooks/useProducts';
import { hasActiveFilters } from '@/lib/category-filters';
import { TAXONOMY } from '@/lib/taxonomy';
import type { CategorySlug } from '@/lib/taxonomy';
import type { Category, ProductFilters } from '@/types/product';

const MAX_PRICE_CENTS = 80000;

// ── CategoryTree ──────────────────────────────────────────────────────────────

interface CategoryTreeProps {
  activeCategorySlug?: CategorySlug;
  activeSubcategorySlug?: string;
  onNavigate?: () => void;
}

function CategoryTree({
  activeCategorySlug,
  activeSubcategorySlug,
  onNavigate,
}: CategoryTreeProps) {
  return (
    <div className="space-y-0.5">
      <Link
        href="/store"
        onClick={onNavigate}
        className={cn(
          'block px-2 py-1.5 text-sm rounded-sm transition-colors',
          !activeCategorySlug
            ? 'text-foreground font-semibold'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        All Products
      </Link>

      {TAXONOMY.map((cat) => {
        const isActiveCat = activeCategorySlug === cat.slug;
        return (
          <div key={cat.slug}>
            <Link
              href={`/store/${cat.slug}`}
              onClick={onNavigate}
              className={cn(
                'block px-2 py-1.5 text-sm rounded-sm transition-colors',
                isActiveCat
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {cat.shortLabel}
            </Link>

            {isActiveCat && (
              <div className="ml-4 mt-0.5 mb-1 space-y-0.5">
                {cat.subcategories.map((sub) => {
                  const isActiveSub = activeSubcategorySlug === sub.slug;
                  return (
                    <Link
                      key={sub.slug}
                      href={`/store/${cat.slug}/${sub.slug}`}
                      onClick={onNavigate}
                      className={cn(
                        'block px-2 py-1 text-sm rounded-sm transition-colors',
                        isActiveSub
                          ? 'text-accent font-medium'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
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
            })
          }
        >
          Clear all filters
        </Button>
      )}

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
