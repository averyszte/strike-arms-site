import { useQuery } from '@tanstack/react-query';

import { listOrphanedImages } from '@/data/orphaned-images-repository';
import { ORPHANED_IMAGES_KEY } from '@/hooks/orphaned-images-query-keys';

export type { OrphanedImage } from '@/data/orphaned-images-repository';

/** Read only when the list is opened: most product edits never need it. */
export function useOrphanedImages(isEnabled: boolean) {
  return useQuery({ queryKey: ORPHANED_IMAGES_KEY, queryFn: listOrphanedImages, enabled: isEnabled });
}
