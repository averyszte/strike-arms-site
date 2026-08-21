import { useState, useEffect, useRef } from "react";

/**
 * Full-bleed hero background video with poster fallback — the same source and
 * autoplay/fallback behaviour as the live HeroSection, extracted so the demo
 * heroes can share it. Renders an absolutely-positioned layer; the caller
 * stacks its own overlays and content on top.
 */
interface HeroVideoBgProps {
  /** Extra classes (e.g. opacity) applied to the video/poster layer. */
  className?: string;
}

export function HeroVideoBg({ className = "" }: HeroVideoBgProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => setVideoFailed(true));
  }, []);

  if (videoFailed) {
    return (
      <img
        src="/images/strike-arms-hero-poster-desktop.webp"
        alt=""
        className={`absolute inset-0 w-full h-full object-cover object-center ${className}`}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="/images/strike-arms-hero-poster-desktop.webp"
      disablePictureInPicture
      disableRemotePlayback
      className={`absolute inset-0 w-full h-full object-cover object-center ${className}`}
    >
      <source src="/videos/strike-arms-hero-desktop.webm" type="video/webm" />
    </video>
  );
}
