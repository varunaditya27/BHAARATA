import Image from "next/image";
import type { ImageCredit } from "@/lib/domain/types";

/**
 * Full-bleed hero treatment: the photo fills the screen below the header, graded in the record's own colour, with a
 * gradient for text legibility and the credit tucked in the corner rather than a caption line (which would break
 * the cinematic effect this is for).
 */
export function HeroPhoto({
  credit,
  children,
  tint,
}: {
  credit: ImageCredit;
  children: React.ReactNode;
  /** The colour the photograph is graded in. */
  tint: string;
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
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0" style={{ backgroundColor: tint, opacity: 0.8, mixBlendMode: "multiply" }} aria-hidden />
      <div className="absolute inset-0" style={{ backgroundColor: tint, opacity: 0.3 }} aria-hidden />
    </div>
  );

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] w-full overflow-hidden">
      {photo}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent">
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
