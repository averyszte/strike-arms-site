import { parseCsvTable } from '@/lib/csv-parse';
import { parseSlugLike } from '@/lib/product-import-fields';
import {
  checkSalePrice,
  diffAgainst,
  FIELD_LABELS,
  mapHeader,
  parseFields,
  REQUIRED_FOR_CREATE,
  type ColumnKey,
  type ImportChange,
  type ParsedFields,
} from '@/lib/product-import-columns';
import type { Product } from '@/types/product';

/**
 * Works out what a CSV would do, without doing any of it.
 *
 * The plan is the whole point. An import that writes as it reads leaves the
 * catalogue half-changed when row 40 turns out to be nonsense, and nobody can
 * say which half. This reads the entire file, decides create / update /
 * unchanged / rejected for every row, and hands back something a person can
 * look at before agreeing to it.
 *
 * Rows are matched on slug. A slug that is not in the catalogue is a new
 * product -- so editing a slug in the spreadsheet does not rename anything, it
 * creates a second product beside the first. Creates are counted separately in
 * the preview so that mistake is visible before it happens.
 *
 * Only columns present in the file are touched. A file of just Slug and Price
 * changes prices and nothing else; an absent column never blanks a field. And
 * only fields that differ are written (M-028), so a column that matches does
 * not overwrite an edit made since the export.
 */

export type ImportCreate = {
  line: number;
  slug: string;
  name: string;
  fields: ParsedFields;
};

export type ImportUpdate = {
  line: number;
  slug: string;
  id: string;
  name: string;
  patch: ParsedFields;
  changes: ImportChange[];
  /** The version the preview saw. The write is refused if it has moved on. */
  loadedUpdatedAt?: string;
  /** Saved in the admin after this file was exported (M-028). */
  isStale: boolean;
};

export type ImportProblem = { line: number; slug: string; messages: string[] };

export type ImportPlan = {
  creates: ImportCreate[];
  updates: ImportUpdate[];
  unchanged: number;
  problems: ImportProblem[];
  /** Recognised and exported, but never written back. */
  ignoredColumns: string[];
  /** Not recognised at all. */
  unknownColumns: string[];
  /** Set when the file cannot be used at all. Nothing else is filled in. */
  fatal?: string;
};

/**
 * A function rather than a shared constant. Spreading one constant would hand
 * every plan the same creates/updates/problems arrays, so two imports in a row
 * would report each other's rows.
 */
function emptyPlan(): ImportPlan {
  return {
    creates: [],
    updates: [],
    unchanged: 0,
    problems: [],
    ignoredColumns: [],
    unknownColumns: [],
  };
}

function missingForCreate(fields: ParsedFields): string[] {
  return REQUIRED_FOR_CREATE.filter((key) => fields[key] === undefined).map(
    (key) => `${FIELD_LABELS[key]} is needed to create a new product`,
  );
}

function changedOnly(fields: ParsedFields, changes: ImportChange[]): ParsedFields {
  const changed = new Set(changes.map((change) => change.field));
  return Object.fromEntries(
    Object.entries(fields).filter(([field]) => changed.has(field)),
  ) as ParsedFields;
}

/** True when the product was saved after the row's Updated stamp. A blank stamp cannot tell. */
export function isNewerThanExport(current: string | undefined, exported: string | undefined): boolean {
  if (!current || !exported || exported.trim() === '') return false;
  const was = Date.parse(exported.trim());
  const now = Date.parse(current);
  return !Number.isNaN(was) && !Number.isNaN(now) && now > was;
}

/** Checks that need the whole row and the product it matches, not one cell. */
function rowProblems(fields: ParsedFields, product: Product | undefined): string[] {
  const problems: string[] = [];
  const saleProblem = checkSalePrice(fields, product);
  if (saleProblem) problems.push(saleProblem);
  // The database refuses an archived product that is published (026).
  if (product?.isArchived && fields.isPublished) {
    problems.push('This product is archived. Restore it in the products list before publishing it.');
  }
  if (!product) problems.push(...missingForCreate(fields));
  return problems;
}

export function planProductImport(csvText: string, existing: Product[]): ImportPlan {
  const table = parseCsvTable(csvText);
  if (table.header.length === 0) return { ...emptyPlan(), fatal: 'That file has no rows in it.' };

  const { positions, unknownColumns, ignoredColumns } = mapHeader(table.header);
  if (!positions.has('slug')) {
    return {
      ...emptyPlan(),
      unknownColumns,
      fatal:
        'The file needs a Slug column. Slug is how a row is matched to a product; without it there is no telling an edit from a new product.',
    };
  }
  if (table.records.length === 0) {
    return {
      ...emptyPlan(),
      ignoredColumns,
      unknownColumns,
      fatal: 'That file has a header and no rows.',
    };
  }

  const bySlug = new Map(existing.map((product) => [product.slug, product]));
  const plan: ImportPlan = { ...emptyPlan(), ignoredColumns, unknownColumns };
  const seen = new Set<string>();

  for (const record of table.records) {
    const read = (key: ColumnKey): string | undefined => {
      const index = positions.get(key);
      // A short row is a row whose trailing cells were left empty, not a row
      // missing those columns -- the header still says they are there.
      return index === undefined ? undefined : (record.cells[index] ?? '');
    };

    const slugResult = parseSlugLike('Slug', read('slug') ?? '');
    if (!slugResult.ok) {
      plan.problems.push({
        line: record.line,
        slug: (read('slug') ?? '').trim(),
        messages: [slugResult.message],
      });
      continue;
    }
    const slug = slugResult.value;

    if (seen.has(slug)) {
      plan.problems.push({
        line: record.line,
        slug,
        messages: ['This slug appears earlier in the file. Only the first row for a slug is used.'],
      });
      continue;
    }
    seen.add(slug);

    const product = bySlug.get(slug);
    const { fields, messages } = parseFields(read);

    messages.push(...rowProblems(fields, product));

    if (messages.length > 0) {
      plan.problems.push({ line: record.line, slug, messages });
      continue;
    }

    if (!product) {
      plan.creates.push({ line: record.line, slug, name: fields.name ?? slug, fields });
      continue;
    }

    const changes = diffAgainst(product, fields);
    if (changes.length === 0) {
      plan.unchanged += 1;
      continue;
    }

    plan.updates.push({
      line: record.line,
      slug,
      id: product.id,
      name: product.name,
      patch: changedOnly(fields, changes),
      changes,
      loadedUpdatedAt: product.updatedAt,
      isStale: isNewerThanExport(product.updatedAt, read('updatedAt')),
    });
  }

  return plan;
}

/** Nothing to do — used to keep the confirm button honest. */
export function planIsEmpty(plan: ImportPlan): boolean {
  return plan.creates.length === 0 && plan.updates.length === 0;
}
