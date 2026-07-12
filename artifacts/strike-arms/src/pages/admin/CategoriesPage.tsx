import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import { SubcategoryFormSheet } from '@/components/admin/SubcategoryFormSheet';
import { useSubcategories, useDeleteSubcategory } from '@/hooks/use-categories';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/types/product';
import type { Subcategory } from '@/types/category';

const CATEGORY_ORDER: Category[] = [
  'rifles', 'pistols', 'consumables', 'accessories', 'gear', 'parts', 'more',
];

const CATEGORY_LABELS: Record<Category, string> = {
  rifles: 'Rifles', pistols: 'Pistols', consumables: 'Consumables',
  accessories: 'Accessories', gear: 'Gear', parts: 'Parts', more: 'More',
};

export default function CategoriesPage() {
  const { data: allSubcategories = [], isLoading } = useSubcategories();
  const deleteSubcategory = useDeleteSubcategory();
  const { toast } = useToast();

  const [sheetCategory, setSheetCategory] = useState<Category | null>(null);
  const [editing, setEditing] = useState<Subcategory | null>(null);
  const [deleting, setDeleting] = useState<Subcategory | null>(null);

  const grouped = new Map<Category, Subcategory[]>();
  for (const sub of allSubcategories) {
    const bucket = grouped.get(sub.category) ?? [];
    bucket.push(sub);
    grouped.set(sub.category, bucket);
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteSubcategory.mutateAsync(deleting.id);
      toast({ title: 'Subcategory deleted' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    } finally {
      setDeleting(null);
    }
  }

  function openAdd(category: Category) {
    setEditing(null);
    setSheetCategory(category);
  }

  function openEdit(sub: Subcategory) {
    setEditing(sub);
    setSheetCategory(sub.category);
  }

  return (
    <>
      <Helmet>
        <title>Categories | Strike Arms Admin</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground mb-1">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Manage subcategories within each top-level category. Subcategory slugs are used in
          product URLs and cannot be renamed once set.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-accent" />
        </div>
      ) : (
        <Accordion type="multiple" defaultValue={[]} className="space-y-2">
          {CATEGORY_ORDER.map(category => {
            const subs = grouped.get(category) ?? [];
            return (
              <AccordionItem
                key={category}
                value={category}
                className="border border-border rounded-md overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/30 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm text-foreground">
                      {CATEGORY_LABELS[category]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {subs.length} subcategor{subs.length !== 1 ? 'ies' : 'y'}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                  <div className="border-t border-border">
                    {subs.length > 0 && (
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                          <tr>
                            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                              Name
                            </th>
                            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                              Slug
                            </th>
                            <th className="px-4 py-2.5" />
                          </tr>
                        </thead>
                        <tbody>
                          {subs.map(sub => (
                            <tr
                              key={sub.id}
                              className="border-b border-border last:border-0 hover:bg-muted/30"
                            >
                              <td className="px-4 py-3 font-medium text-foreground">{sub.name}</td>
                              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                {sub.slug}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => openEdit(sub)}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 hover:text-destructive"
                                    onClick={() => setDeleting(sub)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    <div className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8"
                        onClick={() => openAdd(category)}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Add subcategory
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {sheetCategory && (
        <SubcategoryFormSheet
          open={!!sheetCategory}
          onClose={() => { setSheetCategory(null); setEditing(null); }}
          category={sheetCategory}
          subcategory={editing ?? undefined}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={o => { if (!o) setDeleting(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete subcategory?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleting?.name}&rdquo; will be removed. Products using this subcategory will
              keep their existing value but the subcategory won&apos;t appear in the dropdown.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
