/**
 * The hero video is a large download, so it only plays where it is worth it:
 * a wide screen, no data-saver, and no request for reduced motion. Everyone
 * else sees the poster frame, which looks the same when still.
 */

/** The narrowest viewport that gets the video (Tailwind's `md`). */
export const HERO_VIDEO_MIN_WIDTH_QUERY = "(min-width: 768px)";
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export type HeroVideoConditions = {
  isWideScreen: boolean;
  isSavingData: boolean;
  prefersReducedMotion: boolean;
};

export function shouldPlayHeroVideo(conditions: HeroVideoConditions): boolean {
  return conditions.isWideScreen && !conditions.isSavingData && !conditions.prefersReducedMotion;
}
