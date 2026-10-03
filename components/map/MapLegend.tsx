"use client";

import { Layers } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export type LayerToggleId = "territory" | "places" | "routes" | "relief";

const LAYER_OPTIONS: { id: LayerToggleId; label: string }[] = [
  { id: "territory", label: "Kingdoms" },
  { id: "places", label: "Cities and places" },
  { id: "routes", label: "Trade and war routes" },
  { id: "relief", label: "Hills and rivers" },
];

/**
 * Every checkbox here controls a real MapLibre layer's visibility — see
 * the `visibleLayers` prop on HistoricalMap. Don't add a toggle that
 * doesn't actually control something (GUIDANCE.md: no decorative UI).
 * Below `md` it folds into a single "Layers" button so it doesn't sit on
 * top of the map a phone has so little of.
 */
export function MapLegend({
  visible,
  onToggle,
}: {
  visible: Set<LayerToggleId>;
  onToggle: (id: LayerToggleId) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="font-sans text-sm text-paper">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-2 border border-paper/25 bg-ink/85 px-3 py-1.5 text-xs backdrop-blur-sm md:hidden"
      >
        <Layers size={13} />
        Layers
      </button>
      <div
        className={cn(
          "mt-2 w-52 border border-paper/20 bg-ink/90 p-3 backdrop-blur-sm md:mt-0 md:block md:w-48",
          open ? "block" : "hidden",
        )}
      >
        <p className="text-[0.65rem] uppercase tracking-wide text-paper/60">Show on the map</p>
        <ul className="mt-2 space-y-1.5">
          {LAYER_OPTIONS.map((opt) => (
            <li key={opt.id}>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={visible.has(opt.id)}
                  onChange={() => onToggle(opt.id)}
                  className="accent-territory"
                />
                {opt.label}
              </label>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-start gap-2 border-t border-paper/15 pt-3 text-xs text-paper/70">
          <span
            className="mt-0.5 h-3 w-5 shrink-0 border border-paper/40"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(243,237,224,0.55) 0 1px, transparent 1px 5px)",
            }}
            aria-hidden
          />
          <span>Hatched edge: the frontier&rsquo;s exact line isn&rsquo;t known</span>
        </div>
        <div className="mt-2 flex items-start gap-2 text-xs text-paper/70">
          <span className="mt-1.5 w-5 shrink-0 border-t border-dashed border-paper/60" aria-hidden />
          <span>Dashed outline: land a kingdom lost in the last 60 years</span>
        </div>
      </div>
    </div>
  );
}
