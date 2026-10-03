/**
 * A static, decorative evocation of coastline/graticule — not a map.
 * Deliberately not MapLibre: the homepage must not pay WebGL's cost just
 * to set a mood (see IMPLEMENTATION_PLAN.md §37, performance architecture).
 * The real interactive map lives at /atlas.
 */
export function CoastlineGraphic({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 400"
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect width="600" height="400" fill="var(--bh-paper)" />
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1={0}
          x2={600}
          y1={i * 50}
          y2={i * 50}
          stroke="var(--bh-stone)"
          strokeWidth={0.5}
        />
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={`v-${i}`}
          x1={i * 50}
          x2={i * 50}
          y1={0}
          y2={400}
          stroke="var(--bh-stone)"
          strokeWidth={0.5}
        />
      ))}
      <path
        d="M80,40 C140,70 120,140 180,160 C240,180 220,250 280,270 C320,284 300,330 340,360"
        fill="none"
        stroke="var(--bh-water-deep)"
        strokeWidth={1.5}
      />
      <path
        d="M420,20 C460,60 400,110 440,150 C480,190 430,230 470,280 C500,318 470,350 500,380"
        fill="none"
        stroke="var(--bh-water-deep)"
        strokeWidth={1.5}
      />
      {[
        [150, 120],
        [260, 210],
        [340, 300],
        [430, 170],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={2.5} fill="var(--bh-territory)" />
      ))}
    </svg>
  );
}
