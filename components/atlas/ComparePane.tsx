"use client";

import type { Map as MapLibreMap } from "maplibre-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import { HistoricalMap } from "@/components/map/HistoricalMap";
import type { LayerToggleId } from "@/components/map/MapLegend";
import { getEraForYear, PROTOTYPE_YEAR_RANGE } from "@/lib/geo/historical-state";

function sameCamera(from: MapLibreMap, to: MapLibreMap) {
  to.jumpTo({ center: from.getCenter(), zoom: from.getZoom(), bearing: from.getBearing(), pitch: from.getPitch() });
}

/**
 * The left half of compare view: a second map at its own year, its camera
 * locked to the main map's in both directions (a flag stops the two
 * echoing each other). The main timeline still drives the right-hand map;
 * this pane has its own small year slider.
 */
export function ComparePane({
  leaderRef,
  initialYear,
  visibleLayers,
  onClose,
}: {
  leaderRef: React.RefObject<MapLibreMap | null>;
  initialYear: number;
  visibleLayers: Set<LayerToggleId>;
  onClose: () => void;
}) {
  const { min, max } = PROTOTYPE_YEAR_RANGE;
  const [year, setYear] = useState(initialYear);
  const [ready, setReady] = useState(false);
  const selfRef = useRef<MapLibreMap | null>(null);
  const handleReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    if (!ready) return;
    let detach = () => {};
    // The main map may still be loading when this one is ready (refs don't
    // re-run effects), so wait for it before linking the two cameras.
    const attach = () => {
      const leader = leaderRef.current;
      const self = selfRef.current;
      if (!leader || !self) return false;
      let syncing = false;
      const follow = (from: MapLibreMap, to: MapLibreMap) => () => {
        if (syncing) return;
        syncing = true;
        sameCamera(from, to);
        syncing = false;
      };
      const fromLeader = follow(leader, self);
      const fromSelf = follow(self, leader);
      fromLeader();
      leader.on("move", fromLeader);
      self.on("move", fromSelf);
      detach = () => {
        leader.off("move", fromLeader);
        self.off("move", fromSelf);
      };
      return true;
    };
    const poll = attach() ? undefined : setInterval(() => attach() && clearInterval(poll), 150);
    return () => {
      clearInterval(poll);
      detach();
    };
  }, [ready, leaderRef]);

  return (
    <div className="relative hidden flex-1 overflow-hidden border-r-2 border-ink md:block">
      <HistoricalMap
        year={year}
        selectedPolityId={null}
        onSelectPolity={() => {}}
        visibleLayers={visibleLayers}
        onReady={handleReady}
        instanceRef={selfRef}
      />
      <div className="bh-map-grain pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
        <p className="bg-ink/85 px-3 py-1 font-display text-lg text-paper">
          {year} CE <span className="ml-1 font-sans text-[0.65rem] uppercase tracking-[0.16em] text-paper/60">{getEraForYear(year)}</span>
        </p>
      </div>
      <div className="absolute inset-x-6 bottom-16 z-10 flex items-center gap-3 bg-ink/85 px-3 py-2">
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          aria-label="Year for the left-hand map"
          aria-valuetext={`${year} CE`}
          className="bh-timeline-range flex-1"
          style={{ "--bh-progress": `${((year - min) / (max - min)) * 100}%` } as React.CSSProperties}
        />
        <button onClick={onClose} className="shrink-0 font-sans text-xs text-paper/70 underline underline-offset-4 hover:text-paper">
          Close comparison (V)
        </button>
      </div>
    </div>
  );
}
