import type { Product } from '@/types/product';

export function searchProducts(products: Product[], query: string, maxResults = 6): Product[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  const scored = products.map(p => {
    const name = p.name.toLowerCase();
    const brand = p.brand.toLowerCase();
    const tags = (p.tags ?? []).join(' ').toLowerCase();
    const desc = p.shortDescription.toLowerCase();

    let score = 0;
    if (name.startsWith(q)) score += 10;
    else if (name.includes(q)) score += 6;
    if (brand.includes(q)) score += 4;
    if (tags.includes(q)) score += 2;
    if (desc.includes(q)) score += 1;

    return { product: p, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.product);
}
