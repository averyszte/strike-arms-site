import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Lock } from 'lucide-react';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProductFormValues } from '@/lib/product-form-schema';
import { toSlug } from '@/lib/product-slug';

/**
 * The product's address on the shop. Once a product has been live, Google,
 * old links and customers' bookmarks point at it, so it is locked until the
 * admin says they mean it (M-039).
 *
 * N-077: on a new product the address follows the name until the admin
 * types in this field themselves, so nobody has to invent one.
 */
export function ProductSlugField({ isLive }: { isLive: boolean }) {
  const { register, control, getValues, setValue, formState: { errors } } = useFormContext<ProductFormValues>();
  const [isUnlocked, setIsUnlocked] = useState(!isLive);
  const [isAsking, setIsAsking] = useState(false);
  const [shouldFollowName] = useState(() => !isLive && !getValues('slug'));
  const [isEditedByHand, setIsEditedByHand] = useState(false);
  const name = useWatch({ control, name: 'name' });
  const slug = useWatch({ control, name: 'slug' });
  const slugField = register('slug');

  useEffect(() => {
    if (!shouldFollowName || isEditedByHand) return;
    setValue('slug', toSlug(name ?? ''), { shouldDirty: true });
  }, [name, shouldFollowName, isEditedByHand, setValue]);

  return (
    <div className="space-y-1">
      <Label htmlFor="slug">Web address *</Label>
      <div className="flex gap-2">
        <Input
          id="slug"
          {...slugField}
          onChange={(event) => {
            setIsEditedByHand(true);
            return slugField.onChange(event);
          }}
          readOnly={!isUnlocked}
          placeholder="e.g. gandg-cm16-carbine"
        />
        {!isUnlocked && (
          <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => setIsAsking(true)}>
            <Lock className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Unlock
          </Button>
        )}
      </div>
      <p className="break-all text-xs text-muted-foreground">
        strikearms.ie/products/{slug || '...'}
        {shouldFollowName && !isEditedByHand && ' (filled from the name)'}
      </p>
      {!isUnlocked && <p className="text-xs text-muted-foreground">Locked: this product has been on the shop.</p>}
      {errors.slug?.message && <p className="text-xs text-destructive">{errors.slug.message}</p>}

      <AlertDialog open={isAsking} onOpenChange={setIsAsking}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change a live product&apos;s address?</AlertDialogTitle>
            <AlertDialogDescription>
              Links to the old address, from Google, social posts and saved bookmarks, will stop working.
              Only change it to fix a real mistake.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Leave it</AlertDialogCancel>
            <AlertDialogAction onClick={() => setIsUnlocked(true)}>Unlock the address</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
