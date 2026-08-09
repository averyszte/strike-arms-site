/**
 * Brand-logo manifest — the single source of truth for the brand carousel
 * (BrandMarquee), used on the live homepage and the combined demo.
 *
 * ─── How to add or change a brand logo ─────────────────────────────────────
 *  1. Drop the logo file into:  public/images/brands/
 *     (transparent background, trimmed tight, exported at a consistent height)
 *  2. Add or edit an entry in BRAND_LOGOS below:
 *       - `src`  = "/images/brands/<your-file>"   (leading slash, no "public")
 *       - `name` = the brand's name (used as the image alt text)
 *  3. Save. The carousel updates automatically — no other files to touch.
 *
 * Every logo renders at the SAME height (BRAND_LOGO_HEIGHT); width scales
 * automatically from each image's aspect ratio, so wider logos simply take up
 * more horizontal room. You never set a per-logo size.
 *
 * Notes:
 *  - Order in this array = left-to-right order in the carousel.
 *  - Logos are auto-recoloured to white and dimmed, so colour doesn't matter —
 *    only a clean, transparent shape does. Avoid photos/heavy gradients.
 *  - Supported formats: anything the browser renders (.svg, .png, .webp, ...).
 */

/** Uniform on-screen height (px) for every brand logo. Change once to rescale all. */
export const BRAND_LOGO_HEIGHT = 30;

export interface BrandLogo {
  /** Brand name — used as the image alt text. */
  name: string;
  /** Public path to the logo, e.g. "/images/brands/krytac.webp". */
  src: string;
}

export const BRAND_LOGOS: BrandLogo[] = [
  { name: "5.11 Tactical", src: "/images/brands/5-11.webp" },
  { name: "A&K", src: "/images/brands/a-k.webp" },
  { name: "Action Army", src: "/images/brands/action-army.webp" },
  { name: "Arcturus Tactical", src: "/images/brands/arctus-tactical.webp" },
  { name: "Ares", src: "/images/brands/ares.webp" },
  { name: "Army Armament", src: "/images/brands/army-armement.webp" },
  { name: "Cybergun", src: "/images/brands/cybergun.webp" },
  { name: "CYMA", src: "/images/brands/cyma.webp" },
  { name: "D-Boys", src: "/images/brands/d-boys.webp" },
  { name: "Delta Armory", src: "/images/brands/delta-armory.webp" },
  { name: "G&G Armament", src: "/images/brands/g-g-armament.webp" },
  { name: "KJW", src: "/images/brands/kjw.webp" },
  { name: "Novritsch", src: "/images/brands/novritsch.webp" },
  { name: "Nuprol", src: "/images/brands/nuprol.webp" },
  { name: "Specna Arms", src: "/images/brands/specna-arms.webp" },
  { name: "Tokyo Marui", src: "/images/brands/tokyo-marui.webp" },
  { name: "Umarex", src: "/images/brands/umarex.webp" },
  { name: "VFC", src: "/images/brands/vfc.webp" },
  { name: "WE", src: "/images/brands/we-airsoft.webp" },
];
