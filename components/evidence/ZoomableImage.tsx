"use client";

import Image from "next/image";
import type { ImageCredit } from "@/lib/data/images";

export type ImageRegion = { x: number; y: number; w: number; h: number };

/**
 * Click-to-zoom-and-pan toward a hand-placed region — a lightweight
 * stand-in for real IIIF deep zoom (IMPLEMENTATION_PLAN.md §14/Phase 6).
 * Transform-origin is set to the region's center and the image is scaled
 * up around it, with a CSS transition doing the "camera move" — no pan/
 * zoom library needed at this scale.
 */
export function ZoomableImage({
  credit,
  region,
  frameClassName = "aspect-[4/3]",
}: {
  credit: ImageCredit;
  region: ImageRegion | null;
  frameClassName?: string;
}) {
  const scale = region ? Math.min(Math.max(1 / region.h, 1), 2.4) : 1;
  const originX = region ? (region.x + region.w / 2) * 100 : 50;
  const originY = region ? (region.y + region.h / 2) * 100 : 50;

  return (
    <div className={`relative overflow-hidden bg-stone ${frameClassName}`}>
      <Image
        src={credit.file}
        alt={credit.alt}
        fill
        sizes="(min-width: 768px) 700px, 100vw"
        priority
        className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out"
        style={{ transformOrigin: `${originX}% ${originY}%`, transform: `scale(${scale})` }}
      />
    </div>
  );
}
