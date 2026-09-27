import { Button } from '@/components/ui/button';
import { CTA_SECONDARY } from '@/lib/storefront-styles';

interface PaginationProps {
  showing: number;
  total: number;
  onLoadMore: () => void;
}

export function Pagination({ showing, total, onLoadMore }: PaginationProps) {
  const hasMore = showing < total;

  return (
    <div className="flex flex-col items-center gap-5 pt-12">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Showing <span className="text-foreground font-black">{showing}</span> of{' '}
        <span className="text-foreground font-black">{total}</span> products
      </p>
      {hasMore && (
        <Button variant="outline" onClick={onLoadMore} className={`${CTA_SECONDARY} min-w-[200px]`}>
          Load more
        </Button>
      )}
    </div>
  );
}
