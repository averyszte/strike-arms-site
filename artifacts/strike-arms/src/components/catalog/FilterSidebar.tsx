import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CategoryTree } from '@/components/catalog/CategoryTree';
import { BrandFilter } from '@/components/catalog/brand-filter';
import { ConditionFilter } from '@/components/catalog/condition-filter';
import { PriceRangeFilter } from '@/components/catalog/price-range-filter';
import { useCatalogFacets } from '@/hooks/use-catalog-facets';
import { CLEAR_ALL_FILTERS } from '@/lib/active-filter-chips';
import { hasActiveFilters } from '@/lib/category-filters';
import type { CategorySlug } from '@/lib/taxonomy';
import type { ProductFilters } from '@/types/product';

/**
 * New or pre-loved first, then shelves, the quick yes/no switches, price
 * and brand. Every count is live against the other filters (see
 * use-catalog-facets), so an option that would empty the grid says 0 or
 * is not offered at all.
 */

/** Shown until the catalogue's real ceiling is known. */
const FALLBACK_CEILING_CENTS = 100_000;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-accent">{title}</p>
      {children}
    </div>
  );
}

interface ToggleRowProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ id, label, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={id} className="cursor-pointer text-sm">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

interface FilterSidebarContentProps {
  activeCategorySlug?: CategorySlug;
  activeSubcategorySlug?: string;
  filters: ProductFilters;
  onFilterChange: (patch: Partial<ProductFilters>) => void;
  onNavigate?: () => void;
  /** Set where desktop and mobile both render, so switch ids stay unique. */
  idPrefix?: string;
}

export function FilterSidebarContent({
  activeCategorySlug,
  activeSubcategorySlug,
  filters,
  onFilterChange,
  onNavigate,
  idPrefix = 'filter',
}: FilterSidebarContentProps) {
  const facets = useCatalogFacets(filters);
  const isActive = hasActiveFilters(filters);

  return (
    <div className="space-y-6">
      <Section title="Condition">
        <ConditionFilter
          selected={filters.condition}
          counts={facets?.conditionCounts}
          onFilterChange={onFilterChange}
        />
      </Section>

      <Separator className="bg-border/60" />

      <Section title="Browse">
        <CategoryTree
          activeCategorySlug={activeCategorySlug}
          activeSubcategorySlug={activeSubcategorySlug}
          onNavigate={onNavigate}
          shelfCounts={facets?.shelfCounts}
        />
      </Section>

      <Separator className="bg-border/60" />

      {isActive && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full font-bold uppercase tracking-wider text-muted-foreground hover:text-accent"
          onClick={() => onFilterChange(CLEAR_ALL_FILTERS)}
        >
          Clear all filters
        </Button>
      )}

      <div className="space-y-3">
        <ToggleRow
          id={`${idPrefix}-in-stock`}
          label="In stock only"
          checked={!!filters.inStockOnly}
          onChange={(v) => onFilterChange({ inStockOnly: v })}
        />
        <ToggleRow
          id={`${idPrefix}-on-sale`}
          label="On sale only"
          checked={!!filters.onSaleOnly}
          onChange={(v) => onFilterChange({ onSaleOnly: v })}
        />
      </div>

      <Separator className="bg-border/60" />

      <Section title="Price">
        <PriceRangeFilter
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          ceilingCents={facets?.priceCeilingCents ?? FALLBACK_CEILING_CENTS}
          onFilterChange={onFilterChange}
        />
      </Section>

      {facets && (
        <>
          <Separator className="bg-border/60" />
          <Section title="Brand">
            <BrandFilter
              brands={facets.brands}
              selected={filters.brands}
              onFilterChange={onFilterChange}
            />
          </Section>
        </>
      )}

    </div>
  );
}
