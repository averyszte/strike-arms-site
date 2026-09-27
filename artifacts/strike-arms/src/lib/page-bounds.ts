/** Rows per page in the admin tables that page on the server. */
export const ADMIN_PAGE_SIZE = 25;

export type PageBounds = {
  /** 1-based position of the first row on the page; 0 when there are none. */
  first: number;
  /** 1-based position of the last row on the page. */
  last: number;
  pageCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

/** Where a page sits in the whole result, for "26 to 50 of 73" and the buttons. */
export function pageBounds(page: number, pageSize: number, total: number): PageBounds {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : Math.min((page - 1) * pageSize + 1, total);
  const last = Math.min(page * pageSize, total);
  return {
    first,
    last,
    pageCount,
    hasPrevious: page > 1,
    hasNext: page < pageCount,
  };
}

/**
 * The page number from a query string. Anything but a positive whole number
 * means page 1: the address bar is typed by people, and "?page=-3" or
 * "?page=two" should land somewhere sensible rather than on an empty table.
 */
export function readPageParam(value: string | null): number {
  if (!value || !/^\d+$/.test(value)) return 1;
  return Math.max(1, Number(value));
}
