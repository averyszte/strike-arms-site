import { useEffect, useState } from 'react';

/** Roughly the sticky header's height — sections start below it, not at y=0. */
const HEADER_OFFSET = '-120px';

/**
 * Tracks which of the given section ids the reader is currently in, so an
 * "on this page" nav can mark it.
 *
 * It watches a narrow band near the top of the viewport rather than whole-element
 * intersection: a section longer than the screen never cleanly enters or leaves,
 * and two short sections are on screen together, so plain visibility gives an
 * ambiguous answer. The band gives exactly one.
 *
 * Returns null before the observer has fired, and on the server.
 */
export function useActiveSection(ids: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  // Effects take a primitive, so a fresh array of the same ids does not re-run it.
  const key = ids.join('|');

  useEffect(() => {
    const sectionIds = key.split('|').filter(Boolean);
    if (sectionIds.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = sectionIds.find((id) => visible.has(id));
        if (first) {
          setActiveId(first);
          return;
        }
        // The band can also sit in the hero above the first section, or below
        // the last one. Keeping the previous answer there would mark a section
        // the reader has not reached, or has long since left.
        const firstTop = document.getElementById(sectionIds[0])?.getBoundingClientRect().top;
        setActiveId(firstTop !== undefined && firstTop > 0 ? null : sectionIds.at(-1) ?? null);
      },
      { rootMargin: `${HEADER_OFFSET} 0px -65% 0px` },
    );

    for (const id of sectionIds) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [key]);

  return activeId;
}
