/**
 * True for a path inside this app. wouter's Link only handles those: given a
 * `tel:` or `mailto:` href it pushes it into history and nothing happens, so
 * anything else has to be a plain anchor.
 */
export function isAppRoute(href: string): boolean {
  return href.startsWith('/');
}
