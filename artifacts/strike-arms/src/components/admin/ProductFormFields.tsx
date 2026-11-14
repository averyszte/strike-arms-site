import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductCategoryFields } from '@/components/admin/product-category-fields';
import { FieldError } from '@/components/admin/product-field-error';
import { ProductFlagFields } from '@/components/admin/product-flag-fields';
import { ProductImagesField } from '@/components/admin/ProductImagesField';
import { ProductSlugField } from '@/components/admin/ProductSlugField';
import type { ProductImageUpload } from '@/hooks/use-product-image-upload';
import { CONDITION_LABELS, PRODUCT_CONDITIONS } from '@/lib/product-condition';
import type { ProductFormValues } from '@/lib/product-form-schema';

interface Props {
  /** Owned by ProductFormSheet, which also has to discard on cancel. */
  upload: ProductImageUpload;
  /** The product was published when the sheet opened: its slug is locked. */
  isLive: boolean;
}

export function ProductFormFields({ upload, isLive }: Props) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" {...register('name')} />
        <FieldError message={errors.name?.message} />
      </div>

      <ProductSlugField isLive={isLive} />

      <ProductCategoryFields />

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

      <ProductFlagFields />
    </div>
  );
}
