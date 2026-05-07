import { motion } from "framer-motion";
import { Link } from "wouter";
import { Star } from "lucide-react";

export function HeroSection() {
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section className="relative w-full h-[90vh] min-h-[580px] max-h-[900px] flex items-center justify-center overflow-hidden">
      {/* Background container - ready for video swap */}
      {/* TODO: To use a video background, replace the img tag below with:
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover object-center">
            <source src="/videos/hero-montage.mp4" type="video/mp4" />
            <source src="/videos/hero-montage.webm" type="video/webm" />
          </video>
      */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-poster.png"
          alt="Airsoft players in tactical gear"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/50 to-background/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/30 to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6 flex justify-center">
        <motion.div
          className="max-w-2xl text-center md:text-left"
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
            Get the right gear before you waste money on the wrong setup.
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed"
          >
            Strike Arms is Dublin's specialist airsoft store. Expert advice, trusted brands, and the setup guidance beginners actually need.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link
              href="/shop"
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

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="text-foreground">4.7 Google Rating</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <span>90 Reviews</span>
            <div className="w-1 h-1 rounded-full bg-border" />
            <span>Beginner-Friendly</span>
            <div className="w-1 h-1 rounded-full bg-border" />
            <span>Dublin Specialist</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
