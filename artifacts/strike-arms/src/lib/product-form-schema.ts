import { z } from 'zod';

import { PRODUCT_CONDITIONS } from '@/lib/product-condition';

// The admin product form's validation contract. Kept out of the field
// components so the sheet can build its resolver without importing UI.

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;
const SLUG_PATTERN = /^[a-z0-9-]+$/;
const MAX_DESCRIPTION = 20000;
const MAX_OPENING_STOCK = 100000;

function euros(value: string): number {
  return Number.parseFloat(value);
}

export const productFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Required'),
    slug: z.string().min(2, 'Required').regex(SLUG_PATTERN, 'Lowercase, numbers, hyphens only'),
    category: z.enum([
      'rifles', 'pistols', 'consumables', 'accessories', 'gear', 'more',
    ] as const),
    subcategory: z.string().trim().min(1, 'Required'),
    brand: z.string().trim().min(1, 'Required'),
    // Mirrors the check constraint on products.condition (migration 018). Not a
    // free text field: the badge, the filter and the schema.org itemCondition
    // all branch on it, so a third value would go quietly unhandled.
    condition: z.enum(PRODUCT_CONDITIONS),
    priceEuros: z
      .string()
      .regex(PRICE_PATTERN, 'Enter a valid price e.g. 99.99')
      .refine((value) => euros(value) > 0, 'Price must be more than 0'),
    salePriceEuros: z
      .string()
      .regex(PRICE_PATTERN, 'Enter a valid price')
      .or(z.literal('')),
    shortDescription: z.string().min(5, 'Min 5 chars').max(200, 'Max 200 chars'),
    description: z.string().max(MAX_DESCRIPTION, `Max ${MAX_DESCRIPTION} chars`),
    isPublished: z.boolean(),
    isNew: z.boolean(),
    isFeatured: z.boolean(),
    isShippable: z.boolean(),
    // Used on create only. An existing product's stock changes through Adjust
    // stock, never this form, so saving an edit cannot overwrite a sale that
    // happened while the sheet was open.
    openingStock: z.coerce
      .number()
      .int('Whole numbers only')
      .min(0, 'Must be 0 or more')
      .max(MAX_OPENING_STOCK, 'Too many to be right'),
    tags: z.string(),
    // Public URLs, in display order — the first is the card image. Written by
    // ProductImagesField after upload rather than typed, so there is no format
    // to validate beyond "the uploader produced it".
    images: z.array(z.string().url()),
  })
  // A sale price at or above the price shows as a "sale" that saves nothing.
  .superRefine((values, ctx) => {
    if (values.salePriceEuros === '') return;
    if (euros(values.salePriceEuros) >= euros(values.priceEuros)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['salePriceEuros'],
        message: 'Must be less than the price',
      });
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;
