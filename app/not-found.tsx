import Link from "next/link";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { PageTransition } from "@/components/primitives/PageTransition";

/** Engraved-style sea: rows of short wave strokes, offset like a woodcut. */
const WAVES = Array.from({ length: 5 }, (_, row) =>
  Array.from({ length: 7 }, (_, i) => {
    const x = 20 + i * 54 + (row % 2) * 27;
    const y = 150 + row * 11;
    return `M${x} ${y} q6 -5 12 0 t12 0`;
  }),
).flat();

/** A sea serpent in ink line, the way old charts marked waters nobody had mapped. */
const SERPENT = [
  // tail curl
  "M70 146 C62 122 44 114 32 120 C22 126 26 138 36 135 C42 133 42 126 37 125",
  // first coil
  "M96 146 C100 104 142 104 146 146",
  // second coil, larger
  "M176 146 C181 86 233 86 238 146",
  // neck and head
  "M268 146 C266 104 278 74 304 66 C320 61 336 66 342 78 C334 82 322 83 312 81 C300 88 292 112 296 146",
  // jaw
  "M342 78 C338 86 326 90 314 88",
  // spines along the second coil
  "M192 104 l-4 -10 M206 95 l-1 -11 M220 96 l3 -10 M231 106 l6 -8",
  // fin on the first coil
  "M112 118 c-6 -10 -2 -16 4 -18 c0 6 2 10 6 12",
];

export default function NotFound() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-[720px] px-4 py-20 text-center sm:px-6">
        <svg viewBox="0 0 400 210" className="mx-auto w-full max-w-md text-ink" fill="none" aria-hidden>
          <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {SERPENT.map((d, i) => (
              <path key={i} d={d} pathLength={100} className="bh-line-draw" style={{ animationDelay: `${200 + i * 180}ms` }} />
            ))}
            <circle cx="324" cy="72" r="1.6" fill="currentColor" className="bh-fade-in" style={{ animationDelay: "1600ms" }} />
          </g>
          <g stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.45">
            {WAVES.map((d, i) => (
              <path key={i} d={d} pathLength={100} className="bh-line-draw" style={{ animationDelay: `${(i % 7) * 60}ms` }} />
            ))}
          </g>
          {/* compass rose */}
          <g transform="translate(372 30)" stroke="currentColor" strokeWidth="0.8" opacity="0.6">
            <circle r="14" />
            <path d="M0 -20 L3 -3 L0 0 L-3 -3 Z M0 20 L3 3 L0 0 L-3 3 Z M-20 0 L-3 -3 L0 0 L-3 3 Z M20 0 L3 -3 L0 0 L3 3 Z" fill="currentColor" fillOpacity="0.15" />
            <text y="-24" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none" className="font-display">
              N
            </text>
          </g>
        </svg>

        <Eyebrow className="mt-10">Page not found</Eyebrow>
        <h1 className="mt-2 font-display text-5xl text-ink">Uncharted waters</h1>
        <p className="mx-auto mt-4 max-w-md font-sans text-ink-muted">
          There&rsquo;s nothing at this address. The page may have moved, or it was never drawn. Old mapmakers put a
          sea serpent here.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 font-sans text-sm">
          <Link href="/atlas" className="text-ink underline underline-offset-4">
            Open the atlas
          </Link>
          <Link href="/polities" className="text-ink underline underline-offset-4">
            Browse kingdoms
          </Link>
          <Link href="/" className="text-ink-muted underline underline-offset-4 hover:text-ink">
            Home page
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
