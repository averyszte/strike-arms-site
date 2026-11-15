/**
 * The hero video is a large download, so it only plays where it is worth it:
 * a laptop or desktop screen, a fast connection with no data-saver, and no
 * request for reduced motion. Everyone else, tablets included, sees the
 * poster frame, which looks the same when still.
 */

/** The narrowest viewport that gets the video (Tailwind's `lg`). */
export const HERO_VIDEO_MIN_WIDTH_QUERY = "(min-width: 1024px)";
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** `navigator.connection.effectiveType` values too slow for the video. */
const SLOW_CONNECTION_TYPES: ReadonlySet<string> = new Set(["slow-2g", "2g", "3g"]);

export function isSlowConnectionType(effectiveType: string | undefined): boolean {
  return effectiveType !== undefined && SLOW_CONNECTION_TYPES.has(effectiveType);
}

export type HeroVideoConditions = {
  isWideScreen: boolean;
  isSavingData: boolean;
  isSlowConnection: boolean;
  prefersReducedMotion: boolean;
};

export function shouldPlayHeroVideo(conditions: HeroVideoConditions): boolean {
  return (
    conditions.isWideScreen &&
    !conditions.isSavingData &&
    !conditions.isSlowConnection &&
    !conditions.prefersReducedMotion
  );
}
