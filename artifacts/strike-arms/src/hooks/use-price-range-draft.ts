import { useCallback, useState } from 'react';
import {
  centsToEuroInput,
  centsToPosition,
  normalizePriceRange,
  parseEuroInput,
  positionToCents,
} from '@/lib/price-scale';

type PriceRange = { minPrice?: number; maxPrice?: number };

type Draft = {
  /** The committed values this draft started from. */
  source: string;
  positions: [number, number];
  minText: string;
  maxText: string;
};

function seedDraft(lowCents: number, highCents: number, ceilingCents: number): Draft {
  return {
    source: `${lowCents}|${highCents}|${ceilingCents}`,
    positions: [centsToPosition(lowCents, ceilingCents), centsToPosition(highCents, ceilingCents)],
    minText: centsToEuroInput(lowCents),
    maxText: centsToEuroInput(highCents),
  };
}

/**
 * The price control's in-progress state.
 *
 * Dragging and typing change a local draft; only letting go of a handle, or
 * leaving a box (or pressing Enter), writes to the URL. Writing on every
 * pixel of a drag would refetch the grid dozens of times a second and reset
 * the page with each one.
 */
export function usePriceRangeDraft(
  minPrice: number | undefined,
  maxPrice: number | undefined,
  ceilingCents: number,
  onCommit: (range: PriceRange) => void,
) {
  const low = Math.min(minPrice ?? 0, ceilingCents);
  const high = Math.min(maxPrice ?? ceilingCents, ceilingCents);
  const [draft, setDraft] = useState(() => seedDraft(low, high, ceilingCents));

  // Back to the URL's values whenever they change from outside: a chip
  // removed, "Clear all", another shelf with another ceiling. Reset during
  // render, as React recommends, rather than an effect that paints stale first.
  const fresh = seedDraft(low, high, ceilingCents);
  if (draft.source !== fresh.source) setDraft(fresh);

  const commit = useCallback(
    (lowCents: number | undefined, highCents: number | undefined) => {
      const next = normalizePriceRange(lowCents, highCents, ceilingCents);
      const shown = seedDraft(next.minPrice ?? 0, next.maxPrice ?? ceilingCents, ceilingCents);
      // Keep the committed source so the reset above leaves the tidied text alone.
      setDraft((prev) => ({ ...shown, source: prev.source }));
      if (next.minPrice !== minPrice || next.maxPrice !== maxPrice) onCommit(next);
    },
    [ceilingCents, minPrice, maxPrice, onCommit],
  );

  const onSlide = useCallback(
    ([a, b]: number[]) =>
      setDraft((prev) => ({
        ...prev,
        positions: [a, b],
        minText: centsToEuroInput(positionToCents(a, ceilingCents)),
        maxText: centsToEuroInput(positionToCents(b, ceilingCents)),
      })),
    [ceilingCents],
  );

  const onSlideCommit = useCallback(
    ([a, b]: number[]) =>
      commit(positionToCents(a, ceilingCents), positionToCents(b, ceilingCents)),
    [ceilingCents, commit],
  );

  const commitText = useCallback(
    () => commit(parseEuroInput(draft.minText), parseEuroInput(draft.maxText)),
    [commit, draft.minText, draft.maxText],
  );

  const setMinText = useCallback((minText: string) => setDraft((p) => ({ ...p, minText })), []);
  const setMaxText = useCallback((maxText: string) => setDraft((p) => ({ ...p, maxText })), []);

  return {
    positions: draft.positions,
    minText: draft.minText,
    maxText: draft.maxText,
    setMinText,
    setMaxText,
    onSlide,
    onSlideCommit,
    commitText,
  };
}
