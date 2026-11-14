import { Plus, Edit2, Trash2 } from 'lucide-react';

import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import type { Category } from '@/types/product';
import type { Subcategory } from '@/types/category';

type Props = {
  category: Category;
  label: string;
  subs: Subcategory[];
  onAdd: (category: Category) => void;
  onEdit: (sub: Subcategory) => void;
  onDelete: (sub: Subcategory) => void;
};

/** One top-level category on the categories screen: its subcategories and an add button. */
export function CategorySubcategoriesItem({ category, label, subs, onAdd, onEdit, onDelete }: Props) {
  return (
    <AccordionItem
      value={category}
      className="border border-border rounded-md overflow-hidden"
    >
      <AccordionTrigger className="px-4 py-3 hover:bg-muted/30 hover:no-underline">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm text-foreground">
            {label}
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
                          onClick={() => onEdit(sub)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 hover:text-destructive"
                          onClick={() => onDelete(sub)}
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
              onClick={() => onAdd(category)}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add subcategory
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
