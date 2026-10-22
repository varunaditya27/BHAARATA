"use client";

import { useMemo, useState } from "react";
import { formatDateRange } from "@/lib/domain/time";
import type { Polity } from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";
import { lightenHex } from "@/lib/utils/color";
import { KingdomEmblem } from "@/components/entity/KingdomEmblem";

export type AtlasSidebarProps = {
  allPolities: Polity[];
  activePolityIds: Set<string>;
  selectedPolityId: string | null;
  onSelectPolity: (polityId: string) => void;
};

/**
 * Lists every polity (dimmed if inactive in the current year, highlighted
 * if active) so the sidebar also works as a browsable index, not just a
 * mirror of what's on screen. The filter box is a real client-side filter
 * — not a non-functional search decoy.
 */
export function AtlasSidebar({
  allPolities,
  activePolityIds,
  selectedPolityId,
  onSelectPolity,
}: AtlasSidebarProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allPolities;
    return allPolities.filter((p) => p.name.toLowerCase().includes(q));
  }, [allPolities, query]);

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-paper/10 bg-ink md:flex">
      <div className="p-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a kingdom…"
          aria-label="Find a kingdom"
          className="w-full border border-paper/20 bg-ink px-3 py-2 font-sans text-sm text-paper placeholder:text-paper/40 focus:border-paper/60 focus:outline-2 focus:outline-paper/60"
        />
      </div>
      <div className="flex items-center justify-between px-4 font-sans text-xs text-paper/50">
        <span>Kingdoms</span>
        <span>{allPolities.length}</span>
      </div>
      <ul className="scrollbar-dark mt-2 flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
        {filtered.map((polity) => {
          const isActive = activePolityIds.has(polity.id);
          const isSelected = selectedPolityId === polity.id;
          return (
            <li key={polity.id}>
              <button
                onClick={() => onSelectPolity(polity.id)}
                className={cn(
                  "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left font-sans text-sm transition-colors",
                  isSelected ? "bg-paper/10" : "hover:bg-paper/5",
                  isActive ? "text-paper" : "text-paper/35",
                )}
              >
                <span className="flex items-center gap-2.5">
                  <KingdomEmblem
                    polityId={polity.id}
                    color={lightenHex(polity.accentColor, 0.25)}
                    className={cn("h-5 w-5 transition-opacity", isActive ? "opacity-100" : "opacity-30")}
                  />
                  {polity.name}
                </span>
                <span className="pl-[1.875rem] text-xs text-paper/40">{formatDateRange(polity.period)}</span>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="px-3 py-2 font-sans text-sm text-paper/40">No kingdoms match “{query}”.</li>
        )}
      </ul>
    </aside>
  );
}
