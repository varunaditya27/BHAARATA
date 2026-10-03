"use client";

import { useRef } from "react";

const MAX_OFFSET = 10;
const STRENGTH = 0.35;

/**
 * Wraps a single primary CTA — not every button, not every card. The
 * element leans a few pixels toward the cursor inside its bounds and
 * springs back on leave. Keep it to the two or three highest-intent calls
 * to action; don't reach for it on ordinary links or list items, where it
 * would just be noise.
 */
export function Magnetic({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotionRef = useRef<boolean | null>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotionRef.current === null) {
      reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    if (reduceMotionRef.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * STRENGTH;
    const y = (e.clientY - rect.top - rect.height / 2) * STRENGTH;
    const clampedX = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, x));
    const clampedY = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, y));
    // No transition while actively tracking the cursor — only on release —
    // otherwise the lean lags a beat behind the pointer instead of following it.
    ref.current.style.transition = "none";
    ref.current.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
  };

  const handleLeave = () => {
    if (!ref.current) return;
    ref.current.style.transition = "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
    ref.current.style.transform = "translate(0, 0)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{ willChange: "transform" }}
    >
      {children}
    </div>
  );
}
