/**
 * Covers the map until its first full frame is drawn: a compass whose
 * needle hunts for north, then the cover fades away. The needle settles
 * (no swing) under reduced motion — see .bh-needle in globals.css.
 */
export function MapLoading({ visible }: { visible: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#24201a] transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
    >
      <svg viewBox="-50 -50 100 100" className="h-24 w-24 text-paper" fill="none" aria-hidden>
        <circle r="44" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
        <circle r="38" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.6" />
        {Array.from({ length: 32 }, (_, i) => (
          <line
            key={i}
            y1={-44}
            y2={i % 8 === 0 ? -36 : i % 2 === 0 ? -40 : -42}
            stroke="currentColor"
            strokeOpacity={i % 8 === 0 ? 0.7 : 0.35}
            strokeWidth="0.8"
            transform={`rotate(${i * 11.25})`}
          />
        ))}
        <text y="-25" textAnchor="middle" fontSize="9" fill="currentColor" className="font-display">
          N
        </text>
        <g className="bh-needle">
          <path d="M0 -30 L5 0 L0 4 L-5 0 Z" fill="#c4553a" />
          <path d="M0 30 L5 0 L0 -4 L-5 0 Z" fill="currentColor" fillOpacity="0.55" />
          <circle r="2" fill="#24201a" stroke="currentColor" strokeWidth="0.8" />
        </g>
      </svg>
      <p className="mt-5 font-sans text-sm text-paper/70">Loading the map…</p>
    </div>
  );
}
