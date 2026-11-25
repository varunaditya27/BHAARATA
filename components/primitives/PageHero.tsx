import Image from "next/image";
import { RisingTitle } from "@/components/entity/RisingTitle";
import { KingdomStrip } from "@/components/primitives/KingdomStrip";
import type { Hero } from "@/lib/hero";

/**
 * The opening of a page: it fills the screen below the header, with a photograph behind it graded in the page's
 * own colour, the title set very large over it, and the colours of all the kingdoms along the foot.
 */
export function PageHero({
  title,
  intro,
  hero,
  size = "xl",
  children,
}: {
  title: string;
  intro: string;
  hero: Hero;
  /** "lg" for long titles. */
  size?: "xl" | "lg";
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate flex min-h-[calc(100dvh-4rem)] flex-col overflow-hidden text-[#f2f7fc]" style={{ backgroundColor: hero.color }}>
      <div className="bh-kenburns absolute inset-0 -z-10">
        <Image src={hero.file} alt={hero.alt} fill priority sizes="100vw" className="object-cover" />
      </div>
      <div className="absolute inset-0 -z-10" style={{ backgroundColor: hero.color, opacity: 0.8, mixBlendMode: "multiply" }} aria-hidden />
      <div className="absolute inset-0 -z-10" style={{ backgroundColor: hero.color, opacity: 0.3 }} aria-hidden />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 via-black/10 to-transparent" aria-hidden />

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-end px-6 pb-16 pt-24">
        <RisingTitle
          text={title}
          className={
            size === "xl"
              ? "text-[clamp(4.5rem,12vw,11.5rem)] leading-[0.86] tracking-[-0.035em]"
              : "text-[clamp(2.75rem,6vw,6rem)] leading-[0.95] tracking-[-0.025em]"
          }
        />
        <p className="mt-8 max-w-xl font-sans text-xl leading-relaxed">{intro}</p>
        {children}
      </div>

      {hero.credit && (
        <a
          href={hero.creditUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-5 right-6 font-sans text-[11px] text-[#f2f7fc]/80 underline underline-offset-2 hover:text-white"
        >
          Photo: {hero.credit}
        </a>
      )}
      <KingdomStrip />
    </section>
  );
}
