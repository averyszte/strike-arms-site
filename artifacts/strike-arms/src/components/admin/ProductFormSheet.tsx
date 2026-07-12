import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ProductFormFields, productFormSchema } from '@/components/admin/ProductFormFields';
import type { ProductFormValues } from '@/components/admin/ProductFormFields';
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-admin-products';
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
    stockCount: product.stockCount ?? 0,
    tags: (product.tags ?? []).join(', '),
    imageUrl: product.images[0] ?? '',
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
  stockCount: 0,
  tags: '',
  imageUrl: '',
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
    stockCount: values.stockCount,
    inStock: values.stockCount > 0,
    tags: values.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean),
    images: values.imageUrl ? [values.imageUrl] : [],
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
  const isEdit = !!product;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? toFormValues(product) : DEFAULT_VALUES,
  });

  useEffect(() => {
    form.reset(product ? toFormValues(product) : DEFAULT_VALUES);
  }, [product, form.reset]);

  async function onSubmit(values: ProductFormValues) {
    try {
      const input = toProductInput(values);
      if (isEdit && product) {
        await update.mutateAsync({ id: product.id, patch: input });
      } else {
        await create.mutateAsync(input);
      }
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

  const isPending = create.isPending || update.isPending;

  return (
    <Sheet open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <SheetContent className="w-full sm:max-w-[520px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Product' : 'Add Product'}</SheetTitle>
        </SheetHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <ProductFormFields />
            <div className="flex gap-2 pt-2 border-t border-border sticky bottom-0 bg-background pb-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
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
