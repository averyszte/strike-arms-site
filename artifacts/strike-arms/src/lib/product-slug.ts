/**
 * Turns a product name into a web address (N-077): lower case, words joined
 * by hyphens, anything else dropped. "G&G CM16 Carbine" -> "gg-cm16-carbine".
 * The result matches the form's slug pattern (a-z, 0-9 and hyphens).
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
