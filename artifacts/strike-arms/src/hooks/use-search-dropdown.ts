import { useCallback, useRef, useState, type KeyboardEvent } from 'react';
import { useLocation } from 'wouter';

import { useDelayedFocus } from '@/hooks/use-delayed-focus';
import { useOutsideMousedown } from '@/hooks/use-outside-mousedown';
import { useSearchProducts } from '@/hooks/use-search-products';
import type { Product } from '@/types/product';

/** Short wait before focusing the full-width (mobile) search box once it mounts. */
const FULL_WIDTH_FOCUS_DELAY_MS = 50;
/** Lets a mousedown on a result land before blur closes the panel. */
const BLUR_CLOSE_DELAY_MS = 150;

/**
 * State and handlers for the header search box: the query, whether the panel
 * is open, the keyboard-highlighted row, and where Enter or a click goes.
 */
export function useSearchDropdown(fullWidth: boolean, onClose?: () => void) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const { results, isError, isPending } = useSearchProducts(query);
  const showPanel = open && query.length >= 2;

  useDelayedFocus(inputRef, fullWidth, FULL_WIDTH_FOCUS_DELAY_MS);

  const dismiss = useCallback(() => {
    setOpen(false);
    setIsFocused(false);
    setActiveIdx(-1);
  }, []);
  useOutsideMousedown(containerRef, showPanel, dismiss);

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

  const browseAll = useCallback(() => {
    navigate('/store');
    closeAndClear();
  }, [navigate, closeAndClear]);

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

  const handleChange = (value: string) => {
    setQuery(value);
    setOpen(true);
    setActiveIdx(-1);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpen(true);
  };

  const handleBlur = () => setTimeout(dismiss, BLUR_CLOSE_DELAY_MS);

  const clearQuery = () => {
    setQuery('');
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  return {
    query, isFocused, activeIdx, setActiveIdx, inputRef, containerRef,
    results, isError, isPending, showPanel,
    goToProduct, submitSearch, browseAll,
    handleKeyDown, handleChange, handleFocus, handleBlur, clearQuery,
  };
}
