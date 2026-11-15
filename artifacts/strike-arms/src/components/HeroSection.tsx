import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";

import { HeroReviewBadge } from "@/components/hero-review-badge";
import { useHeroVideo } from "@/hooks/use-hero-video";
import {
  HERO_POSTER_DESKTOP,
  HERO_POSTER_DESKTOP_SRCSET,
  HERO_POSTER_MOBILE,
  HERO_POSTER_MOBILE_HEIGHT,
  HERO_POSTER_MOBILE_MEDIA,
  HERO_POSTER_MOBILE_WIDTH,
  pickHeroVideoPoster,
} from "@/lib/hero-poster";

/**
 * The hero text rises 12 px into place, one line after another. It is visible
 * from the first paint (it is the page's largest element), so the entrance
 * never delays LCP. CSS (tw-animate-css) rather than framer-motion, which kept
 * about 120 kB of JavaScript in the entry chunk for this alone (N-031); the
 * reduced-motion rule in storefront-motion.css stops it.
 */
const HERO_RISE =
  "animate-in slide-in-from-bottom-3 fill-mode-both duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]";

export function HeroSection() {
  const shouldPlayVideo = useHeroVideo();
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isShowingVideo = shouldPlayVideo && !videoFailed;
  // Only read once the video mounts, which is always after first paint.
  const videoPoster = isShowingVideo
    ? pickHeroVideoPoster(window.innerWidth, window.devicePixelRatio || 1)
    : undefined;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => setVideoFailed(true));
  }, [isShowingVideo]);

  return (
    <section className="relative w-full h-[90vh] min-h-[580px] max-h-[900px] flex items-center justify-center overflow-hidden">
      {/* ── HERO BACKGROUND ──────────────────────────────────────────────
          Video:   /videos/strike-arms-hero-desktop.webm (wide screens only,
                   not with data-saver or reduced motion: use-hero-video)
          Poster:  shown first, and in place of the video. Phones (up to 767px)
                   get /images/hero-poster-mobile.webp (828x1472 portrait crop);
                   wider screens pick the 1280 or 1920 landscape file from the
                   srcset. The Link preload for "/" in public/_headers must
                   name the same files (lib/hero-poster.ts).
          To add an MP4 source, place it at /videos/strike-arms-hero-desktop.mp4
          and add: <source src="/videos/strike-arms-hero-desktop.mp4" type="video/mp4" />
      ─────────────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        {!isShowingVideo ? (
          <picture>
            <source
              media={HERO_POSTER_MOBILE_MEDIA}
              srcSet={HERO_POSTER_MOBILE}
              width={HERO_POSTER_MOBILE_WIDTH}
              height={HERO_POSTER_MOBILE_HEIGHT}
            />
            <img
              src={HERO_POSTER_DESKTOP}
              srcSet={HERO_POSTER_DESKTOP_SRCSET}
              sizes="100vw"
              width={1920}
              height={1080}
              alt=""
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </picture>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={videoPoster}
            disablePictureInPicture
            disableRemotePlayback
            className="absolute inset-0 w-full h-full object-cover object-center"
          >
            <source src="/videos/strike-arms-hero-desktop.webm" type="video/webm" />
          </video>
        )}
        {/* Overlays for text readability — pointer-events-none so they never block the video */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/40 to-background/75 pointer-events-none" />
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6 flex justify-center">
        <div className="max-w-3xl w-full text-center">
          <h1
            className={`${HERO_RISE} delay-200 text-accent tracking-[0.2em] text-xs md:text-sm font-bold uppercase mb-4`}
          >
            Airsoft Shop Dublin
          </h1>

          <h2
            className={`${HERO_RISE} delay-350 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05] mb-6`}
          >
            Dublin's Home for Airsoft Essentials.
          </h2>

          <p
            className={`${HERO_RISE} delay-500 text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed`}
          >
            Shop airsoft rifles, pistols, BBs, gas, and tactical gear with expert advice from a Dublin store that knows the equipment inside out.
          </p>

          <div className={`${HERO_RISE} delay-650 flex flex-col sm:flex-row gap-4 justify-center`}>
            <Link
              href="/store"
              className="inline-flex h-12 items-center justify-center rounded-sm bg-accent px-8 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
            >
              Shop Gear
            </Link>
            <a
              href="#visit"
              className="inline-flex h-12 items-center justify-center rounded-sm border border-foreground bg-transparent px-8 text-sm font-medium text-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Visit the Store
            </a>
          </div>

          <div className={`${HERO_RISE} delay-800 mt-6 flex justify-center`}>
            <HeroReviewBadge />
          </div>
        </div>
      </div>
    </section>
  );
}
