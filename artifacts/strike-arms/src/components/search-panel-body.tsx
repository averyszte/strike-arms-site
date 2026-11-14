import { SearchResultRow } from '@/components/SearchResultRow';
import type { Product } from '@/types/product';

interface Props {
  query: string;
  results: Product[];
  activeIdx: number;
  isError: boolean;
  isPending: boolean;
  onSelect: (product: Product) => void;
  onHover: (index: number) => void;
  onSubmit: () => void;
  onBrowseAll: () => void;
}

/** The body of the header search panel: error, searching, results or no results. */
export function SearchPanelBody({
  query,
  results,
  activeIdx,
  isError,
  isPending,
  onSelect,
  onHover,
  onSubmit,
  onBrowseAll,
}: Props) {
  // Checked before results, because placeholderData keeps the last term's
  // matches on screen while a new term is in flight. Showing those under a
  // different query is a wrong answer, not a stale one.
  if (isError) {
    return (
      <div className="px-4 py-6 text-center space-y-1">
        <p className="text-sm text-foreground">Search is not working right now</p>
        <p className="text-xs text-muted-foreground">
          That is a fault at our end, not an empty shelf.
        </p>
        <button className="text-xs text-accent hover:underline" onMouseDown={onBrowseAll}>
          Browse the full range
        </button>
      </div>
    );
  }

  // Only true when there is nothing to show at all -- once a search has
  // returned once, placeholderData keeps those results on screen while the
  // next term is fetched. Without this branch the first search of a session
  // reads "No results" for as long as the request takes, which is a wrong
  // answer, not a slow one.
  if (isPending) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">Searching…</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="px-4 py-6 text-center space-y-1">
        <p className="text-sm text-muted-foreground">No results for "{query}"</p>
        <button className="text-xs text-accent hover:underline" onMouseDown={onSubmit}>
          Search all products
        </button>
      </div>
    );
  }

  return (
    <>
      <ul>
        {results.map((p, i) => (
          <SearchResultRow
            key={p.id}
            product={p}
            isActive={i === activeIdx}
            onSelect={() => onSelect(p)}
            onHover={() => onHover(i)}
          />
        ))}
      </ul>
      <button
        className="w-full px-4 py-2.5 text-xs text-accent font-medium hover:bg-accent/10 transition-colors text-center border-t border-border/40"
        onMouseDown={onSubmit}
        onMouseEnter={() => onHover(-1)}
      >
        View all results for "{query}"
      </button>
    </>
  );
}
