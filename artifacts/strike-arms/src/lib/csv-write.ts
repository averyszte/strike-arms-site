/**
 * Writing CSV that a spreadsheet opens without swearing.
 *
 * Four things this gets right that a naive join on commas does not:
 *
 * 1. Formula injection. A cell beginning =, +, - or @ is executed as a formula
 *    by Excel, LibreOffice and Sheets. Customer names, addresses, notes and
 *    product blurbs are typed by people, so every field is neutralised with a
 *    leading apostrophe. Quoting is not enough — the quotes are stripped
 *    before the cell is parsed.
 * 2. A byte order mark. Without it Excel reads the file as the local codepage
 *    and every fada in an Irish name turns to mojibake.
 * 3. CRLF line endings, which is what RFC 4180 says and what Excel expects.
 * 4. Money as a bare decimal. A euro sign or a thousands separator makes the
 *    column text, and a column of text does not sum.
 *
 * The apostrophe this adds is stripped again by the reader in csv-parse.ts, so
 * a file can go export -> edit -> import without collecting one per trip.
 */

const BOM = '\uFEFF';
const ROW_SEPARATOR = '\r\n';

/** Leading characters a spreadsheet treats as the start of a formula. */
const FORMULA_START = /^[=+\-@\t\r]/;

export function escapeCell(value: string): string {
  const safe = FORMULA_START.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** An amount a spreadsheet will add up: cents to a plain two-decimal number. */
export function money(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function buildCsv(columns: string[], rows: string[][]): string {
  return (
    BOM +
    [columns, ...rows].map((row) => row.map(escapeCell).join(',')).join(ROW_SEPARATOR) +
    ROW_SEPARATOR
  );
}

/** e.g. "strike-arms-orders-2026-08-30.csv". */
export function csvFilename(what: string, today: Date): string {
  return `strike-arms-${what}-${today.toISOString().slice(0, 10)}.csv`;
}
