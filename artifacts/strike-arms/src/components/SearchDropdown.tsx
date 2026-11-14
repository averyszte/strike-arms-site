import { Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { useSearchDropdown } from '@/hooks/use-search-dropdown';
import { SearchPanelBody } from '@/components/search-panel-body';

interface Props {
  onClose?: () => void;
  fullWidth?: boolean;
}

export function SearchDropdown({ onClose, fullWidth = false }: Props) {
  const { containerRef, inputRef, ...search } = useSearchDropdown(fullWidth, onClose);

  const pillClasses = fullWidth
    ? 'flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1.5 w-full'
    : `flex items-center gap-2 rounded-full border transition-all duration-200 px-3 py-1.5 ${
        search.isFocused
          ? 'bg-card border-accent/60 w-44 xl:w-52'
          : 'bg-card border-border/60 w-28 xl:w-40 hover:border-border'
      }`;

  return (
    <div ref={containerRef} className="relative">
      <div className={pillClasses}>
        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
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
          aria-expanded={search.showPanel}
          aria-autocomplete="list"
          onFocus={search.handleFocus}
          onBlur={search.handleBlur}
        />
        {search.query && (
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              search.clearQuery();
            }}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {search.showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className={`absolute top-[calc(100%+8px)] bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 ${
              fullWidth ? 'left-0 right-0' : 'right-0 w-80'
            }`}
            role="listbox"
            aria-label="Search suggestions"
          >
            <SearchPanelBody
              query={search.query}
              results={search.results}
              activeIdx={search.activeIdx}
              isError={search.isError}
              isPending={search.isPending}
              onSelect={search.goToProduct}
              onHover={search.setActiveIdx}
              onSubmit={search.submitSearch}
              onBrowseAll={search.browseAll}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
