import type { MegaColumn, NavItem } from '@/types/navigation';

/**
 * Menus without dead ends: a shop link whose shelf has nothing published is
 * dropped, then any column or group it leaves empty, then any top-level shop
 * section with nothing in it. Links outside /store (guides, services, /sale)
 * are not shelves and always stay. Unknown counts (still loading) keep
 * everything, so the menu never flickers from empty to full.
 */

type NavLink = { label: string; href: string };
type ShelfCounts = Record<string, number>;

/** `/store/rifles/aeg-rifles` as `rifles/aeg-rifles`; undefined off the shop. */
function shelfKey(href: string): string | undefined {
  const match = /^\/store\/([^/?#]+)(?:\/([^/?#]+))?/.exec(href);
  if (!match) return undefined;
  return match[2] ? `${match[1]}/${match[2]}` : match[1];
}

function hasProducts(href: string, counts: ShelfCounts): boolean {
  const key = shelfKey(href);
  return key === undefined || (counts[key] ?? 0) > 0;
}

export function pruneLinks<T extends NavLink>(links: T[], counts?: ShelfCounts): T[] {
  return counts ? links.filter((link) => hasProducts(link.href, counts)) : links;
}

/** Accordion groups (or mega columns) with their empty shelves taken out. */
export function pruneLinkGroups<T extends { links: NavLink[] }>(
  groups: T[],
  counts?: ShelfCounts,
): T[] {
  if (!counts) return groups;
  return groups
    .map((group) => ({ ...group, links: pruneLinks(group.links, counts) }))
    .filter((group) => group.links.length > 0);
}

export function pruneNavItems(items: NavItem[], counts?: ShelfCounts): NavItem[] {
  if (!counts) return items;
  return items
    .filter((item) => hasProducts(item.href, counts))
    .map((item) => ({
      ...item,
      mega: item.mega ? pruneLinkGroups<MegaColumn>(item.mega, counts) : undefined,
    }));
}
