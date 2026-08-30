import {
  parseBoolean,
  parseCategory,
  parseEuros,
  parseList,
  parseOptionalEuros,
  parseRequiredText,
  parseSlugLike,
  type ParseResult,
} from '@/lib/product-import-fields';
import { IMPORT_IGNORED_COLUMNS } from '@/lib/products-csv';
import type { Product } from '@/types/product';

/**
 * Which spreadsheet column is which product field, and what a row of them
 * amounts to.
 *
 * Header names are matched case-insensitively against the same list the export
 * writes, so the file you download is the file you can edit and upload again.
 * A column that is not recognised is reported, not guessed at.
 */

export type ColumnKey =
  | 'slug'
  | 'name'
  | 'category'
  | 'subcategory'
  | 'brand'
  | 'price'
  | 'salePrice'
  | 'shortDescription'
  | 'description'
  | 'images'
  | 'tags'
  | 'isPublished'
  | 'isFeatured'
  | 'isNew'
  | 'isShippable'
  | 'stock';

const COLUMN_KEYS: Record<string, ColumnKey> = {
  slug: 'slug',
  name: 'name',
  category: 'category',
  subcategory: 'subcategory',
  brand: 'brand',
  price: 'price',
  'sale price': 'salePrice',
  'short description': 'shortDescription',
  description: 'description',
  images: 'images',
  tags: 'tags',
  published: 'isPublished',
  featured: 'isFeatured',
  new: 'isNew',
  'can be posted': 'isShippable',
  stock: 'stock',
};

/** Everything a row can set. Absent keys are columns the file did not carry. */
export type ParsedFields = Partial<
  Pick<
    Product,
    | 'name'
    | 'category'
    | 'subcategory'
    | 'brand'
    | 'price'
    | 'shortDescription'
    | 'description'
    | 'images'
    | 'tags'
    | 'isPublished'
    | 'isFeatured'
    | 'isNew'
    | 'isShippable'
  >
> & { salePrice?: number | null };

/** Columns a new product cannot do without. */
export const REQUIRED_FOR_CREATE: (keyof ParsedFields)[] = [
  'name',
  'category',
  'subcategory',
  'brand',
  'price',
  'shortDescription',
];

export const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  category: 'Category',
  subcategory: 'Subcategory',
  brand: 'Brand',
  price: 'Price',
  salePrice: 'Sale price',
  shortDescription: 'Short description',
  description: 'Description',
  images: 'Images',
  tags: 'Tags',
  isPublished: 'Published',
  isFeatured: 'Featured',
  isNew: 'New',
  isShippable: 'Can be posted',
};

export type HeaderMap = {
  positions: Map<ColumnKey, number>;
  unknownColumns: string[];
  ignoredColumns: string[];
};

export function mapHeader(header: string[]): HeaderMap {
  const positions = new Map<ColumnKey, number>();
  const unknownColumns: string[] = [];
  const ignoredColumns: string[] = [];

  header.forEach((name, index) => {
    const trimmed = name.trim();
    const key = COLUMN_KEYS[trimmed.toLowerCase()];
    if (!key) {
      if (trimmed !== '') unknownColumns.push(trimmed);
      return;
    }
    if ((IMPORT_IGNORED_COLUMNS as readonly string[]).includes(trimmed)) {
      ignoredColumns.push(trimmed);
    }
    positions.set(key, index);
  });

  return { positions, unknownColumns, ignoredColumns };
}

export type CellReader = (key: ColumnKey) => string | undefined;

/** A pass-through for cells that cannot fail: free text and lists. */
function asIs<T>(value: T): ParseResult<T> {
  return { ok: true, value };
}

export function parseFields(read: CellReader): { fields: ParsedFields; messages: string[] } {
  const fields: ParsedFields = {};
  const messages: string[] = [];

  function when<T>(key: ColumnKey, parse: (raw: string) => ParseResult<T>, assign: (v: T) => void) {
    const cell = read(key);
    if (cell === undefined) return;
    const result = parse(cell);
    if (result.ok) assign(result.value);
    else messages.push(result.message);
  }

  when('name', (r) => parseRequiredText('Name', r), (v) => void (fields.name = v));
  when('category', parseCategory, (v) => void (fields.category = v));
  when('subcategory', (r) => parseSlugLike('Subcategory', r), (v) => void (fields.subcategory = v));
  when('brand', (r) => parseSlugLike('Brand', r), (v) => void (fields.brand = v));
  when('price', (r) => parseEuros('Price', r), (v) => void (fields.price = v));
  when('salePrice', (r) => parseOptionalEuros('Sale price', r), (v) => void (fields.salePrice = v));
  when(
    'shortDescription',
    (r) => parseRequiredText('Short description', r),
    (v) => void (fields.shortDescription = v),
  );
  when('description', (r) => asIs(r.trim()), (v) => void (fields.description = v));
  when('images', (r) => asIs(parseList(r)), (v) => void (fields.images = v));
  when('tags', (r) => asIs(parseList(r)), (v) => void (fields.tags = v));
  when('isPublished', (r) => parseBoolean('Published', r), (v) => void (fields.isPublished = v));
  when('isFeatured', (r) => parseBoolean('Featured', r), (v) => void (fields.isFeatured = v));
  when('isNew', (r) => parseBoolean('New', r), (v) => void (fields.isNew = v));
  when(
    'isShippable',
    (r) => parseBoolean('Can be posted', r),
    (v) => void (fields.isShippable = v),
  );

  return { fields, messages };
}

/**
 * A sale price at or above the list price shows the shop a "discount" that
 * crosses out a smaller number. Checked against whichever price the row ends
 * up with -- the one in the file, or the one already on the product.
 */
export function checkSalePrice(fields: ParsedFields, existing: Product | undefined): string | null {
  const sale = fields.salePrice;
  if (sale == null) return null;
  const price = fields.price ?? existing?.price;
  if (price === undefined) return null;
  if (sale < price) return null;
  return `Sale price (${(sale / 100).toFixed(2)}) must be below the price (${(price / 100).toFixed(2)})`;
}

export type ImportChange = { field: string; label: string; from: string; to: string };

const MONEY_FIELDS = new Set(['price', 'salePrice']);

function display(field: string, value: unknown): string {
  if (value === null || value === undefined) return '';
  if (MONEY_FIELDS.has(field) && typeof value === 'number') return (value / 100).toFixed(2);
  if (Array.isArray(value)) return value.join('; ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

/** Only the fields the file actually carried, and only where they differ. */
export function diffAgainst(existing: Product, fields: ParsedFields): ImportChange[] {
  const changes: ImportChange[] = [];
  for (const [field, next] of Object.entries(fields)) {
    const from = display(field, existing[field as keyof Product]);
    const to = display(field, next);
    if (from !== to) changes.push({ field, label: FIELD_LABELS[field] ?? field, from, to });
  }
  return changes;
}
