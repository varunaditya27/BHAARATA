"use client";

import * as Popover from "@radix-ui/react-popover";
import { Layers } from "lucide-react";
import { SITE_COLORS } from "@/components/map/mapStyle";

export type LayerToggleId = "territory" | "places" | "routes" | "relief" | "battles" | "sites" | "monuments";

const LAYER_OPTIONS: { id: LayerToggleId; label: string }[] = [
  { id: "territory", label: "Kingdoms" },
  { id: "places", label: "Cities and places" },
  { id: "routes", label: "Two example routes, drawn by hand with no source" },
  { id: "relief", label: "Hills and rivers" },
  { id: "battles", label: "Battles" },
  { id: "sites", label: "Old buildings, from the year they were built" },
  { id: "monuments", label: "Monuments protected today, with no dates" },
];

export const LAYER_TOGGLE_IDS = LAYER_OPTIONS.map((o) => o.id);

/**
 * Every checkbox here controls a real MapLibre layer's visibility — see
 * the `visibleLayers` prop on HistoricalMap. Don't add a toggle that
 * doesn't actually control something: a control that does nothing is
 * decoration, and decoration here would be a small lie.
 * Closed by default at every width, so the map keeps its space. Radix
 * gives the panel role="dialog", which also pauses the atlas shortcuts.
 */
export function MapLegend({
  visible,
  onToggle,
}: {
  visible: Set<LayerToggleId>;
  onToggle: (id: LayerToggleId) => void;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger className="flex items-center gap-2 border border-paper/25 bg-ink px-3 py-1.5 font-sans text-sm text-paper hover:border-paper/50 data-[state=open]:border-paper/60">
        <Layers size={14} aria-hidden />
        Layers
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className="z-30 w-64 border border-paper/20 bg-ink p-4 font-sans text-sm text-paper"
        >
          <p className="text-xs text-paper/60">Show on the map</p>
          <ul className="mt-2 space-y-2">
            {LAYER_OPTIONS.map((opt) => (
              <li key={opt.id}>
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={visible.has(opt.id)}
                    onChange={() => onToggle(opt.id)}
                    className="mt-0.5 accent-territory"
                  />
                  {opt.label}
                </label>
              </li>
            ))}
          </ul>
          {visible.has("sites") && (
            <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-paper/15 pt-3 text-xs text-paper/70" aria-label="Colours of old buildings">
              {Object.entries(SITE_COLORS).map(([kind, color]) => (
                <li key={kind} className="flex items-center gap-1.5 capitalize">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
                  {kind}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex items-start gap-2.5 border-t border-paper/15 pt-3 text-xs text-paper/70">
            <span
              className="mt-0.5 h-3 w-5 shrink-0 border border-paper/40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, rgba(243,237,224,0.55) 0 1px, transparent 1px 5px)",
              }}
              aria-hidden
            />
            <span>A hatched edge means nobody knows exactly where the border ran.</span>
          </div>
          <div className="mt-2 flex items-start gap-2.5 text-xs text-paper/70">
            <span className="mt-1.5 w-5 shrink-0 border-t border-dashed border-paper/60" aria-hidden />
            <span>A dashed outline shows land the kingdom lost in the last 60 years.</span>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
