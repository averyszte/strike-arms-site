import { X } from 'lucide-react';
import { buildActiveFilterChips, CLEAR_ALL_FILTERS } from '@/lib/active-filter-chips';
import type { ProductFilters } from '@/types/product';

/**
 * What is narrowing the grid, above the grid, each with its own way off.
 * Without it the only record of a filter is a ticked box that may have
 * scrolled out of the sidebar.
 */

interface ActiveFilterChipsProps {
  filters: ProductFilters;
  onFilterChange: (patch: Partial<ProductFilters>) => void;
}

export function ActiveFilterChips({ filters, onFilterChange }: ActiveFilterChipsProps) {
  const chips = buildActiveFilterChips(filters);
  if (chips.length === 0) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onFilterChange(chip.remove)}
          aria-label={`Remove filter: ${chip.label}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          {chip.label}
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={() => onFilterChange(CLEAR_ALL_FILTERS)}
          className="px-1 text-sm font-bold text-muted-foreground underline-offset-2 hover:text-accent hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
