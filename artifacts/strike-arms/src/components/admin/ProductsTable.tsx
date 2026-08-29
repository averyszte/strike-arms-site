import { useState } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { ProductFormSheet } from '@/components/admin/ProductFormSheet';
import { useAdminProducts, useDeleteProduct } from '@/hooks/use-admin-products';
import { useToast } from '@/hooks/use-toast';
import { formatBrand } from '@/lib/format-brand';
import { formatSubcategoryName } from '@/lib/format-subcategory';
import type { Product, Category } from '@/types/product';

const CATEGORY_ORDER: Category[] = [
  'rifles', 'pistols', 'consumables', 'accessories', 'gear', 'parts', 'more',
];

const CATEGORY_LABELS: Record<Category, string> = {
  rifles: 'Rifles',
  pistols: 'Pistols',
  consumables: 'Consumables',
  accessories: 'Accessories',
  gear: 'Gear',
  parts: 'Parts',
  more: 'More',
};

function formatPrice(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

export function ProductsTable() {
  const { data: products, isLoading } = useAdminProducts();
  const deleteProduct = useDeleteProduct();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteProduct.mutateAsync(deleting.id);
      toast({ title: 'Product deleted' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
    } finally {
      setDeleting(null);
    }
  }

  const grouped = new Map<Category, Product[]>();
  for (const p of products ?? []) {
    const bucket = grouped.get(p.category) ?? [];
    bucket.push(p);
    grouped.set(p.category, bucket);
  }
  grouped.forEach(bucket =>
    bucket.sort(
      (a, b) =>
        a.subcategory.localeCompare(b.subcategory) || a.name.localeCompare(b.name),
    ),
  );

  const presentCategories = CATEGORY_ORDER.filter(c => grouped.has(c));

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          Products ({products?.length ?? 0})
        </h2>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Product
        </Button>
      </div>

      {presentCategories.length === 0 ? (
        <div className="border border-border rounded-md px-4 py-12 text-center text-muted-foreground">
          No products yet. Click "Add Product" to create one.
        </div>
      ) : (
        <Accordion type="multiple" defaultValue={[]} className="space-y-2">
          {presentCategories.map(category => {
            const items = grouped.get(category)!;
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
                      {items.length} product{items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                  <div className="overflow-x-auto border-t border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Name</th>
                          <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Brand</th>
                          <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Subcategory</th>
                          <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Price</th>
                          <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Stock</th>
                          <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Status</th>
                          <th className="px-4 py-2.5" />
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(product => (
                          <tr
                            key={product.id}
                            className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <p className="font-medium text-foreground line-clamp-1">{product.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{product.slug}</p>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {formatBrand(product.brand)}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">
                              {formatSubcategoryName(product.subcategory)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {product.salePrice != null ? (
                                <div>
                                  <span className="text-accent font-semibold">
                                    {formatPrice(product.salePrice)}
                                  </span>
                                  <span className="text-xs text-muted-foreground line-through ml-1">
                                    {formatPrice(product.price)}
                                  </span>
                                </div>
                              ) : (
                                <span>{formatPrice(product.price)}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={product.inStock ? 'text-green-600' : 'text-destructive'}>
                                {product.stockCount ?? 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {product.isPublished ? (
                                <Badge className="text-[10px] bg-green-600 text-white hover:bg-green-600">
                                  Live
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px]">
                                  Draft
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => setEditing(product)}
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 hover:text-destructive"
                                  onClick={() => setDeleting(product)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      <ProductFormSheet open={adding} onClose={() => setAdding(false)} />
      <ProductFormSheet
        key={editing?.id ?? 'none'}
        open={!!editing}
        onClose={() => setEditing(null)}
        product={editing ?? undefined}
      />

      <AlertDialog open={!!deleting} onOpenChange={o => { if (!o) setDeleting(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleting?.name}&rdquo; will be permanently deleted. This cannot be undone.
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
