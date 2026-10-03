"use client";

import type { Polity } from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";
import { lightenHex } from "@/lib/utils/color";

/**
 * Phone-width stand-in for AtlasSidebar: the kingdoms present in the
 * current year as a thumb-scrollable row over the map. Kingdoms not
 * active this year are left out rather than dimmed — on a 390px screen
 * there isn't room to show what *isn't* there.
 */
export function KingdomChips({
  allPolities,
  activePolityIds,
  selectedPolityId,
  onSelectPolity,
}: {
  allPolities: Polity[];
  activePolityIds: Set<string>;
  selectedPolityId: string | null;
  onSelectPolity: (polityId: string) => void;
}) {
  const active = allPolities.filter((p) => activePolityIds.has(p.id));

  return (
    <div className="scrollbar-dark absolute inset-x-0 top-0 z-10 flex gap-2 overflow-x-auto px-3 py-2.5 [scrollbar-width:none] md:hidden">
      {active.length === 0 && (
        <span className="bg-ink/85 px-3 py-1.5 font-sans text-xs text-paper/70">
          No kingdoms recorded for this year
        </span>
      )}
      {active.map((polity) => (
        <button
          key={polity.id}
          onClick={() => onSelectPolity(polity.id)}
          className={cn(
            "flex shrink-0 items-center gap-2 border px-3 py-1.5 font-sans text-xs backdrop-blur-sm transition-colors",
            selectedPolityId === polity.id
              ? "border-paper bg-paper text-ink"
              : "border-paper/25 bg-ink/85 text-paper",
          )}
        >
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: lightenHex(polity.accentColor, 0.25) }} aria-hidden />
          {polity.name}
        </button>
      ))}
    </div>
  );
}
