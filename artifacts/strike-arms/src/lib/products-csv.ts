import { buildCsv, csvFilename, money } from '@/lib/csv-write';
import { CONDITION_LABELS } from '@/lib/product-condition';
import type { Product } from '@/types/product';

/**
 * The catalogue as a spreadsheet, and the column names the importer answers to.
 *
 * Export and import share this list on purpose: the file you download is
 * exactly the file you can edit and upload again. Any other arrangement means
 * discovering at import time that the export used a name the importer has
 * never heard of.
 *
 * Slug is the identity column. It is what an imported row is matched on, so
 * changing a slug in the spreadsheet does not rename a product -- it creates a
 * second one. The importer says so in the preview.
 *
 * In stock is a Yes/No like Published: there are no counts to export.
 */

export const PRODUCT_CSV_COLUMNS = [
  'Slug',
  'Name',
  'Category',
  'Subcategory',
  'Brand',
  'Condition',
  'Price',
  'Sale price',
  'Short description',
  'Description',
  'Images',
  'Tags',
  'Published',
  'Featured',
  'New',
  'Can be posted',
  'In stock',
] as const;

/** Columns exported but never written back. None since stock became Yes/No (038). */
export const IMPORT_IGNORED_COLUMNS: readonly string[] = [];

/** Multi-value cells use a semicolon, so a comma in a tag cannot split it. */
export const LIST_SEPARATOR = ';';

function yesNo(value: boolean | undefined): string {
  return value ? 'Yes' : 'No';
}

function productRow(product: Product): string[] {
  return [
    product.slug,
    product.name,
    product.category,
    product.subcategory,
    product.brand,
    // The label rather than the stored value, to read like the Yes/No columns
    // beside it. The importer lower-cases before matching, so it round-trips.
    CONDITION_LABELS[product.condition],
    money(product.price),
    product.salePrice != null ? money(product.salePrice) : '',
    product.shortDescription,
    product.description ?? '',
    product.images.join(LIST_SEPARATOR),
    (product.tags ?? []).join(LIST_SEPARATOR),
    yesNo(product.isPublished),
    yesNo(product.isFeatured),
    yesNo(product.isNew),
    yesNo(product.isShippable),
    yesNo(product.inStock),
  ];
}

export function buildProductsCsv(products: Product[]): string {
  return buildCsv([...PRODUCT_CSV_COLUMNS], products.map(productRow));
}

export function productsCsvFilename(today: Date): string {
  return csvFilename('products', today);
}
