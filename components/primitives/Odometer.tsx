import { cn } from "@/lib/utils/cn";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * A year rendered as rolling mechanical digits: each place is a column of
 * 0–9 translated to the current digit, so a change from 1014 to 1255
 * reads as the counter turning rather than the text swapping. Pure
 * CSS transforms — reduced motion collapses the transition globally.
 */
export function Odometer({ value, className, suffix }: { value: number; className?: string; suffix?: string }) {
  const text = String(Math.abs(Math.round(value)));
  return (
    <span className={cn("inline-flex items-baseline tabular-nums", className)} aria-label={`${text}${suffix ? ` ${suffix}` : ""}`}>
      <span className="inline-flex overflow-hidden" style={{ height: "1em", lineHeight: 1 }} aria-hidden>
        {text.split("").map((ch, i) => (
          <span key={`${text.length}-${i}`} className="relative inline-block" style={{ width: "0.62em" }}>
            <span
              className="absolute inset-x-0 top-0 flex flex-col items-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translateY(-${Number(ch)}em)`, transitionDelay: `${(text.length - 1 - i) * 40}ms` }}
            >
              {DIGITS.map((d) => (
                <span key={d} className="block h-[1em] leading-none">
                  {d}
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
      {suffix && (
        <span className="ml-[0.25em] text-[0.42em] uppercase tracking-[0.2em]" aria-hidden>
          {suffix}
        </span>
      )}
    </span>
  );
}
