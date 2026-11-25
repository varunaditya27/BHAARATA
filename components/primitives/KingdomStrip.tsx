"use client";

import { useAtlasData } from "@/components/layout/AtlasDataProvider";

/** One flat band of colour per kingdom, in the order they arose: the whole atlas as a spectrum, along the foot of a header. */
export function KingdomStrip() {
  const { polities } = useAtlasData();
  const ordered = [...polities].sort((a, b) => a.period.startYear - b.period.startYear);
  return (
    <div className="flex h-2 w-full" aria-hidden>
      {ordered.map((p) => (
        <span key={p.id} className="flex-1" style={{ backgroundColor: p.accentColor }} />
      ))}
    </div>
  );
}
