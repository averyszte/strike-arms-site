import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Accordion } from '@/components/ui/accordion';
import { AdminLoadError } from '@/components/admin/AdminLoadError';
import { CategorySubcategoriesItem } from '@/components/admin/category-subcategories-item';
import { SubcategoryDeleteDialog } from '@/components/admin/subcategory-delete-dialog';
import { SubcategoryFormSheet } from '@/components/admin/SubcategoryFormSheet';
import { useSubcategories } from '@/hooks/use-subcategories';
import type { Category } from '@/types/product';
import type { Subcategory } from '@/types/category';

const CATEGORY_ORDER: Category[] = [
  'rifles', 'pistols', 'consumables', 'accessories', 'gear', 'more',
];

const CATEGORY_LABELS: Record<Category, string> = {
  rifles: 'Rifles', pistols: 'Pistols', consumables: 'Consumables',
  accessories: 'Accessories', gear: 'Gear', more: 'More',
};

export default function CategoriesPage() {
  const {
    data: allSubcategories = [],
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useSubcategories();

  const [sheetCategory, setSheetCategory] = useState<Category | null>(null);
  const [editing, setEditing] = useState<Subcategory | null>(null);
  const [deleting, setDeleting] = useState<Subcategory | null>(null);

  const grouped = new Map<Category, Subcategory[]>();
  for (const sub of allSubcategories) {
    const bucket = grouped.get(sub.category) ?? [];
    bucket.push(sub);
    grouped.set(sub.category, bucket);
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

      {isError ? (
        <AdminLoadError
          what="the categories"
          error={error}
          isRetrying={isFetching}
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-accent" />
        </div>
      ) : (
        <Accordion type="multiple" defaultValue={[]} className="space-y-2">
          {CATEGORY_ORDER.map(category => (
            <CategorySubcategoriesItem
              key={category}
              category={category}
              label={CATEGORY_LABELS[category]}
              subs={grouped.get(category) ?? []}
              onAdd={openAdd}
              onEdit={openEdit}
              onDelete={setDeleting}
            />
          ))}
        </Accordion>
      )}

      {sheetCategory && (
        <SubcategoryFormSheet
          key={editing?.id ?? 'new'}
          open={!!sheetCategory}
          onClose={() => { setSheetCategory(null); setEditing(null); }}
          category={sheetCategory}
          subcategory={editing ?? undefined}
        />
      )}

      <SubcategoryDeleteDialog deleting={deleting} onClose={() => setDeleting(null)} />
    </>
  );
}
