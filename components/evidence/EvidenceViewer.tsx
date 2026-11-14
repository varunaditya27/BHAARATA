"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageCredit } from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";

type View = { s: number; x: number; y: number };

const MAX_SCALE = 6;

export function EvidenceViewer({
  credit,
  overlay,
}: {
  credit: ImageCredit;
  overlay?: React.ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ s: 1, x: 0, y: 0 });
  const [animate, setAnimate] = useState(false);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

  const animated = (fn: () => void) => () => {
    setAnimate(true);
    fn();
  };

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
        </div>
      </div>

      <div className="absolute bottom-3 right-3 flex border border-paper/25 bg-ink font-sans text-sm text-paper">
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
