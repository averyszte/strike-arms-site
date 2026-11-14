import { useMutation, useQueryClient } from '@tanstack/react-query';

import { restoreOrphanedImage } from '@/data/orphaned-images-repository';
import { ORPHANED_IMAGES_KEY } from '@/hooks/orphaned-images-query-keys';

export function useRestoreOrphanedImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (path: string) => restoreOrphanedImage(path),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ORPHANED_IMAGES_KEY }),
  });
}
