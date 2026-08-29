// Shapes for the "shop by loadout" showcase on the homepage.

export type Hotspot = { label: string; x: number; y: number };

export type Loadout = {
  id: string;
  name: string;
  image: string;
  hotspots: Hotspot[];
  products: { name: string; desc: string; price: string }[];
};
