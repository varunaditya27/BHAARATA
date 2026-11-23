"use client";

import { motion, useReducedMotion } from "motion/react";

type AstrolabeOverlayProps = {
  lng: number;
  lat: number;
  bearing: number;
  accentColor?: string;
  activeChapterId: string | null;
};

function formatCoord(val: number, posLabel: string, negLabel: string) {
  const abs = Math.abs(val).toFixed(1);
  return `${abs}° ${val >= 0 ? posLabel : negLabel}`;
}

/**
 * Celestial astrolabe and cartographic meridian reticle rendered immediately
 * on frame 0 over the starfield. Counter-rotates gently with camera bearing
 * and pulses with the active kingdom's pigment when a chapter locks in.
 */
export function AstrolabeOverlay({
  lng,
  lat,
  bearing,
  accentColor = "#ffb347",
  activeChapterId,
}: AstrolabeOverlayProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* Orbital Astrolabe Rings — positioned over the right/center globe stage */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:left-[62%]">
        <motion.svg
          width="680"
          height="680"
          viewBox="0 0 680 680"
          className="h-[74vmin] w-[74vmin] max-h-[680px] max-w-[680px] opacity-40"
          initial={prefersReducedMotion ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <g
            transform={`rotate(${prefersReducedMotion ? 0 : -bearing * 0.8} 340 340)`}
          >
            {/* Outer graduated degree ring */}
            <circle
              cx="340"
              cy="340"
              r="316"
              fill="none"
              stroke="rgba(255,244,220, 0.22)"
              strokeWidth="1"
            />
            {/* Dashed ecliptic ring */}
            <circle
              cx="340"
              cy="340"
              r="292"
              fill="none"
              stroke={accentColor}
              strokeOpacity="0.45"
              strokeWidth="1"
              strokeDasharray="3 9"
            />
            {/* Inner meridian ring */}
            <circle
              cx="340"
              cy="340"
              r="224"
              fill="none"
              stroke="rgba(255,244,220, 0.12)"
              strokeWidth="0.8"
            />
            {/* Cardinal crosshairs */}
            <path
              d="M 340 10 L 340 42 M 340 638 L 340 670 M 10 340 L 42 340 M 638 340 L 670 340"
              stroke="rgba(255,244,220, 0.45)"
              strokeWidth="1.2"
            />
            {/* Diagonal astrolabe ticks */}
            <path
              d="M 116 116 L 134 134 M 564 116 L 546 134 M 116 564 L 134 546 M 564 564 L 546 546"
              stroke={accentColor}
              strokeOpacity="0.55"
              strokeWidth="1.2"
            />
          </g>

          {/* Active chapter lock-on pulse ring */}
          {activeChapterId && !prefersReducedMotion && (
            <motion.circle
              key={activeChapterId}
              cx="340"
              cy="340"
              r="120"
              fill="none"
              stroke={accentColor}
              strokeWidth="1.5"
              initial={{ r: 36, opacity: 0.75 }}
              animate={{ r: 240, opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
            />
          )}
        </motion.svg>
      </div>

      {/* Top-left cartographic telemetry readout */}
      <div className="hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-paper/50 md:flex md:left-8 md:top-7 md:absolute">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full transition-colors duration-500"
          style={{ backgroundColor: accentColor }}
        />
        <span>
          {formatCoord(lat, "N", "S")} · {formatCoord(lng, "E", "W")}
        </span>
      </div>
    </div>
  );
}
