/**
 * Euro text to integer cents (W-03), the inverse of formatCentsPlain().
 *
 * Math.round rather than truncation: 6.50 is 649.9999... in binary, and
 * truncating would lose a cent on every such amount.
 */

/** A euro amount as typed: whole euro, or euro and one or two decimals. */
export const EURO_AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

/** True when the text is a well-formed euro amount (after trimming). */
export function isEuroAmount(text: string): boolean {
  return EURO_AMOUNT_PATTERN.test(text.trim());
}

/** "24.99" -> 2499. Returns null for anything that is not a euro amount. */
export function parseEuroCents(text: string): number | null {
  const value = text.trim();
  if (!EURO_AMOUNT_PATTERN.test(value)) return null;
  return Math.round(Number(value) * 100);
}
