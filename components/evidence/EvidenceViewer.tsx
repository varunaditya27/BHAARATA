"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageCredit } from "@/lib/data/images";
import { cn } from "@/lib/utils/cn";

export type ImageRegion = { x: number; y: number; w: number; h: number };
type View = { s: number; x: number; y: number }; // scale; translate in px

const MAX_SCALE = 6;

/**
 * Pan-and-zoom viewer for an evidence photograph, with the record's line
 * regions drawn on top (they move with the image, so a box stays on its
 * line at any zoom). Wheel zooms toward the cursor, drag pans, and the
 * frame is keyboard operable (+ / − / 0 / arrows). When `focus` is set the
 * view glides to frame that region.
 *
 * A lightweight stand-in for IIIF deep zoom: the photographs here are
 * small enough that one image at full resolution is all there is to see.
 */
export function EvidenceViewer({
  credit,
  regions,
  focus,
  highlighted,
  onHoverRegion,
  onPickRegion,
  overlay,
}: {
  credit: ImageCredit;
  regions: ImageRegion[];
  focus: number | null;
  highlighted: number | null;
  onHoverRegion: (index: number | null) => void;
  onPickRegion: (index: number) => void;
  /** Rendered over the photo inside the zoomed layer (the raking-light canvas). */
  overlay?: React.ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ s: 1, x: 0, y: 0 });
  const [animate, setAnimate] = useState(false);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  // Frame size in state (from a ResizeObserver) so the maths below never
  // reads the DOM during render.
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** Keep the image covering the frame: no empty margins at any zoom. */
  const clamp = useCallback(
    (v: View): View => {
      const s = Math.min(MAX_SCALE, Math.max(1, v.s));
      return { s, x: Math.min(0, Math.max(size.w - size.w * s, v.x)), y: Math.min(0, Math.max(size.h - size.h * s, v.y)) };
    },
    [size],
  );

  const zoomAt = useCallback(
    (factor: number, cx = size.w / 2, cy = size.h / 2) => {
      setView((v) => {
        const s = Math.min(MAX_SCALE, Math.max(1, v.s * factor));
        const k = s / v.s;
        return clamp({ s, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k });
      });
    },
    [clamp, size],
  );

  // Glide to a region when a line is chosen; back to the whole image when
  // cleared. (Render-phase sync: React's pattern for adjusting state when
  // a prop changes, without an effect.)
  const [lastFocus, setLastFocus] = useState<number | null>(null);
  if (focus !== lastFocus) {
    setLastFocus(focus);
    setAnimate(true);
    const r = focus !== null ? regions[focus] : null;
    if (!r || !size.w) setView({ s: 1, x: 0, y: 0 });
    else {
      // Fit the line's height, not its width: inscription lines run the
      // full width of the stone, so fitting width would barely zoom.
      const s = Math.min(3, Math.max(1, 0.55 / r.h));
      setView(clamp({ s, x: size.w / 2 - (r.x + r.w / 2) * size.w * s, y: size.h / 2 - (r.y + r.h / 2) * size.h * s }));
    }
  }

  const animated = (fn: () => void) => () => {
    setAnimate(true);
    fn();
  };

  // Wheel needs a non-passive listener to stop the page scrolling.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setAnimate(false);
      const rect = el.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.0018), e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = 60;
    const map: Record<string, () => void> = {
      "+": () => zoomAt(1.4),
      "=": () => zoomAt(1.4),
      "-": () => zoomAt(1 / 1.4),
      "0": () => setView({ s: 1, x: 0, y: 0 }),
      ArrowLeft: () => setView((v) => clamp({ ...v, x: v.x + step })),
      ArrowRight: () => setView((v) => clamp({ ...v, x: v.x - step })),
      ArrowUp: () => setView((v) => clamp({ ...v, y: v.y + step })),
      ArrowDown: () => setView((v) => clamp({ ...v, y: v.y - step })),
    };
    const fn = map[e.key];
    if (!fn) return;
    e.preventDefault();
    setAnimate(true);
    fn();
  };

  return (
    <div className="relative">
      <div
        ref={frameRef}
        tabIndex={0}
        role="img"
        aria-label={`${credit.alt}. Zoomable: use plus and minus to zoom, arrow keys to move, 0 to reset.`}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("[data-region]")) return;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          drag.current = { px: e.clientX, py: e.clientY, x: view.x, y: view.y };
          setAnimate(false);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          setView((v) => clamp({ ...v, x: d.x + e.clientX - d.px, y: d.y + e.clientY - d.py }));
        }}
        onPointerUp={() => (drag.current = null)}
        onDoubleClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setAnimate(true);
          zoomAt(2, e.clientX - rect.left, e.clientY - rect.top);
        }}
        className={cn(
          "relative aspect-[4/3] touch-none select-none overflow-hidden bg-stone outline-none focus-visible:ring-2 focus-visible:ring-ink",
          view.s > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in",
        )}
      >
        <div
          className={cn("absolute inset-0 origin-top-left", animate && "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]")}
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})` }}
        >
          <Image src={credit.file} alt="" fill sizes="(min-width: 768px) 720px, 100vw" priority className="object-cover" draggable={false} />
          {overlay}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            {regions.map((r, i) => {
              const on = highlighted === i || focus === i;
              return (
                <g
                  key={i}
                  data-region
                  className="cursor-pointer"
                  onPointerEnter={() => onHoverRegion(i)}
                  onPointerLeave={() => onHoverRegion(null)}
                  onClick={() => onPickRegion(i)}
                >
                  <rect
                    x={r.x * 100}
                    y={r.y * 100}
                    width={r.w * 100}
                    height={r.h * 100}
                    fill={on ? "rgba(196,85,58,0.16)" : "transparent"}
                    stroke={on ? "#c4553a" : "rgba(243,237,224,0.7)"}
                    strokeWidth={on ? 2 : 1}
                    strokeDasharray={on ? undefined : "4 3"}
                    vectorEffect="non-scaling-stroke"
                    className="transition-[fill,stroke] duration-200"
                  />
                </g>
              );
            })}
          </svg>
          {regions.map((r, i) => (
            <span
              key={i}
              className={cn(
                "pointer-events-none absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center font-sans text-[0.65rem] tabular-nums transition-colors",
                highlighted === i || focus === i ? "bg-[#c4553a] text-paper" : "bg-ink/80 text-paper",
              )}
              style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%`, transform: `translate(-50%, -50%) scale(${1 / view.s})` }}
              aria-hidden
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-3 right-3 flex border border-paper/25 bg-ink/80 font-sans text-sm text-paper backdrop-blur-sm">
        <button onClick={animated(() => zoomAt(1.4))} className="h-8 w-8 hover:bg-paper/10" aria-label="Zoom in">
          +
        </button>
        <button onClick={animated(() => zoomAt(1 / 1.4))} className="h-8 w-8 border-x border-paper/20 hover:bg-paper/10" aria-label="Zoom out">
          −
        </button>
        <button
          onClick={animated(() => setView({ s: 1, x: 0, y: 0 }))}
          className="h-8 px-2.5 text-xs hover:bg-paper/10"
        >
          Whole image
        </button>
      </div>
      <p className="pointer-events-none absolute left-3 top-3 bg-ink/70 px-2 py-0.5 font-sans text-[0.65rem] tabular-nums text-paper/80">
        {Math.round(view.s * 100)}%
      </p>
    </div>
  );
}
