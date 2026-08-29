import type { Loadout } from '@/types/loadout';

// The curated kit bundles shown on the homepage. Hand-maintained: these
// are marketing groupings, not catalogue rows.
export const loadouts: Loadout[] = [
  {
    id: "beginner",
    name: "Beginner Setup",
    image: "/images/playstyles/beginner-setup.webp",
    hotspots: [
      { label: "Red Dot Sight",      x: 56, y: 59 },
      { label: "Specna Arms SA E14", x: 48, y: 50 },
      { label: "Magazine",           x: 45, y: 80 },
    ],
    products: [
      {
        name: "Specna Arms SA E14",
        desc: "Reliable starter AEG with solid build quality, easy handling, and enough performance for first-time players.",
        price: "€189.00",
      },
      {
        name: "Theta Optics Monolith Red Dot",
        desc: "Compact red dot sight for faster target pickup and a cleaner beginner rifle setup.",
        price: "€39.00",
      },
      {
        name: "Mid-cap Magazine 250 Rounds AMAROK (Black)",
        desc: "Durable 250-round mid-cap magazine for carrying extra ammo without unnecessary rattle.",
        price: "€18.00",
      },
    ],
  },
  {
    id: "cqb",
    name: "CQB",
    image: "/images/playstyles/cqb.webp",
    hotspots: [
      { label: "Vertical Foregrip",          x: 29, y: 50 },
      { label: "Krytac Trident MK2 PDW-M",   x: 46, y: 36 },
      { label: "Red Dot Sight",              x: 44, y: 15 },
      { label: "Mask",                       x: 64, y:  6 },
    ],
    products: [
      {
        name: "Krytac Trident MK2 PDW-M",
        desc: "Compact high-performance AEG built for fast close-quarters play and tight indoor layouts.",
        price: "€429.00",
      },
      {
        name: "Theta Optics Mini Reflex Rugged (Black)",
        desc: "Low-profile reflex sight for quick aiming without adding bulk to a compact CQB build.",
        price: "€49.00",
      },
      {
        name: "Tango Down Vertical Grip (Stubby) (Black)",
        desc: "Short vertical grip for better control, faster handling, and tighter movement around cover.",
        price: "€24.00",
      },
    ],
  },
  {
    id: "milsim",
    name: "MIL-SIM",
    image: "/images/playstyles/mil-sim.webp",
    hotspots: [
      { label: "Night-Vision",    x: 46, y: 23 },
      { label: "Holo-Sight",      x: 44, y: 44 },
      { label: "PEQ Box",         x: 56, y: 44 },
      { label: "Suppressor",      x: 73, y: 53 },
      { label: "SA-H20 EDGE 2.0", x: 48, y: 56 },
    ],
    products: [
      {
        name: "SA-H20 EDGE 2.0",
        desc: "Field-ready AEG platform with a serious tactical profile and strong upgrade potential.",
        price: "€329.00",
      },
      {
        name: "AIM-O XPS 2-0 Red-Green Holographic Sight (Black)",
        desc: "Red-green holographic-style sight for fast sight picture and better target tracking in varied conditions.",
        price: "€69.00",
      },
      {
        name: "Action Army T10 Hive Suppressor",
        desc: "Clean suppressor-style accessory that sharpens the look of a serious MIL-SIM loadout.",
        price: "€42.00",
      },
    ],
  },
  {
    id: "sniper",
    name: "Sniper",
    image: "/images/playstyles/sniper.webp",
    hotspots: [
      { label: "SSG 10",       x: 32, y: 46 },
      { label: "Ghillie Suit", x:  8, y: 43 },
      { label: "Scope",        x: 39, y: 42 },
      { label: "Camera",       x: 48, y: 55 },
      { label: "Suppressor",   x: 58, y: 70 },
    ],
    products: [
      {
        name: "SSG 10",
        desc: "Bolt-action sniper platform built for precision-focused players and long-range woodland setups.",
        price: "€299.00",
      },
      {
        name: "Theta Optics 3-9x40 Scope",
        desc: "Adjustable zoom scope for clearer sightlines and better long-range target identification.",
        price: "€59.00",
      },
      {
        name: "Invader Gear Base Leaf Ghillie",
        desc: "Lightweight leaf-style concealment layer for players building a more hidden sniper setup.",
        price: "€79.00",
      },
    ],
  },
];
