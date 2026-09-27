import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { pageBounds } from '@/lib/page-bounds';

/**
 * "26 to 50 of 73" and a pair of buttons, under an admin table that pages on
 * the server. Previous and Next only: the lists are newest first, so the work
 * is almost always on page one and a numbered strip would be clutter.
 */

type AdminPagerProps = {
  page: number;
  pageSize: number;
  total: number;
  /** What is being counted, plural: "orders". */
  noun: string;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
};

export function AdminPager({
  page,
  pageSize,
  total,
  noun,
  isFetching = false,
  onPageChange,
}: AdminPagerProps) {
  const { first, last, pageCount, hasPrevious, hasNext } = pageBounds(page, pageSize, total);
  if (total === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {first} to {last} of {total} {noun}
      </p>
      {pageCount > 1 && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!hasPrevious || isFetching}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!hasNext || isFetching}
            onClick={() => onPageChange(page + 1)}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
