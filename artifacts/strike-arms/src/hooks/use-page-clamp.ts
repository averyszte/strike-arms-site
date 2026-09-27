import { useEffect } from 'react';

import { pageBounds } from '@/lib/page-bounds';

/**
 * Moves back to the last page when the current one is past the end, as when
 * the last rows of the last page are archived, or a link says ?page=40.
 * Otherwise the list is empty and reads as "nothing here".
 */
export function usePageClamp(
  page: number,
  pageSize: number,
  total: number | undefined,
  setPage: (page: number) => void,
) {
  const lastPage = pageBounds(page, pageSize, total ?? 0).pageCount;
  useEffect(() => {
    if (total !== undefined && page > lastPage) setPage(lastPage);
  }, [total, page, lastPage, setPage]);
}
