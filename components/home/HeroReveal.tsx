"use client";

import { motion } from "motion/react";

/**
 * Subtle entrance only — communicates "the page has settled", nothing more.
 * Motion resolves prefers-reduced-motion automatically.
 */
export function HeroReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
