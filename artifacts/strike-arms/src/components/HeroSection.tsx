import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export function HeroSection() {
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => setVideoFailed(true));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  };

  return (
    <section className="relative w-full h-[90vh] min-h-[580px] max-h-[900px] flex items-center justify-center overflow-hidden">
      {/* ── HERO BACKGROUND ──────────────────────────────────────────────
          Video:   /videos/strike-arms-hero-desktop.webm
          Poster:  /images/strike-arms-hero-poster-desktop.webp
          To add an MP4 source, place it at /videos/strike-arms-hero-desktop.mp4
          and add: <source src="/videos/strike-arms-hero-desktop.mp4" type="video/mp4" />
      ─────────────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        {videoFailed ? (
          <img
            src="/images/strike-arms-hero-poster-desktop.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
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
        <motion.div
          className="max-w-3xl w-full text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={itemVariants}
            className="text-accent tracking-[0.2em] text-xs md:text-sm font-bold uppercase mb-4"
          >
            Airsoft Shop Dublin
          </motion.h1>

          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05] mb-6"
          >
            Dublin's Home for Airsoft Essentials.
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed"
          >
            Shop airsoft rifles, pistols, BBs, gas, and tactical gear with expert advice from a Dublin store that knows the equipment inside out.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/store"
              className="inline-flex h-12 items-center justify-center rounded-sm bg-accent px-8 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
            >
              Shop Gear
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-sm border border-foreground bg-transparent px-8 text-sm font-medium text-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Get Expert Advice
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
