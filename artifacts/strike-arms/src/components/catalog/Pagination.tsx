import { Button } from '@/components/ui/button';

interface PaginationProps {
  showing: number;
  total: number;
  onLoadMore: () => void;
}

export function Pagination({ showing, total, onLoadMore }: PaginationProps) {
  const hasMore = showing < total;

  return (
    <div className="flex flex-col items-center gap-4 pt-8">
      <p className="text-sm text-muted-foreground">
        Showing <span className="text-foreground font-medium">{showing}</span> of{' '}
        <span className="text-foreground font-medium">{total}</span> products
      </p>
      {hasMore && (
        <Button variant="outline" onClick={onLoadMore} className="min-w-[140px]">
          Load more
        </Button>
      )}
    </div>
  );
}
