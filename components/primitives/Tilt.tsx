"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils/cn";

/** Tips toward the pointer, like a plate held in the hand. Does nothing for reduced motion. */
export function Tilt({ children, className, depth = 7 }: { children: React.ReactNode; className?: string; depth?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = el.getBoundingClientRect();
    const x = (e.clientX - box.left) / box.width - 0.5;
    const y = (e.clientY - box.top) / box.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * depth).toFixed(2)}deg) rotateY(${(x * depth).toFixed(2)}deg) scale(1.02)`;
  };
  const leave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={cn("transition-transform duration-300 ease-out will-change-transform", className)}
    >
      {children}
    </div>
  );
}
