import { useRef, useState, useCallback, useEffect, type KeyboardEvent } from 'react';
import { useLocation } from 'wouter';
import { Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { useSearchProducts } from '@/hooks/use-search-products';
import { formatPrice } from '@/lib/format-price';
import { getCategory } from '@/lib/taxonomy';
import type { Product } from '@/types/product';

interface Props {
  onClose?: () => void;
  fullWidth?: boolean;
}

export function SearchDropdown({ onClose, fullWidth = false }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const { results } = useSearchProducts(query);
  const showPanel = open && query.length >= 2;

  useEffect(() => {
    if (!fullWidth) return undefined;
    const id = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, [fullWidth]);

  useEffect(() => {
    if (!showPanel) return;
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setIsFocused(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [showPanel]);

  const closeAndClear = useCallback(() => {
    setOpen(false);
    setIsFocused(false);
    setQuery('');
    setActiveIdx(-1);
    onClose?.();
  }, [onClose]);

  const goToProduct = useCallback(
    (p: Product) => {
      navigate(`/products/${p.slug}`);
      closeAndClear();
    },
    [navigate, closeAndClear],
  );

  const submitSearch = useCallback(() => {
    if (!query.trim()) return;
    navigate(`/store?q=${encodeURIComponent(query.trim())}`);
    closeAndClear();
  }, [query, navigate, closeAndClear]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
      inputRef.current?.blur();
      onClose?.();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      if (results[activeIdx]) goToProduct(results[activeIdx]);
      else submitSearch();
    }
  };

  const pillClasses = fullWidth
    ? 'flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1.5 w-full'
    : `flex items-center gap-2 rounded-full border transition-all duration-200 px-3 py-1.5 ${
        isFocused
          ? 'bg-card border-accent/60 w-44'
          : 'bg-card border-border/60 w-28 hover:border-border'
      }`;

  return (
    <div ref={containerRef} className="relative">
      <div className={pillClasses}>
        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search products…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIdx(-1);
          }}
          onKeyDown={handleKeyDown}
          className="bg-transparent text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none w-full"
          aria-label="Search products"
          role="combobox"
          aria-expanded={showPanel}
          aria-autocomplete="list"
          onFocus={() => {
            setIsFocused(true);
            setOpen(true);
          }}
          onBlur={() =>
            setTimeout(() => {
              setIsFocused(false);
              setOpen(false);
              setActiveIdx(-1);
            }, 150)
          }
        />
        {query && (
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              setQuery('');
              setActiveIdx(-1);
              inputRef.current?.focus();
            }}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showPanel && (
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
            {results.length > 0 ? (
              <>
                <ul>
                  {results.map((p, i) => (
                    <li key={p.id} role="option" aria-selected={i === activeIdx}>
                      <button
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-border/40 last:border-b-0 ${
                          i === activeIdx ? 'bg-accent/10' : 'hover:bg-muted/50'
                        }`}
                        onMouseDown={() => goToProduct(p)}
                        onMouseEnter={() => setActiveIdx(i)}
                      >
                        <div className="w-9 h-9 bg-muted rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
                          {p.images[0] ? (
                            <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Search className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {getCategory(p.category)?.shortLabel ?? p.category}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          {p.salePrice ? (
                            <>
                              <p className="text-sm font-semibold text-accent">{formatPrice(p.salePrice)}</p>
                              <p className="text-[11px] line-through text-muted-foreground">{formatPrice(p.price)}</p>
                            </>
                          ) : (
                            <p className="text-sm font-semibold">{formatPrice(p.price)}</p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  className="w-full px-4 py-2.5 text-xs text-accent font-medium hover:bg-accent/10 transition-colors text-center border-t border-border/40"
                  onMouseDown={submitSearch}
                  onMouseEnter={() => setActiveIdx(-1)}
                >
                  View all results for "{query}"
                </button>
              </>
            ) : (
              <div className="px-4 py-6 text-center space-y-1">
                <p className="text-sm text-muted-foreground">No results for "{query}"</p>
                <button className="text-xs text-accent hover:underline" onMouseDown={submitSearch}>
                  Search all products
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
