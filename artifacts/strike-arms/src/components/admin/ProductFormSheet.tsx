import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ProductFormFields } from '@/components/admin/ProductFormFields';
import { productFormSchema } from '@/lib/product-form-schema';
import type { ProductFormValues } from '@/lib/product-form-schema';
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-admin-products';
import { useProductImageUpload } from '@/hooks/use-product-image-upload';
import { useToast } from '@/hooks/use-toast';
import type { Product, Category } from '@/types/product';

function toFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    slug: product.slug,
    category: product.category,
    subcategory: product.subcategory,
    brand: product.brand,
    priceEuros: (product.price / 100).toFixed(2),
    salePriceEuros: product.salePrice != null ? (product.salePrice / 100).toFixed(2) : '',
    shortDescription: product.shortDescription,
    description: product.description ?? '',
    isPublished: product.isPublished ?? false,
    isNew: product.isNew ?? false,
    isFeatured: product.isFeatured ?? false,
    isShippable: product.isShippable,
    stockCount: product.stockCount ?? 0,
    tags: (product.tags ?? []).join(', '),
    images: product.images,
  };
}

const DEFAULT_VALUES: ProductFormValues = {
  name: '',
  slug: '',
  category: 'rifles',
  subcategory: '',
  brand: '',
  priceEuros: '',
  salePriceEuros: '',
  shortDescription: '',
  description: '',
  isPublished: false,
  isNew: false,
  isFeatured: false,
  isShippable: false,
  stockCount: 0,
  tags: '',
  images: [],
};

function toProductInput(values: ProductFormValues): Omit<Product, 'id' | 'createdAt'> {
  return {
    name: values.name,
    slug: values.slug,
    category: values.category as Category,
    subcategory: values.subcategory,
    brand: values.brand,
    price: Math.round(parseFloat(values.priceEuros) * 100),
    salePrice: values.salePriceEuros
      ? Math.round(parseFloat(values.salePriceEuros) * 100)
      : undefined,
    shortDescription: values.shortDescription,
    description: values.description,
    isPublished: values.isPublished,
    isNew: values.isNew,
    isFeatured: values.isFeatured,
    isShippable: values.isShippable,
    stockCount: values.stockCount,
    inStock: values.stockCount > 0,
    tags: values.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean),
    images: values.images,
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
  product?: Product;
}

export function ProductFormSheet({ open, onClose, product }: Props) {
  const { toast } = useToast();
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const upload = useProductImageUpload();
  const isEdit = !!product;

  /**
   * Anything uploaded during this session but never saved onto the product is
   * a file no trigger can ever see, so it goes now. Closing the sheet without
   * saving is the common path — an admin opens "Add product", picks four
   * photos, then changes their mind.
   */
  function handleClose() {
    upload.discardAll();
    onClose();
  }

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    // ProductsTable keys this sheet on the product id, so switching rows
    // remounts it and these defaults are re-read. No reset effect needed.
    defaultValues: product ? toFormValues(product) : DEFAULT_VALUES,
  });

  async function onSubmit(values: ProductFormValues) {
    try {
      const input = toProductInput(values);
      if (isEdit && product) {
        await update.mutateAsync({ id: product.id, patch: input });
      } else {
        await create.mutateAsync(input);
      }
      // The product row owns the images now; the trigger in migration 011 is
      // what cleans them up from here on.
      upload.commit();
      toast({ title: isEdit ? 'Product updated' : 'Product created' });
      onClose();
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  }

  // Saving mid-upload would write the product without the photo still in
  // flight, so the button waits for the bucket as well as the table.
  const isPending = create.isPending || update.isPending || upload.isUploading;

  return (
    <Sheet open={open} onOpenChange={o => { if (!o) handleClose(); }}>
      <SheetContent className="w-full sm:max-w-[520px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Product' : 'Add Product'}</SheetTitle>
        </SheetHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <ProductFormFields upload={upload} />
            <div className="flex gap-2 pt-2 border-t border-border sticky bottom-0 bg-background pb-2">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending ? 'Saving…' : isEdit ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}
