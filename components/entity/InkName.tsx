import { cn } from "@/lib/utils/cn";

/**
 * A native-script name that appears the way it would be written: an ink
 * mask sweeps across it left to right (the reading direction of Tamil,
 * Kannada, and Telugu alike), softened at the leading edge so it reads as
 * a brush moving rather than a wipe. See .bh-ink-write in globals.css.
 */
export function InkName({ text, lang = "und", className, delayMs = 700 }: { text: string; lang?: string; className?: string; delayMs?: number }) {
  return (
    <p lang={lang} className={cn("font-indic-display", className)}>
      <span className="bh-ink-write inline-block" style={{ animationDelay: `${delayMs}ms` }}>
        {text}
      </span>
    </p>
  );
}
