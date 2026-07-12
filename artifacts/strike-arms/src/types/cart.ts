export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  category: string;
  priceCents: number;
  salePriceCents?: number;
  quantity: number;
};
