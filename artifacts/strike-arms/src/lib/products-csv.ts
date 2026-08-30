import { buildCsv, csvFilename, money } from '@/lib/csv-write';
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
 * Stock is exported because it is the number you want to see when you open the
 * file, and ignored on import because stock moves through adjust_stock, which
 * records who changed it and why. A spreadsheet cannot say why.
 */

export const PRODUCT_CSV_COLUMNS = [
  'Slug',
  'Name',
  'Category',
  'Subcategory',
  'Brand',
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
  'Stock',
] as const;

/** Columns the importer reads. Stock is exported but never written back. */
export const IMPORT_IGNORED_COLUMNS = ['Stock'] as const;

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
    String(product.stockCount ?? 0),
  ];
}

export function buildProductsCsv(products: Product[]): string {
  return buildCsv([...PRODUCT_CSV_COLUMNS], products.map(productRow));
}

export function productsCsvFilename(today: Date): string {
  return csvFilename('products', today);
}
