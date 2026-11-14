import { useEffect, useRef, useState } from 'react';

/** Grace period so the pointer can cross from a nav button into its menu. */
const CLOSE_DELAY_MS = 120;

/** Which desktop mega menu is open, with a short delay before a hover-out closes it. */
export function useHoverMenu() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const openMenu = (name: string) => {
    cancelClose();
    setActiveMenu(name);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), CLOSE_DELAY_MS);
  };

  useEffect(() => {
    return () => { if (closeTimer.current) clearTimeout(closeTimer.current); };
  }, []);

  return { activeMenu, closeMenu: () => setActiveMenu(null), openMenu, scheduleClose, cancelClose };
}
