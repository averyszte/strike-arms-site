/**
 * Applying an import plan that a person has already looked at and agreed to.
 *
 * The plan is built in lib/product-import.ts and every row in it has already
 * been validated, so anything that fails here failed in the database: a slug
 * that was created by somebody else between the preview and the confirm, or a
 * policy that refused the write. Those are reported per row rather than thrown,
 * because an import of two hundred rows should not be undone by one of them --
 * and the admin needs to know which one.
 *
 * There is no transaction. PostgREST has no way to open one from the browser,
 * so a partial import is possible and the result says exactly how far it got.
 * Re-running the same file afterwards is safe: rows that already match come
 * back as unchanged.
 */

import { supabase } from '@/lib/supabase';
import type { ImportCreate, ImportPlan, ImportUpdate } from '@/lib/product-import';
import type { ParsedFields } from '@/lib/product-import-columns';
import type { ImportOutcome } from '@/types/product-import';
import { updateProduct } from '@/data/admin-products-repository';

/** Insert batch size. Keeps one request from carrying a whole catalogue. */
const INSERT_CHUNK = 50;

type InsertRow = {
  slug: string;
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  price_cents: number;
  sale_price_cents: number | null;
  images: string[];
  short_description: string;
  description: string;
  is_published: boolean;
  stock_count: number;
  is_new: boolean;
  is_featured: boolean;
  is_shippable: boolean;
  tags: string[];
};

/**
 * The validator guarantees these fields are present; the type system does not
 * know that, so the check is repeated here rather than asserted away. A create
 * that somehow arrives incomplete becomes a named failure instead of a row of
 * nulls in the catalogue.
 */
function toInsertRow(slug: string, fields: ParsedFields): InsertRow | null {
  const { name, category, subcategory, brand, price, shortDescription } = fields;
  if (!name || !category || !subcategory || !brand || price === undefined || !shortDescription) {
    return null;
  }
  return {
    slug,
    name,
    category,
    subcategory,
    brand,
    price_cents: price,
    sale_price_cents: fields.salePrice ?? null,
    images: fields.images ?? [],
    short_description: shortDescription,
    description: fields.description ?? '',
    // New products start unpublished and empty unless the file says otherwise.
    // Stock is never set from a spreadsheet: it moves through adjust_stock, so
    // the inventory ledger can say who changed it and why.
    is_published: fields.isPublished ?? false,
    stock_count: 0,
    is_new: fields.isNew ?? false,
    is_featured: fields.isFeatured ?? false,
    is_shippable: fields.isShippable ?? false,
    tags: fields.tags ?? [],
  };
}

async function insertBatch(rows: InsertRow[]): Promise<string | null> {
  const { error } = await supabase.from('products').insert(rows);
  return error ? error.message : null;
}

/**
 * Inserts in batches for speed, then falls back to one row at a time for any
 * batch that failed -- so a single bad row is named rather than taking the
 * other forty-nine down with it silently.
 */
async function runCreates(creates: ImportCreate[], outcome: ImportOutcome): Promise<void> {
  const prepared: { slug: string; row: InsertRow }[] = [];
  for (const create of creates) {
    const row = toInsertRow(create.slug, create.fields);
    if (row) prepared.push({ slug: create.slug, row });
    else outcome.failures.push({ slug: create.slug, message: 'Row was missing a required field.' });
  }

  for (let i = 0; i < prepared.length; i += INSERT_CHUNK) {
    const batch = prepared.slice(i, i + INSERT_CHUNK);
    const batchError = await insertBatch(batch.map((entry) => entry.row));
    if (!batchError) {
      outcome.created += batch.length;
      continue;
    }
    for (const entry of batch) {
      const rowError = await insertBatch([entry.row]);
      if (rowError) outcome.failures.push({ slug: entry.slug, message: rowError });
      else outcome.created += 1;
    }
  }
}

async function runUpdates(updates: ImportUpdate[], outcome: ImportOutcome): Promise<void> {
  for (const update of updates) {
    try {
      await updateProduct(update.id, update.patch);
      outcome.updated += 1;
    } catch (error) {
      outcome.failures.push({
        slug: update.slug,
        message: error instanceof Error ? error.message : 'The update was refused.',
      });
    }
  }
}

export async function applyProductImport(plan: ImportPlan): Promise<ImportOutcome> {
  const outcome: ImportOutcome = { created: 0, updated: 0, failures: [] };
  await runCreates(plan.creates, outcome);
  await runUpdates(plan.updates, outcome);
  return outcome;
}
