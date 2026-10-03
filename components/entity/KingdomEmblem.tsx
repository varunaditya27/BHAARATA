import { polityGeometry, silhouettePath } from "@/lib/geo/silhouette";
import { cn } from "@/lib/utils/cn";
import { darkenHex } from "@/lib/utils/color";

/**
 * A kingdom's own outline, used as its mark wherever it's listed — the
 * index, search, record headers, share images. Drawn from the same
 * geometry the atlas renders (so it's real data, not a decorative icon),
 * filled in the kingdom's colour with a darker rule, like a cut-out from
 * the map. `draw` strokes it in on first paint (see .bh-emblem-draw).
 */
export function KingdomEmblem({
  polityId,
  color,
  className,
  draw = false,
  title,
}: {
  polityId: string;
  color: string;
  className?: string;
  draw?: boolean;
  title?: string;
}) {
  const geometry = polityGeometry(polityId);
  if (!geometry) return null;
  const d = silhouettePath(geometry);
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path
        d={d}
        fill={color}
        fillOpacity={0.82}
        stroke={darkenHex(color, 0.35)}
        strokeWidth={1.6}
        strokeLinejoin="round"
        pathLength={100}
        className={draw ? "bh-emblem-draw" : undefined}
      />
    </svg>
  );
}
