/**
 * The polite live-region text for the header search: how many suggestions are
 * showing, so a screen-reader user knows the arrow keys have something to move
 * through. Empty while nothing is open, so nothing is announced.
 */
export function searchStatusText(state: {
  showPanel: boolean;
  isError: boolean;
  isPending: boolean;
  results: readonly unknown[];
}): string {
  if (!state.showPanel) return '';
  if (state.isError) return 'Search is not working right now.';
  if (state.isPending) return 'Searching.';
  const count = state.results.length;
  if (count === 0) return 'No suggestions.';
  return count === 1
    ? '1 suggestion. Use the up and down arrows to choose.'
    : `${count} suggestions. Use the up and down arrows to choose.`;
}
