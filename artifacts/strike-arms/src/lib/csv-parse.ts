/**
 * Reading CSV that came back out of a spreadsheet.
 *
 * A split on commas is wrong the first time somebody types a comma in a
 * product description, and wrong again the first time they paste a blurb
 * containing a line break. This is a character scanner following RFC 4180:
 * quoted fields, "" for a literal quote inside one, and commas and newlines
 * carried inside quotes without ending anything.
 *
 * Three things it also does, all of them because the file has probably been
 * through Excel:
 *
 * - Strips a byte order mark, which would otherwise become part of the first
 *   header name and make "Slug" a column nobody can match.
 * - Accepts CRLF, LF and bare CR line endings in the same file.
 * - Undoes the apostrophe that csv-write.ts adds in front of a cell starting
 *   with =, +, - or @. Without this, exporting and reimporting a product
 *   collects one apostrophe per round trip. It is removed only when the next
 *   character is one of those four, so a name that genuinely starts with an
 *   apostrophe survives.
 */

const BOM = '\uFEFF';

/** The characters csv-write.ts guards against, and only these. */
const GUARDED_START = /^'[=+\-@\t\r]/;

function unguard(value: string): string {
  return GUARDED_START.test(value) ? value.slice(1) : value;
}

export function parseCsv(text: string): string[][] {
  const input = text.startsWith(BOM) ? text.slice(1) : text;

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (inQuotes) {
      if (char !== '"') {
        field += char;
        continue;
      }
      // A doubled quote inside a quoted field is one literal quote.
      if (input[i + 1] === '"') {
        field += '"';
        i += 1;
        continue;
      }
      inQuotes = false;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(unguard(field));
      field = '';
    } else if (char === '\n' || char === '\r') {
      // Swallow the LF of a CRLF pair so it does not open an empty record.
      if (char === '\r' && input[i + 1] === '\n') i += 1;
      row.push(unguard(field));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  // Whatever is left when the text runs out is the last field of the last row,
  // unless the file ended with a newline and there is nothing pending.
  if (field !== '' || row.length > 0) {
    row.push(unguard(field));
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ''));
}

export type CsvTable = {
  /** Header names exactly as typed, in file order. */
  header: string[];
  /**
   * One entry per data record. `line` is the row number a spreadsheet shows,
   * counting the header as row 1 -- accurate unless a field contains a line
   * break, which shifts everything after it.
   */
  records: { line: number; cells: string[] }[];
};

export function parseCsvTable(text: string): CsvTable {
  const rows = parseCsv(text);
  if (rows.length === 0) return { header: [], records: [] };

  const [header, ...rest] = rows;
  return {
    header: header.map((name) => name.trim()),
    records: rest.map((cells, index) => ({ line: index + 2, cells })),
  };
}
