import { z } from 'zod';

// The admin product form's validation contract. Kept out of the field
// components so the sheet can build its resolver without importing UI.

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;
const SLUG_PATTERN = /^[a-z0-9-]+$/;

export const productFormSchema = z.object({
  name: z.string().min(2, 'Required'),
  slug: z.string().min(2, 'Required').regex(SLUG_PATTERN, 'Lowercase, numbers, hyphens only'),
  category: z.enum([
    'rifles', 'pistols', 'consumables', 'accessories', 'gear', 'parts', 'more',
  ] as const),
  subcategory: z.string().min(1, 'Required'),
  brand: z.string().min(1, 'Required'),
  priceEuros: z.string().regex(PRICE_PATTERN, 'Enter a valid price e.g. 99.99'),
  salePriceEuros: z
    .string()
    .regex(PRICE_PATTERN, 'Enter a valid price')
    .or(z.literal('')),
  shortDescription: z.string().min(5, 'Min 5 chars').max(200, 'Max 200 chars'),
  description: z.string(),
  isPublished: z.boolean(),
  isNew: z.boolean(),
  isFeatured: z.boolean(),
  isShippable: z.boolean(),
  stockCount: z.coerce.number().int().min(0, 'Must be 0 or more'),
  tags: z.string(),
  // Public URLs, in display order — the first is the card image. Written by
  // ProductImagesField after upload rather than typed, so there is no format
  // to validate beyond "the uploader produced it".
  images: z.array(z.string().url()),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
