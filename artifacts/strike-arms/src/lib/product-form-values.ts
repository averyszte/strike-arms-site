import { formatCentsPlain } from '@/lib/format-price';
import { parseEuroCents } from '@/lib/parse-euro-cents';
import type { ProductFormValues } from '@/lib/product-form-schema';
import type { Category, NewProduct, Product, ProductPatch } from '@/types/product';

/** Moving between a product row and the product form's string fields. */

export function toFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    slug: product.slug,
    category: product.category,
    subcategory: product.subcategory,
    brand: product.brand,
    condition: product.condition,
    priceEuros: formatCentsPlain(product.price),
    salePriceEuros: product.salePrice != null ? formatCentsPlain(product.salePrice) : '',
    shortDescription: product.shortDescription,
    description: product.description ?? '',
    isPublished: product.isPublished ?? false,
    isNew: product.isNew ?? false,
    isFeatured: product.isFeatured ?? false,
    isShippable: product.isShippable,
    inStock: product.inStock,
    tags: (product.tags ?? []).join(', '),
    images: product.images,
  };
}

export const DEFAULT_PRODUCT_FORM_VALUES: ProductFormValues = {
  name: '',
  slug: '',
  category: 'rifles',
  subcategory: '',
  brand: '',
  // New stock is the ordinary case; secondhand is the one you have to choose.
  condition: 'new',
  priceEuros: '',
  salePriceEuros: '',
  shortDescription: '',
  description: '',
  isPublished: false,
  isNew: false,
  isFeatured: false,
  isShippable: false,
  inStock: true,
  tags: '',
  images: [],
};

export function toProductInput(values: ProductFormValues): NewProduct {
  return {
    name: values.name,
    slug: values.slug,
    category: values.category as Category,
    subcategory: values.subcategory,
    brand: values.brand,
    condition: values.condition,
    // The schema has already held both fields to the euro-amount pattern, so
    // the null branches are unreachable; NaN keeps the old parseFloat result.
    price: parseEuroCents(values.priceEuros) ?? Number.NaN,
    salePrice: parseEuroCents(values.salePriceEuros) ?? undefined,
    shortDescription: values.shortDescription,
    description: values.description,
    isPublished: values.isPublished,
    isNew: values.isNew,
    isFeatured: values.isFeatured,
    isShippable: values.isShippable,
    inStock: values.inStock,
    tags: values.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean),
    images: values.images,
  };
}

/** The form field each product field is edited through. */
const FORM_FIELD: Record<keyof NewProduct, keyof ProductFormValues | null> = {
  name: 'name',
  slug: 'slug',
  category: 'category',
  subcategory: 'subcategory',
  brand: 'brand',
  condition: 'condition',
  price: 'priceEuros',
  salePrice: 'salePriceEuros',
  shortDescription: 'shortDescription',
  description: 'description',
  isPublished: 'isPublished',
  isNew: 'isNew',
  isFeatured: 'isFeatured',
  isShippable: 'isShippable',
  inStock: 'inStock',
  tags: 'tags',
  images: 'images',
  isArchived: null,
  updatedAt: null,
};

/**
 * Only the fields this admin actually touched (M-032). Saving the whole form
 * would put back whatever an import or a second tab changed meanwhile.
 * An emptied sale price stays in the patch as undefined, which clears it.
 */
export function dirtyProductPatch(
  input: NewProduct,
  dirty: Partial<Record<keyof ProductFormValues, unknown>>,
): ProductPatch {
  const patch: Record<string, unknown> = {};
  for (const key of Object.keys(FORM_FIELD) as (keyof NewProduct)[]) {
    const field = FORM_FIELD[key];
    if (field && dirty[field]) patch[key] = input[key];
  }
  return patch as ProductPatch;
}
