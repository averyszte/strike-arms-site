/**
 * What an import did, once it has been applied.
 *
 * This lives in types/ rather than beside the repository because the preview
 * dialog reports it, and a component may not reach into data/.
 */

/** A row the database refused, named so it can be found in the spreadsheet. */
export type ImportFailure = { slug: string; message: string };

export type ImportOutcome = {
  created: number;
  updated: number;
  failures: ImportFailure[];
};
