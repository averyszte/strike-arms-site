import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const messages = [
  "Dublin's specialist airsoft store",
  "Beginner-friendly advice in store",
  "Shop rifles, pistols, BBs, gas and gear",
  "Need help choosing? Call Strike Arms: +353 87 273 6351",
];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-card border-b border-border h-9 flex items-center justify-center overflow-hidden px-4">
      <div className="flex items-center gap-2 text-xs md:text-sm font-medium tracking-wide text-foreground">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {messages[index]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
