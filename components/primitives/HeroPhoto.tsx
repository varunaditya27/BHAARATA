import Image from "next/image";
import type { ImageCredit } from "@/lib/data/images";

/**
 * Full-bleed hero treatment: darkened photo, gradient for text legibility,
 * credit tucked in the corner rather than a caption line (which would
 * break the cinematic effect this is for). For an inline/body photograph
 * with a normal caption, use CreditedImage instead.
 */
export function HeroPhoto({
  credit,
  children,
  heightClassName = "h-[46vh] min-h-[320px]",
  viewTransitionName,
}: {
  credit: ImageCredit;
  children: React.ReactNode;
  heightClassName?: string;
  /** Matches the name set on a list/preview thumbnail so the browser
   * morphs between them instead of cutting — see lib/utils/view-transition.ts. */
  viewTransitionName?: string;
}) {
  return (
    <div className={`relative w-full ${heightClassName}`}>
      <Image
        src={credit.file}
        alt={credit.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover brightness-[0.55]"
        style={viewTransitionName ? { viewTransitionName } : undefined}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/15 to-transparent">
        {children}
      </div>
      <a
        href={credit.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-4 font-sans text-[0.65rem] text-paper/60 hover:text-paper"
      >
        {credit.artist}, {credit.license}
      </a>
    </div>
  );
}
