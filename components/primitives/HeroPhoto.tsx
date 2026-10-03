import Image from "next/image";
import { Shared } from "@/components/primitives/Shared";
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
  sharedName,
}: {
  credit: ImageCredit;
  children: React.ReactNode;
  heightClassName?: string;
  /** Matches the name on a list/preview thumbnail so the photo morphs
   * between routes — see lib/utils/view-transition.ts. */
  sharedName?: string;
}) {
  const photo = (
    <div className="bh-kenburns absolute inset-0 overflow-hidden">
      <div className="bh-parallax absolute inset-0">
        <Image
          src={credit.file}
          alt={credit.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover brightness-[0.55]"
        />
      </div>
    </div>
  );

  return (
    <div className={`relative w-full overflow-hidden ${heightClassName}`}>
      {sharedName ? <Shared name={sharedName}>{photo}</Shared> : photo}
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
