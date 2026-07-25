import { supabase } from '@/lib/supabase';
import type { Category } from '@/types/product';
import type { Subcategory } from '@/types/category';

export async function listSubcategories(category?: Category): Promise<Subcategory[]> {
  // Reads the admin-managed subcategories table (the source of truth) so that
  // each row carries its real UUID — update/delete key off that id. Deriving
  // the list from distinct products instead would produce synthetic ids the
  // write path cannot match, and would hide subcategories that have no products yet.
  let query = supabase
    .from('subcategories')
    .select('id, category, slug, name, sort_order')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true });
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map(row => ({
    id: row.id,
    category: row.category as Category,
    slug: row.slug,
    name: row.name,
    sortOrder: row.sort_order,
  }));
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
