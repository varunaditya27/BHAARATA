import { ButtonLink } from "@/components/primitives/Button";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { HeroPhoto } from "@/components/primitives/HeroPhoto";
import { Magnetic } from "@/components/primitives/Magnetic";
import { HeroReveal } from "@/components/home/HeroReveal";
import { images } from "@/lib/data/images";

const entryPoints = [
  {
    href: "/atlas",
    title: "Explore the Atlas",
    description: "Move through time and watch political geography change.",
  },
  {
    href: "/chronology",
    title: "Follow a Century",
    description: "Read events in sequence, grouped by period.",
  },
  {
    href: "/polities/chola",
    title: "Investigate a Kingdom",
    description: "Start from one entity and follow its evidence outward.",
  },
];

export default function Home() {
  return (
    <div>
      <HeroPhoto credit={images["vijayanagara-virupaksha"]} heightClassName="h-[88vh] min-h-[560px]">
        <div className="flex h-full flex-col justify-end">
          <div className="mx-auto w-full max-w-[1400px] px-6 pb-16">
            <HeroReveal>
              <Eyebrow className="text-paper/70">A source-aware, time-aware atlas</Eyebrow>
              <h1 className="mt-4 font-display text-6xl leading-[1.02] text-paper md:text-8xl">
                BHĀRATA
              </h1>
              <p className="mt-6 max-w-lg font-sans text-lg leading-relaxed text-paper/85">
                An atlas of the Indian subcontinent built around a single
                journey: place → polity → time → event → evidence → source.
              </p>
              <div className="mt-8 flex items-center gap-3 font-sans text-sm text-paper/70">
                <span>c. 750 CE</span>
                <span className="h-px w-16 bg-paper/40" aria-hidden />
                <span>c. 1565 CE</span>
              </div>
              <Magnetic className="mt-10 inline-block">
                <ButtonLink href="/atlas" variant="solid" className="bg-paper text-ink hover:bg-paper/90">
                  Explore the subcontinent ↓
                </ButtonLink>
              </Magnetic>
            </HeroReveal>
          </div>
        </div>
      </HeroPhoto>

      <div className="mx-auto max-w-[1400px] px-6">
        <section className="py-16">
          <Eyebrow>Begin with a time</Eyebrow>
          <div className="mt-6 grid gap-8 md:grid-cols-3">
            {entryPoints.map((entry) => (
              <a
                key={entry.href}
                href={entry.href}
                className="group block border-t border-border pt-5"
              >
                <h2 className="font-display text-xl text-ink group-hover:text-territory-selected">
                  {entry.title}
                </h2>
                <p className="mt-2 font-sans text-sm leading-relaxed text-ink-muted">
                  {entry.description}
                </p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
