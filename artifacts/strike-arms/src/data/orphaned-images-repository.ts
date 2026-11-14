import { supabase } from '@/data/supabase-client';
import { PRODUCT_IMAGES_BUCKET } from '@/data/storage-repository';

/**
 * Photos taken off a product and waiting to be swept (M-018). Since 045 the
 * sweep waits 30 days, and until then a photo can be put back.
 */

export type OrphanedImage = {
  path: string;
  url: string;
  orphanedAt: string;
  sweepAfter: string;
};

export async function listOrphanedImages(): Promise<OrphanedImage[]> {
  const { data, error } = await supabase.rpc('list_orphaned_images');
  if (error) throw error;
  return (data ?? []).map(row => ({
    path: row.path,
    url: supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(row.path).data.publicUrl,
    orphanedAt: row.orphaned_at,
    sweepAfter: row.sweep_after,
  }));
}

/** Takes the photo off the sweep queue. False when it was no longer queued. */
export async function restoreOrphanedImage(path: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('restore_orphaned_image', { p_path: path });
  if (error) throw error;
  return data === true;
}
