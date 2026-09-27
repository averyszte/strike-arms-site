import { useEffect, useRef } from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
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
import { ProductImagesField } from '@/components/admin/ProductImagesField';
import { useSubcategories } from '@/hooks/use-categories';
import type { ProductImageUpload } from '@/hooks/use-product-image-upload';
import { CONDITION_LABELS, PRODUCT_CONDITIONS } from '@/lib/product-condition';
import type { Category } from '@/types/product';
import type { ProductFormValues } from '@/lib/product-form-schema';

const CATEGORIES = [
  'rifles', 'pistols', 'consumables', 'accessories', 'gear', 'more',
] as const;

type BooleanFieldName = keyof ProductFormValues &
  ('isPublished' | 'isNew' | 'isFeatured' | 'isShippable');

const BOOLEAN_FIELDS: [BooleanFieldName, string][] = [
  ['isPublished', 'Published'],
  ['isNew', 'New'],
  ['isFeatured', 'Featured'],
  // Off by default. Guns are collect-in-store only, so an item is never
  // posted unless someone has explicitly ticked this.
  ['isShippable', 'Can be posted'],
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

interface Props {
  /** Owned by ProductFormSheet, which also has to discard on cancel. */
  upload: ProductImageUpload;
  /** Set when editing. Stock is then shown, not edited: Adjust stock owns it. */
  stockOnShelf?: number;
}

export function ProductFormFields({ upload, stockOnShelf }: Props) {
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

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="brand">Brand slug *</Label>
          <Input id="brand" {...register('brand')} placeholder="e.g. specna-arms" />
          <FieldError message={errors.brand?.message} />
        </div>

        <div className="space-y-1">
          <Label>Condition *</Label>
          <Controller
            name="condition"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CONDITIONS.map(c => (
                    <SelectItem key={c} value={c}>
                      {CONDITION_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {/* Pre-loved prints its own badge and its own sold-as-seen notice on
              the product page, so nobody has to remember to type the warning. */}
          <FieldError message={errors.condition?.message} />
        </div>
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

      {stockOnShelf === undefined ? (
        <div className="space-y-1">
          <Label htmlFor="openingStock">Opening stock</Label>
          <Input id="openingStock" type="number" min={0} {...register('openingStock')} />
          <FieldError message={errors.openingStock?.message} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {stockOnShelf} on the shelf. To change it, use Adjust stock in the products
          list, so the inventory history records who and why.
        </p>
      )}

      <ProductImagesField upload={upload} />

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
