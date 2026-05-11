import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ProductFilters } from '@/types/product';

const SORT_OPTIONS: { value: NonNullable<ProductFilters['sort']>; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
];

interface SortDropdownProps {
  value: ProductFilters['sort'];
  onChange: (sort: ProductFilters['sort']) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <Select
      value={value ?? 'featured'}
      onValueChange={(v) => onChange(v as ProductFilters['sort'])}
    >
      <SelectTrigger className="w-[180px] text-sm h-9">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
