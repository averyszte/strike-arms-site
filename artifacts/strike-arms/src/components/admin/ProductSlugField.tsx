import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
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

/**
 * The product's address on the shop. Once a product has been live, Google,
 * old links and customers' bookmarks point at it, so it is locked until the
 * admin says they mean it (M-039).
 */
export function ProductSlugField({ isLive }: { isLive: boolean }) {
  const { register, formState: { errors } } = useFormContext<ProductFormValues>();
  const [isUnlocked, setIsUnlocked] = useState(!isLive);
  const [isAsking, setIsAsking] = useState(false);

  return (
    <div className="space-y-1">
      <Label htmlFor="slug">Slug *</Label>
      <div className="flex gap-2">
        <Input id="slug" {...register('slug')} readOnly={!isUnlocked} placeholder="e.g. gandg-cm16-carbine" />
        {!isUnlocked && (
          <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => setIsAsking(true)}>
            <Lock className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Unlock
          </Button>
        )}
      </div>
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
            <AlertDialogAction onClick={() => setIsUnlocked(true)}>Unlock the slug</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
