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
 *       - `width` / `height` = the file's pixel size
 *       - `brandSlug` = its slug in lib/brands.ts, if the shop lists the brand
 *  3. Save. The carousel updates automatically — no other files to touch.
 *
 * Every logo renders at the SAME height (BRAND_LOGO_HEIGHT); width scales
 * automatically from each image's aspect ratio, so wider logos simply take up
 * more horizontal room. You never set a per-logo size.
 *
 * Notes:
 *  - Order in this array = left-to-right order in the carousel, except that
 *    FEATURED_BRAND_LOGO is slotted in as every third logo (MARQUEE_LOGOS).
 *  - Logos are auto-recoloured to white and dimmed, so colour doesn't matter —
 *    only a clean, transparent shape does. Avoid photos/heavy gradients.
 *  - Supported formats: anything the browser renders (.svg, .png, .webp, ...).
 */

/** Uniform on-screen height (px) for every brand logo. Change once to rescale all. */
export const BRAND_LOGO_HEIGHT = 30;

export interface BrandLogo {
  /** Brand name, used as the image alt text. */
  name: string;
  /** Public path to the logo, e.g. "/images/brands/krytac.webp". */
  src: string;
  /** Intrinsic pixel width and height of the file, for the img width/height attributes. */
  width: number;
  height: number;
  /**
   * The brand's slug in `lib/brands.ts`, when the shop lists that brand. It is
   * the key for a link to `/brands/<slug>` and for hiding unstocked brands.
   * Logos without one are brands the catalogue does not list.
   */
  brandSlug?: string;
}

export const BRAND_LOGOS: BrandLogo[] = [
  { name: "5.11 Tactical", src: "/images/brands/5-11.webp", width: 67, height: 31 },
  { name: "A&K", src: "/images/brands/a-k.webp", width: 48, height: 30 },
  { name: "Action Army", src: "/images/brands/action-army.webp", width: 47, height: 31, brandSlug: "action-army" },
  { name: "Arcturus", src: "/images/brands/arcturus.webp", width: 39, height: 31 },
  { name: "Ares", src: "/images/brands/ares.webp", width: 58, height: 31 },
  { name: "Army Armament", src: "/images/brands/army-armement.webp", width: 37, height: 31 },
  { name: "Cybergun", src: "/images/brands/cybergun.webp", width: 68, height: 31 },
  { name: "CYMA", src: "/images/brands/cyma.webp", width: 74, height: 31, brandSlug: "cyma" },
  { name: "D-Boys", src: "/images/brands/d-boys.webp", width: 48, height: 31 },
  { name: "Delta Armory", src: "/images/brands/delta-armory.webp", width: 29, height: 31 },
  { name: "G&G Armament", src: "/images/brands/g-g-armament.webp", width: 38, height: 30, brandSlug: "gandg" },
  { name: "KJW", src: "/images/brands/kjw.webp", width: 36, height: 31 },
  { name: "Novritsch", src: "/images/brands/novritsch.webp", width: 81, height: 31 },
  { name: "Nuprol", src: "/images/brands/nuprol.webp", width: 81, height: 30, brandSlug: "nuprol" },
  { name: "Specna Arms", src: "/images/brands/specna-arms.webp", width: 82, height: 31, brandSlug: "specna-arms" },
  { name: "Tokyo Marui", src: "/images/brands/tokyo-marui.webp", width: 44, height: 31, brandSlug: "tokyo-marui" },
  { name: "Umarex", src: "/images/brands/umarex.webp", width: 111, height: 31, brandSlug: "umarex" },
  { name: "VFC", src: "/images/brands/vfc.webp", width: 42, height: 31, brandSlug: "vfc" },
  { name: "WE", src: "/images/brands/we-airsoft.webp", width: 38, height: 31, brandSlug: "we" },
];

/** The house brand, shown as every third logo in the carousel. */
export const FEATURED_BRAND_LOGO: BrandLogo = {
  name: "Evolution",
  src: "/images/brands/evolution.png",
  width: 501,
  height: 304,
  brandSlug: "evolution",
};

/** Puts `featured` after every `every - 1` logos, e.g. A B F C D F ... */
export function interleaveFeatured(
  logos: readonly BrandLogo[],
  featured: BrandLogo,
  every: number,
): BrandLogo[] {
  return logos.flatMap((logo, i) => ((i + 1) % (every - 1) === 0 ? [logo, featured] : [logo]));
}

/** The carousel's running order: the brands above, Evolution every third. */
export const MARQUEE_LOGOS = interleaveFeatured(BRAND_LOGOS, FEATURED_BRAND_LOGO, 3);
