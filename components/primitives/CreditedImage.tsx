import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { ImageCredit } from "@/lib/data/images";

/**
 * Every photograph in BHĀRATA carries its credit — archival/museum
 * convention, and a direct expression of the evidence policy (every
 * image, like every claim, traces back to a source). Don't render a
 * <CreditedImage> without this caption; don't render next/image directly
 * elsewhere for sourced photography.
 *
 * `frameClassName` sizes the image area (it needs an explicit height or
 * aspect-ratio for `fill` to work) — `className` is for the outer
 * <figure> (margins, grid placement), not sizing.
 */
export function CreditedImage({
  credit,
  className,
  frameClassName = "aspect-[4/3]",
  imageClassName,
  priority,
  sizes,
  caption,
}: {
  credit: ImageCredit;
  className?: string;
  frameClassName?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  caption?: string;
}) {
  return (
    <figure className={className}>
      <div className={cn("relative overflow-hidden bg-stone", frameClassName)}>
        <Image
          src={credit.file}
          alt={credit.alt}
          fill
          sizes={sizes ?? "100vw"}
          priority={priority}
          className={cn("object-cover", imageClassName)}
        />
      </div>
      <figcaption className="mt-2 font-sans text-xs text-ink-muted">
        {caption ?? credit.title} ·{" "}
        <a
          href={credit.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-ink"
        >
          {credit.artist}, {credit.license}
        </a>
      </figcaption>
    </figure>
  );
}
