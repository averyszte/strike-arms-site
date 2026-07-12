import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateSubcategory, useUpdateSubcategory } from '@/hooks/use-categories';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/types/product';
import type { Subcategory } from '@/types/category';

const CATEGORY_LABELS: Record<Category, string> = {
  rifles: 'Rifles', pistols: 'Pistols', consumables: 'Consumables',
  accessories: 'Accessories', gear: 'Gear', parts: 'Parts', more: 'More',
};

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

interface Props {
  open: boolean;
  onClose: () => void;
  category: Category;
  subcategory?: Subcategory;
}

export function SubcategoryFormSheet({ open, onClose, category, subcategory }: Props) {
  const isEdit = !!subcategory;
  const { toast } = useToast();
  const create = useCreateSubcategory();
  const update = useUpdateSubcategory();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setName(subcategory?.name ?? '');
      setSlug(subcategory?.slug ?? '');
      setSlugTouched(!!subcategory);
    }
  }, [open, subcategory]);

  function handleNameChange(val: string) {
    setName(val);
    if (!slugTouched) setSlug(toSlug(val));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    try {
      if (isEdit && subcategory) {
        await update.mutateAsync({ id: subcategory.id, patch: { name: name.trim() } });
        toast({ title: 'Subcategory updated' });
      } else {
        await create.mutateAsync({
          category,
          name: name.trim(),
          slug: slug.trim(),
          sortOrder: 0,
        });
        toast({ title: 'Subcategory added' });
      }
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
      <SheetContent className="w-full sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? 'Edit Subcategory' : `Add Subcategory — ${CATEGORY_LABELS[category]}`}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="sub-name">Display Name *</Label>
            <Input
              id="sub-name"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. AEG Rifles"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sub-slug">Slug *</Label>
            <Input
              id="sub-slug"
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugTouched(true); }}
              placeholder="e.g. aeg-rifles"
              disabled={isEdit}
              className={isEdit ? 'opacity-60' : ''}
            />
            {isEdit && (
              <p className="text-xs text-muted-foreground">
                Slug cannot be changed — it is referenced by products and URLs.
              </p>
            )}
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim() || !slug.trim()} className="flex-1">
              {isPending ? 'Saving…' : isEdit ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
