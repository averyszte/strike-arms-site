/**
 * The homepage hero poster, the page's LCP image. Phones get a portrait crop
 * centred on the player; wider screens get a landscape file sized by srcset.
 *
 * The `Link: rel=preload` headers for "/" in public/_headers must name these
 * same files, media queries and srcset, or the browser downloads the poster
 * twice.
 */

/** Phones: the viewport range that gets the portrait crop. */
export const HERO_POSTER_MOBILE_MEDIA = "(max-width: 767px)";
export const HERO_POSTER_MOBILE = "/images/hero-poster-mobile.webp";
export const HERO_POSTER_MOBILE_WIDTH = 828;
export const HERO_POSTER_MOBILE_HEIGHT = 1472;

/** Wider screens: the full-size landscape file, also the video's poster. */
export const HERO_POSTER_DESKTOP = "/images/strike-arms-hero-poster-desktop.webp";
export const HERO_POSTER_DESKTOP_1280 = "/images/hero-poster-desktop-1280.webp";
export const HERO_POSTER_DESKTOP_SRCSET =
  `${HERO_POSTER_DESKTOP_1280} 1280w, ${HERO_POSTER_DESKTOP} 1920w`;

/**
 * The video's poster: the same file the srcset above picks for this screen
 * (the smallest one at least as wide as the device pixels), so mounting the
 * video does not fetch a second, larger poster.
 */
export function pickHeroVideoPoster(viewportWidth: number, pixelRatio: number): string {
  return viewportWidth * pixelRatio <= 1280 ? HERO_POSTER_DESKTOP_1280 : HERO_POSTER_DESKTOP;
}
