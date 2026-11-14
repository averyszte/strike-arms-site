import { useEffect, useRef } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { FieldError } from '@/components/admin/product-field-error';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSubcategories } from '@/hooks/use-subcategories';
import type { ProductFormValues } from '@/lib/product-form-schema';
import type { Category } from '@/types/product';

const CATEGORIES = [
  'rifles', 'pistols', 'consumables', 'accessories', 'gear', 'more',
] as const;

/** Category and subcategory; changing the category clears the subcategory. */
export function ProductCategoryFields() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  const selectedCategory = useWatch({ control, name: 'category' }) as Category;
  const { data: subcategories = [] } = useSubcategories(selectedCategory);

  const prevCategoryRef = useRef(selectedCategory);
  useEffect(() => {
    if (prevCategoryRef.current !== selectedCategory) {
      setValue('subcategory', '');
      prevCategoryRef.current = selectedCategory;
    }
  }, [selectedCategory, setValue]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label>Category *</Label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError message={errors.category?.message} />
      </div>

      <div className="space-y-1">
        <Label>Subcategory *</Label>
        <Controller
          name="subcategory"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={subcategories.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    subcategories.length === 0 ? 'No subcategories yet' : 'Select'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {subcategories.map(s => (
                  <SelectItem key={s.id} value={s.slug}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError message={errors.subcategory?.message} />
      </div>
    </div>
  );
}
