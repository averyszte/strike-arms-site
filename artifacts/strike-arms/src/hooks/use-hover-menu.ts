import { useCallback, useEffect, useRef, useState } from 'react';

/** Grace period so the pointer can cross from a nav button into its menu. */
const CLOSE_DELAY_MS = 120;

type OpenedBy = 'hover' | 'click';

/**
 * Which desktop mega menu is open. A click, Enter or Space toggles a menu (so
 * keyboard and touch users can open it); hover still opens it as an extra,
 * with a short delay before a hover-out closes it. Escape closes the open menu
 * and returns focus to its button.
 */
export function useHoverMenu() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const openedBy = useRef<OpenedBy>('hover');
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const closeMenu = useCallback(() => {
    cancelClose();
    setActiveMenu(null);
  }, [cancelClose]);

  const openMenu = (name: string) => {
    cancelClose();
    if (activeMenu !== name) openedBy.current = 'hover';
    setActiveMenu(name);
  };

  // A hover-opened menu stays open on the click that follows the hover (a
  // touch laptop fires both); only a second click closes it.
  const toggleMenu = (name: string) => {
    cancelClose();
    if (activeMenu === name && openedBy.current === 'click') {
      setActiveMenu(null);
      return;
    }
    openedBy.current = 'click';
    setActiveMenu(name);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setActiveMenu(null), CLOSE_DELAY_MS);
  };

  const registerTrigger = (name: string) => (el: HTMLButtonElement | null) => {
    if (el) triggerRefs.current.set(name, el);
    else triggerRefs.current.delete(name);
  };

  useEffect(() => {
    if (!activeMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      triggerRefs.current.get(activeMenu)?.focus();
      closeMenu();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [activeMenu, closeMenu]);

  useEffect(() => cancelClose, [cancelClose]);

  return { activeMenu, closeMenu, openMenu, toggleMenu, scheduleClose, cancelClose, registerTrigger };
}
