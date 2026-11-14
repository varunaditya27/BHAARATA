"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils/cn";

gsap.registerPlugin(useGSAP);

const LETTERS = ["B", "H", "A", "R", "A", "T", "A"];
const MACRON_INDEX = 2;

/**
 * BHĀRATA wordmark choreographed with GSAP 3D character stagger (Preset #9)
 * and a synchronized macron stroke draw over the Ā.
 */
export function Wordmark({ className }: { className?: string }) {
  const rootRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.fromTo(
          ".gsap-wordmark-char",
          { opacity: 0, yPercent: 85, rotateX: -42, transformPerspective: 600 },
          {
            opacity: 1,
            yPercent: 0,
            rotateX: 0,
            duration: 0.85,
            stagger: 0.055,
            delay: 0.08,
          }
        ).fromTo(
          ".gsap-macron-line",
          { strokeDasharray: 100, strokeDashoffset: 100 },
          { strokeDashoffset: 0, duration: 0.55, ease: "power3.out" },
          "-=0.32"
        );
      });
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <span
      ref={rootRef}
      className={cn("inline-flex font-display leading-none", className)}
      aria-label="BHĀRATA"
      role="img"
    >
      {LETTERS.map((ch, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden pb-[0.08em] pt-[0.18em]"
          aria-hidden
        >
          <span className="gsap-wordmark-char relative inline-block will-change-transform">
            {ch}
            {i === MACRON_INDEX && (
              <svg
                className="absolute left-[18%] top-[-0.03em] h-[0.06em] w-[64%] overflow-visible"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  y1="5"
                  x2="100"
                  y2="5"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeLinecap="round"
                  pathLength={100}
                  className="gsap-macron-line"
                />
              </svg>
            )}
          </span>
        </span>
      ))}
    </span>
  );
}
