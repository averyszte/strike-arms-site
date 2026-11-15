import { Search, X } from 'lucide-react';

import { useSearchDropdown } from '@/hooks/use-search-dropdown';
import { SearchPanelBody } from '@/components/search-panel-body';
import { searchStatusText } from '@/lib/search-status';

interface Props {
  onClose?: () => void;
  fullWidth?: boolean;
  /** Focus the box once it mounts. Defaults to `fullWidth` (the mobile search bar). */
  shouldAutoFocus?: boolean;
}

/** Keeps focus in the input when a panel control is pressed, so blur does not close it first. */
const keepFocus = (e: React.MouseEvent) => e.preventDefault();

export function SearchDropdown({ onClose, fullWidth = false, shouldAutoFocus = fullWidth }: Props) {
  const { containerRef, inputRef, ...search } = useSearchDropdown(shouldAutoFocus, onClose);
  const hasOptions = search.showPanel && !search.isError && !search.isPending && search.results.length > 0;

  const pillClasses = fullWidth
    ? 'flex items-center gap-2 rounded-full border border-input bg-card px-3 py-1.5 w-full'
    : `flex items-center gap-2 rounded-full border transition-all duration-200 px-3 py-1.5 ${
        search.isFocused
          ? 'bg-card border-accent/60 w-44 xl:w-52'
          : 'bg-card border-input w-28 xl:w-40 hover:border-foreground/40'
      }`;

  return (
    <div ref={containerRef} role="search" className="relative" onBlur={search.handleBlur}>
      <div className={pillClasses}>
        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search products…"
          value={search.query}
          onChange={(e) => search.handleChange(e.target.value)}
          onKeyDown={search.handleKeyDown}
          className="bg-transparent text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none w-full"
          aria-label="Search products"
          role="combobox"
          aria-expanded={hasOptions}
          aria-controls={search.listId}
          aria-autocomplete="list"
          aria-activedescendant={hasOptions && search.activeIdx >= 0 ? search.optionId(search.activeIdx) : undefined}
          onFocus={search.handleFocus}
        />
        {search.query && (
          <button
            type="button"
            onMouseDown={keepFocus}
            onClick={search.clearQuery}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {searchStatusText(search)}
      </p>

      {search.showPanel && (
        <div
          className={`absolute top-[calc(100%+8px)] bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in-0 duration-100 ${
            fullWidth ? 'left-0 right-0' : 'right-0 w-80'
          }`}
        >
          <SearchPanelBody
            listId={search.listId}
            optionId={search.optionId}
            query={search.query}
            results={search.results}
            activeIdx={search.activeIdx}
            isError={search.isError}
            isPending={search.isPending}
            onSelect={search.goToProduct}
            onHover={search.setActiveIdx}
            onSubmit={search.submitSearch}
            onBrowseAll={search.browseAll}
            onPointerDown={keepFocus}
          />
        </div>
      )}
    </div>
  );
}
