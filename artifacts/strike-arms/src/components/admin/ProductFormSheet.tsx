import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ProductFormFields } from '@/components/admin/ProductFormFields';
import { ProductPublishWarning } from '@/components/admin/ProductPublishWarning';
import { productFormSchema } from '@/lib/product-form-schema';
import type { ProductFormValues } from '@/lib/product-form-schema';
import { useCreateProduct } from '@/hooks/use-create-product';
import { useUpdateProduct } from '@/hooks/use-update-product';
import { useProductImageUpload } from '@/hooks/use-product-image-upload';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_PRODUCT_FORM_VALUES, dirtyProductPatch, toFormValues, toProductInput } from '@/lib/product-form-values';
import type { Product } from '@/types/product';

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
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);

  /**
   * Anything uploaded during this session but never saved onto the product is
   * a file no trigger can ever see, so it goes now. Closing the sheet without
   * saving is the common path — an admin opens "Add product", picks four
   * photos, then changes their mind.
   */
  function discardAndClose() {
    setIsConfirmingDiscard(false);
    upload.discardAll();
    onClose();
  }

  // Closing by accident (a click outside, Escape) lost every edit (M-036).
  function handleClose() {
    if (form.formState.isDirty) setIsConfirmingDiscard(true);
    else discardAndClose();
  }

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    // ProductsTable keys this sheet on the product id, so switching rows
    // remounts it and these defaults are re-read. No reset effect needed.
    defaultValues: product ? toFormValues(product) : DEFAULT_PRODUCT_FORM_VALUES,
  });

  async function onSubmit(values: ProductFormValues) {
    try {
      const input = toProductInput(values);
      if (isEdit && product) {
        const patch = dirtyProductPatch(input, form.formState.dirtyFields);
        await update.mutateAsync({ id: product.id, patch, expectedUpdatedAt: product.updatedAt });
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
        title: 'Not saved',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  }

  // Saving mid-upload would write the product without the photo still in
  // flight, so the button waits for the bucket as well as the table.
  const isPending = create.isPending || update.isPending || upload.isUploading;

  return (
    <>
      <Sheet open={open} onOpenChange={o => { if (!o) handleClose(); }}>
        <SheetContent className="w-full sm:max-w-[520px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isEdit ? 'Edit Product' : 'Add Product'}</SheetTitle>
          </SheetHeader>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
              <ProductFormFields upload={upload} isLive={product?.isPublished === true} />
              <ProductPublishWarning />
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
      <AlertDialog open={isConfirmingDiscard} onOpenChange={setIsConfirmingDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard your changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Nothing you changed here has been saved. Any photos uploaded since you opened it are deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={discardAndClose}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
