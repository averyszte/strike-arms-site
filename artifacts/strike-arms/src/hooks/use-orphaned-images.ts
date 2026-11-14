import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { listOrphanedImages, restoreOrphanedImage } from '@/data/orphaned-images-repository';

export type { OrphanedImage } from '@/data/orphaned-images-repository';

const KEY = ['admin', 'orphaned-images'] as const;

/** Read only when the list is opened: most product edits never need it. */
export function useOrphanedImages(isEnabled: boolean) {
  return useQuery({ queryKey: KEY, queryFn: listOrphanedImages, enabled: isEnabled });
}

export function useRestoreOrphanedImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (path: string) => restoreOrphanedImage(path),
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
