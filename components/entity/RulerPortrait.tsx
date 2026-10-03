import Image from "next/image";
import { images, type ImageKey } from "@/lib/data/images";
import { cn } from "@/lib/utils/cn";

/**
 * Real photograph of a historically-attributed artifact when one exists
 * (a donated statue, a temple mural traditionally identified as the
 * ruler). Never a fabricated "likeness" — where no such photograph
 * exists, this renders a plain initial instead of inventing a face.
 */
export function RulerPortrait({
  imageKey,
  name,
  accentColor,
  className,
}: {
  imageKey?: string;
  name: string;
  accentColor?: string;
  className?: string;
}) {
  const credit = imageKey ? images[imageKey as ImageKey] : undefined;

  if (!credit) {
    return (
      <div
        className={cn(
          "flex aspect-square items-center justify-center border border-border bg-paper-raised font-display text-2xl text-ink-muted",
          className,
        )}
        style={accentColor ? { color: accentColor } : undefined}
        aria-hidden
      >
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-square overflow-hidden bg-stone", className)}>
      <Image src={credit.file} alt={credit.alt} fill sizes="200px" className="object-cover" />
    </div>
  );
}
