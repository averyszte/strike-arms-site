import type { Category } from '@/types/product';

export type Subcategory = {
  id: string;
  category: Category;
  slug: string;
  name: string;
  sortOrder: number;
};
