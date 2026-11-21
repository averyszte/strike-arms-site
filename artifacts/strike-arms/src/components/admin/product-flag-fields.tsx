import { Controller, useFormContext } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { ProductFormValues } from '@/lib/product-form-schema';

type BooleanFieldName = keyof ProductFormValues &
  ('inStock' | 'isPublished' | 'isNew' | 'isFeatured' | 'isShippable');

const BOOLEAN_FIELDS: [BooleanFieldName, string][] = [
  // Set by hand: nothing counts stock, and a sale leaves it ticked.
  ['inStock', 'In stock'],
  ['isPublished', 'Published'],
  ['isNew', 'New'],
  ['isFeatured', 'Featured'],
  // On by default: Alan posts everything (migration 052). Untick it for an
  // item that must be collected from the shop.
  ['isShippable', 'Can be posted'],
];

/** The product's on/off switches: stock, published, new, featured, postable. */
export function ProductFlagFields() {
  const { control } = useFormContext<ProductFormValues>();

  return (
    <div className="flex flex-wrap gap-5 pt-1">
      {BOOLEAN_FIELDS.map(([name, label]) => (
        <div key={name} className="flex items-center gap-2">
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Checkbox
                id={name}
                checked={field.value as boolean}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor={name} className="cursor-pointer font-normal">
            {label}
          </Label>
        </div>
      ))}
    </div>
  );
}
