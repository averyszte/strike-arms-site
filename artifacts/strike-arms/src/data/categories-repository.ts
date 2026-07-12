import { supabase } from '@/lib/supabase';
import { formatSubcategoryName } from '@/lib/format-subcategory';
import type { Category } from '@/types/product';
import type { Subcategory } from '@/types/category';

export async function listSubcategories(category?: Category): Promise<Subcategory[]> {
  let query = supabase.from('products').select('category, subcategory');
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;

  const map = new Map<string, Subcategory>();
  for (const row of data ?? []) {
    const key = `${row.category}:${row.subcategory}`;
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        category: row.category as Category,
        slug: row.subcategory,
        name: formatSubcategoryName(row.subcategory),
        sortOrder: 0,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.slug.localeCompare(b.slug));
}

export async function createSubcategory(
  input: Omit<Subcategory, 'id'>,
): Promise<Subcategory> {
  const { data, error } = await supabase
    .from('subcategories')
    .insert({ category: input.category, slug: input.slug, name: input.name, sort_order: input.sortOrder })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    category: data.category as Category,
    slug: data.slug,
    name: data.name,
    sortOrder: data.sort_order,
  };
}

export async function updateSubcategory(
  id: string,
  patch: { name?: string; sortOrder?: number },
): Promise<Subcategory> {
  const { data, error } = await supabase
    .from('subcategories')
    .update({
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.sortOrder !== undefined && { sort_order: patch.sortOrder }),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    category: data.category as Category,
    slug: data.slug,
    name: data.name,
    sortOrder: data.sort_order,
  };
}

export async function deleteSubcategory(id: string): Promise<void> {
  const { error } = await supabase.from('subcategories').delete().eq('id', id);
  if (error) throw error;
}
