// Shapes for the "shop by play style" showcase on the homepage.

export type Hotspot = { label: string; x: number; y: number };

/**
 * A product featured in a play style. Name and price are read live from the
 * catalogue by slug, so only the slug and our own one-line pitch live here.
 */
export type LoadoutProduct = { slug: string; desc: string };

export type Loadout = {
  id: string;
  name: string;
  image: string;
  hotspots: Hotspot[];
  products: LoadoutProduct[];
};
