import { cn } from "@/lib/utils/cn";

const LETTERS = ["B", "H", "A", "R", "A", "T", "A"];
const MACRON_INDEX = 2;

/**
 * BHĀRATA, set letter by letter. Each letter rises in on a stagger; the
 * macron over the Ā is not part of the glyph but a separate stroke drawn
 * in after the last letter lands — the one signature flourish of the
 * brand. Screen readers get the real word with its diacritic.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex font-display leading-none", className)} aria-label="BHĀRATA" role="img">
      {LETTERS.map((ch, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] pt-[0.18em]" aria-hidden>
          <span
            className="bh-wordmark-letter relative inline-block"
            style={{ "--d": `${300 + i * 85}ms` } as React.CSSProperties}
          >
            {ch}
            {i === MACRON_INDEX && (
              <svg
                className="absolute left-[18%] top-[-0.03em] h-[0.06em] w-[64%] overflow-visible"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  y1="5"
                  x2="100"
                  y2="5"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeLinecap="round"
                  pathLength={100}
                  className="bh-macron-draw"
                  style={{ animationDelay: `${300 + LETTERS.length * 85 + 250}ms` }}
                />
              </svg>
            )}
          </span>
        </span>
      ))}
    </span>
  );
}
