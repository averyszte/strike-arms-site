import { useCallback, useId, useRef, useState, type KeyboardEvent } from 'react';

import { useDelayedFocus } from '@/hooks/use-delayed-focus';
import { useOutsideMousedown } from '@/hooks/use-outside-mousedown';
import { useSearchBoxFocus } from '@/hooks/use-search-box-focus';
import { useSearchNavigation } from '@/hooks/use-search-navigation';
import { useSearchProducts } from '@/hooks/use-search-products';

/** Short wait before focusing the full-width (mobile) search box once it mounts. */
const FULL_WIDTH_FOCUS_DELAY_MS = 50;

/**
 * State and handlers for the header search box: the query, whether the panel
 * is open, the keyboard-highlighted row, and where Enter or a click goes.
 * The ids follow the ARIA combobox pattern (the input points at the listbox
 * and at the highlighted option).
 */
export function useSearchDropdown(shouldAutoFocus: boolean, onClose?: () => void) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const optionId = (index: number) => `${listId}-option-${index}`;

  const { results, isError, isPending } = useSearchProducts(query);
  const showPanel = open && query.length >= 2;

  useDelayedFocus(inputRef, shouldAutoFocus, FULL_WIDTH_FOCUS_DELAY_MS);

  const dismiss = useCallback(() => {
    setOpen(false);
    setIsFocused(false);
    setActiveIdx(-1);
  }, []);
  useOutsideMousedown(containerRef, showPanel, dismiss);

  const { handleFocus, handleBlur } = useSearchBoxFocus(
    containerRef,
    () => {
      setIsFocused(true);
      setOpen(true);
    },
    dismiss,
  );

  const closeAndClear = useCallback(() => {
    setOpen(false);
    setIsFocused(false);
    setQuery('');
    setActiveIdx(-1);
    onClose?.();
  }, [onClose]);

  const { goToProduct, submitSearch, browseAll } = useSearchNavigation(query, closeAndClear);

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

  const clearQuery = () => {
    setQuery('');
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  return {
    query, isFocused, activeIdx, setActiveIdx, inputRef, containerRef, listId, optionId,
    results, isError, isPending, showPanel,
    goToProduct, submitSearch, browseAll,
    handleKeyDown, handleChange, handleFocus, handleBlur, clearQuery,
  };
}
