import { useEffect, useRef } from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSubcategories } from '@/hooks/use-categories';
import type { Category } from '@/types/product';

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;
const SLUG_PATTERN = /^[a-z0-9-]+$/;

export const productFormSchema = z.object({
  name: z.string().min(2, 'Required'),
  slug: z.string().min(2, 'Required').regex(SLUG_PATTERN, 'Lowercase, numbers, hyphens only'),
  category: z.enum([
    'rifles', 'pistols', 'consumables', 'accessories', 'gear', 'parts', 'more',
  ] as const),
  subcategory: z.string().min(1, 'Required'),
  brand: z.string().min(1, 'Required'),
  priceEuros: z.string().regex(PRICE_PATTERN, 'Enter a valid price e.g. 99.99'),
  salePriceEuros: z
    .string()
    .regex(PRICE_PATTERN, 'Enter a valid price')
    .or(z.literal('')),
  shortDescription: z.string().min(5, 'Min 5 chars').max(200, 'Max 200 chars'),
  description: z.string(),
  isPublished: z.boolean(),
  isNew: z.boolean(),
  isFeatured: z.boolean(),
  stockCount: z.coerce.number().int().min(0, 'Must be 0 or more'),
  tags: z.string(),
  imageUrl: z.string().url('Enter a valid URL').or(z.literal('')),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

const CATEGORIES = [
  'rifles', 'pistols', 'consumables', 'accessories', 'gear', 'parts', 'more',
] as const;

const BOOLEAN_FIELDS: [keyof ProductFormValues & ('isPublished' | 'isNew' | 'isFeatured'), string][] = [
  ['isPublished', 'Published'],
  ['isNew', 'New'],
  ['isFeatured', 'Featured'],
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function ProductFormFields() {
  const {
    register,
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
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" {...register('name')} />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="slug">Slug *</Label>
        <Input id="slug" {...register('slug')} placeholder="e.g. gandg-cm16-carbine" />
        <FieldError message={errors.slug?.message} />
      </div>

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

      <div className="space-y-1">
        <Label htmlFor="brand">Brand slug *</Label>
        <Input id="brand" {...register('brand')} placeholder="e.g. specna-arms" />
        <FieldError message={errors.brand?.message} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="priceEuros">Price (€) *</Label>
          <Input id="priceEuros" {...register('priceEuros')} placeholder="99.99" />
          <FieldError message={errors.priceEuros?.message} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="salePriceEuros">Sale Price (€)</Label>
          <Input id="salePriceEuros" {...register('salePriceEuros')} placeholder="Optional" />
          <FieldError message={errors.salePriceEuros?.message} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="stockCount">Stock Count</Label>
          <Input id="stockCount" type="number" min={0} {...register('stockCount')} />
          <FieldError message={errors.stockCount?.message} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input id="imageUrl" {...register('imageUrl')} placeholder="https://..." />
          <FieldError message={errors.imageUrl?.message} />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="shortDescription">Short Description *</Label>
        <Textarea id="shortDescription" {...register('shortDescription')} rows={2} />
        <FieldError message={errors.shortDescription?.message} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} rows={4} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input id="tags" {...register('tags')} placeholder="aeg, m4, carbine" />
      </div>

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
    </div>
  );
}
