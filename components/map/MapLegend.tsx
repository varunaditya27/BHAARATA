"use client";

import { Layers } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export type LayerToggleId = "territory" | "places" | "routes";

const LAYER_OPTIONS: { id: LayerToggleId; label: string }[] = [
  { id: "territory", label: "Political territory" },
  { id: "places", label: "Major settlements" },
  { id: "routes", label: "Trade & campaign routes" },
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
        <p className="text-[0.65rem] uppercase tracking-wide text-paper/60">Map layers</p>
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
      </div>
    </div>
  );
}
