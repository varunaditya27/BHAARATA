import Image from "next/image";
import type { ImageCredit } from "@/lib/data/images";
import { cn } from "@/lib/utils/cn";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/**
 * A photograph framed the way an atlas or museum catalogue prints one:
 * a numbered plate, a thin keyline inset from the edge, and a caption
 * line with the credit set apart from the description.
 */
export function Plate({
  credit,
  number,
  caption,
  className,
  sizes = "(min-width: 768px) 480px, 100vw",
  aspect = "aspect-[4/3]",
}: {
  credit: ImageCredit;
  number: number;
  caption?: string;
  className?: string;
  sizes?: string;
  aspect?: string;
}) {
  return (
    <figure className={cn("group", className)}>
      <div className={cn("relative overflow-hidden bg-stone", aspect)}>
        <Image
          src={credit.file}
          alt={credit.alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
        <span className="pointer-events-none absolute inset-2 border border-paper/45" aria-hidden />
      </div>
      <figcaption className="mt-2 flex gap-3 font-sans text-xs text-ink-muted">
        <span className="shrink-0 font-display text-sm text-ink">Plate {ROMAN[number - 1] ?? number}</span>
        <span>
          {caption ?? credit.title}
          <a
            href={credit.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 whitespace-nowrap underline underline-offset-2 hover:text-ink"
          >
            {credit.artist}, {credit.license}
          </a>
        </span>
      </figcaption>
    </figure>
  );
}
