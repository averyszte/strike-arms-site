import { getBrandName, isListedBrand } from '@/lib/brands';
import { effectivePriceCents } from '@/lib/effective-price';
import { formatPrice } from '@/lib/format-price';
import { SHIPPING_LINE_COLLECT, SHIPPING_LINE_POSTABLE_NOW } from '@/lib/site-config';
import { getCategory, getSubcategory } from '@/lib/taxonomy';
import type { BreadcrumbEntry } from '@/lib/structured-data';
import type { Product } from '@/types/product';

/**
 * Title, meta description and schema breadcrumbs for a product page (N-006,
 * N-014, N-015). Pure, so ProductDetail only has to call them.
 *
 * Everything here is read from the product row and site-config. Nothing is
 * invented: no "free delivery", no stock claims beyond in_stock, and the
 * fulfilment line follows IS_DELIVERY_ENABLED through SHIPPING_LINE_POSTABLE_NOW,
 * so while delivery is paused a postable item says collect in store, as the
 * product page and checkout do.
 */

/** Google shows about 155 characters of a description and 60 of a title. */
export const META_DESCRIPTION_MAX = 155;
export const TITLE_MAX = 60;

const LONG_SUFFIX = ' | Strike Arms Airsoft Dublin';
const SHORT_SUFFIX = ' | Strike Arms';

/** The long suffix when it fits in TITLE_MAX, the short one when it does not. */
export function buildProductTitle(name: string): string {
  const long = `${name}${LONG_SUFFIX}`;
  return long.length <= TITLE_MAX ? long : `${name}${SHORT_SUFFIX}`;
}

/** Cut at a word boundary so the text is at most `max` characters. */
function clampWords(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max + 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : text.slice(0, max)).replace(/[\s,;:.-]+$/, '');
}

/** The first sentence of a longer text, or the whole text if it has no full stop. */
function firstSentence(text: string): string {
  const match = text.match(/^(.+?[.!?])(\s|$)/s);
  return (match ? match[1] : text).replace(/\s+/g, ' ').trim();
}

/** The product's own words: the short description, else the long one's opening. */
function baseCopy(product: Product): string {
  const short = product.shortDescription.replace(/\s+/g, ' ').trim();
  if (short) return short;
  return product.description ? firstSentence(product.description) : product.name;
}

function fulfilmentLine(product: Product): string {
  if (!product.inStock) return 'Currently out of stock';
  return product.isShippable ? SHIPPING_LINE_POSTABLE_NOW : SHIPPING_LINE_COLLECT;
}

/**
 * "<brand> <copy>. €189.00. Collect in store in Swords, Co. Dublin."
 *
 * The brand is added only when it is a real maker and the copy does not
 * already name it. The copy is shortened, never the price or fulfilment line,
 * so the whole description fits in META_DESCRIPTION_MAX.
 */
export function buildProductMetaDescription(product: Product): string {
  let copy = baseCopy(product).replace(/[.\s]+$/, '');
  if (isListedBrand(product.brand)) {
    const brand = getBrandName(product.brand);
    if (!copy.toLowerCase().includes(brand.toLowerCase())) copy = `${brand} ${copy}`;
  }
  const price = formatPrice(effectivePriceCents(product.price, product.salePrice));
  const tail = `. ${price}. ${fulfilmentLine(product)}.`;
  return `${clampWords(copy, META_DESCRIPTION_MAX - tail.length)}${tail}`;
}

/**
 * Breadcrumbs for the Product page's BreadcrumbList schema.
 *
 * A subcategory without its own SEO copy canonicalises to its parent category
 * (shop-page-meta.ts), so listing its URL in the schema sends Google a page
 * that says it is not the real one. That level is left out of the schema; the
 * visible breadcrumb on the page can keep it.
 */
export function buildProductSchemaCrumbs(product: Product): BreadcrumbEntry[] {
  const category = getCategory(product.category);
  const subcategory = getSubcategory(product.category, product.subcategory);
  const crumbs: BreadcrumbEntry[] = [{ name: 'Home', path: '/' }];
  if (category) {
    crumbs.push({ name: category.shortLabel, path: `/store/${category.slug}` });
    if (subcategory?.seo) {
      crumbs.push({ name: subcategory.label, path: `/store/${category.slug}/${subcategory.slug}` });
    }
  }
  crumbs.push({ name: product.name, path: `/products/${product.slug}` });
  return crumbs;
}
