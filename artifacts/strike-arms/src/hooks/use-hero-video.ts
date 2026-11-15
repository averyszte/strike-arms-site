import { useEffect, useState } from "react";

import {
  HERO_VIDEO_MIN_WIDTH_QUERY,
  REDUCED_MOTION_QUERY,
  isSlowConnectionType,
  shouldPlayHeroVideo,
} from "@/lib/hero-video-policy";

type NetworkInformationLike = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
};

function readConnection(): NetworkInformationLike | undefined {
  return (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
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
          isSavingData: readConnection()?.saveData === true,
          isSlowConnection: isSlowConnectionType(readConnection()?.effectiveType),
          prefersReducedMotion: reduced.matches,
        }),
      );
    update();
    // A link that slows down (or turns on data saver) after load stops the video.
    const connection = readConnection();
    wide.addEventListener("change", update);
    reduced.addEventListener("change", update);
    connection?.addEventListener?.("change", update);
    return () => {
      wide.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
      connection?.removeEventListener?.("change", update);
    };
  }, []);

  return shouldPlay;
}
