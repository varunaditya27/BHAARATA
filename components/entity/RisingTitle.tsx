import { cn } from "@/lib/utils/cn";

/**
 * A heading whose letters rise out of a clipped baseline on a short
 * stagger (same motion as the homepage wordmark). Words stay unbroken
 * for wrapping; screen readers get the plain string.
 */
export function RisingTitle({
  text,
  className,
  delayMs = 120,
  as: Tag = "h1",
}: {
  text: string;
  className?: string;
  delayMs?: number;
  as?: "h1" | "h2";
}) {
  let index = 0;
  return (
    <Tag className={cn("font-display", className)} aria-label={text}>
      {text.split(" ").map((word, w) => (
        <span key={w} className="inline-block whitespace-nowrap" aria-hidden>
          {word.split("").map((ch) => {
            const i = index++;
            return (
              <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                <span className="bh-letter-rise inline-block" style={{ animationDelay: `${delayMs + i * 45}ms` }}>
                  {ch}
                </span>
              </span>
            );
          })}
          {w < text.split(" ").length - 1 && <span className="inline-block w-[0.28em]" />}
        </span>
      ))}
    </Tag>
  );
}
