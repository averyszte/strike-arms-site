import { useEffect, useState } from "react";

import {
  HERO_VIDEO_MIN_WIDTH_QUERY,
  REDUCED_MOTION_QUERY,
  shouldPlayHeroVideo,
} from "@/lib/hero-video-policy";

type NetworkInformationLike = { saveData?: boolean };

function readSaveData(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  return connection?.saveData === true;
}

/**
 * Whether the hero should mount its video. It starts false, so the first
 * paint is the poster and the video is only fetched once the page is up.
 */
export function useHeroVideo(): boolean {
  const [shouldPlay, setShouldPlay] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia(HERO_VIDEO_MIN_WIDTH_QUERY);
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () =>
      setShouldPlay(
        shouldPlayHeroVideo({
          isWideScreen: wide.matches,
          isSavingData: readSaveData(),
          prefersReducedMotion: reduced.matches,
        }),
      );
    update();
    wide.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  return shouldPlay;
}
