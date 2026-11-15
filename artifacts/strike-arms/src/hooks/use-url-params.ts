import { useCallback, useMemo } from 'react';
import { useLocation, useSearch } from 'wouter';

/**
 * The query string as the state of an admin list.
 *
 * Changes replace rather than push: nobody wants six back-presses to undo
 * flicking through filters. A value of 'all', '' or page 1 is the default and
 * is dropped from the URL rather than written.
 *
 * Writing anything but the page also drops the page: page 3 of one filter is
 * not page 3 of another, and landing past the end of a shorter list would show
 * an empty table that looks like there is nothing there.
 */
export function useUrlParams() {
  const search = useSearch();
  const [path, navigate] = useLocation();

  const params = useMemo(() => new URLSearchParams(search), [search]);

  /** Several keys in one navigation, so a second write cannot undo the first. */
  const setParams = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(search);
      const keys = Object.keys(updates);
      for (const key of keys) {
        const value = updates[key];
        if (value === 'all' || value === '' || (key === 'page' && value === '1')) next.delete(key);
        else next.set(key, value);
      }
      if (keys.some((key) => key !== 'page')) next.delete('page');

      const nextQuery = next.toString();
      navigate(nextQuery ? `${path}?${nextQuery}` : path, { replace: true });
    },
    [search, path, navigate],
  );

  const setParam = useCallback(
    (key: string, value: string) => setParams({ [key]: value }),
    [setParams],
  );

  return { params, setParam, setParams };
}
