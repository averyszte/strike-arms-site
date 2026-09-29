/**
 * Escapes text for an email body. Null and undefined become "".
 *
 * Null-safe from the start: in All Blooms a null field (a pickup order has no
 * address) made this throw, and every order email died silently in the
 * worker's retries (All Blooms 00d82e6).
 */
export function escapeHtml(text: string | number | null | undefined): string {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
