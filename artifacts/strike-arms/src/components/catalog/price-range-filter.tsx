import { useId, type KeyboardEvent } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { Input } from '@/components/ui/input';
import { usePriceRangeDraft } from '@/hooks/use-price-range-draft';
import { SLIDER_STEPS } from '@/lib/price-scale';
import type { ProductFilters } from '@/types/product';

/**
 * Two handles and two boxes for one range.
 *
 * Built on the Radix primitive directly because the shadcn Slider renders a
 * single thumb, which is why the old control could set a minimum and nothing
 * else. The track is non-linear (lib/price-scale.ts); the boxes take any
 * price, so nobody has to drag to an exact figure.
 */

const THUMB =
  'block h-5 w-5 rounded-full border-2 border-accent bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

interface PriceRangeFilterProps {
  minPrice?: number;
  maxPrice?: number;
  ceilingCents: number;
  onFilterChange: (patch: Partial<ProductFilters>) => void;
}

interface PriceBoxProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onCommit: () => void;
}

function PriceBox({ id, label, value, onChange, onCommit }: PriceBoxProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') onCommit();
  };
  return (
    <div className="flex-1">
      <label htmlFor={id} className="mb-1 block text-xs text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          €
        </span>
        <Input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onCommit}
          onKeyDown={onKeyDown}
          className="h-9 pl-6 text-sm"
        />
      </div>
    </div>
  );
}

export function PriceRangeFilter({
  minPrice,
  maxPrice,
  ceilingCents,
  onFilterChange,
}: PriceRangeFilterProps) {
  const id = useId();
  const draft = usePriceRangeDraft(minPrice, maxPrice, ceilingCents, (range) =>
    onFilterChange({ minPrice: range.minPrice, maxPrice: range.maxPrice }),
  );

  return (
    <div className="space-y-4">
      <SliderPrimitive.Root
        min={0}
        max={SLIDER_STEPS}
        step={1}
        minStepsBetweenThumbs={1}
        value={draft.positions}
        onValueChange={draft.onSlide}
        onValueCommit={draft.onSlideCommit}
        className="relative flex h-5 w-full touch-none select-none items-center"
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-border">
          <SliderPrimitive.Range className="absolute h-full bg-accent" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb aria-label="Minimum price" className={THUMB} />
        <SliderPrimitive.Thumb aria-label="Maximum price" className={THUMB} />
      </SliderPrimitive.Root>

      <div className="flex items-end gap-2">
        <PriceBox
          id={`${id}-min`}
          label="Min"
          value={draft.minText}
          onChange={draft.setMinText}
          onCommit={draft.commitText}
        />
        <span className="pb-2 text-muted-foreground" aria-hidden="true">
          –
        </span>
        <PriceBox
          id={`${id}-max`}
          label="Max"
          value={draft.maxText}
          onChange={draft.setMaxText}
          onCommit={draft.commitText}
        />
      </div>
    </div>
  );
}
