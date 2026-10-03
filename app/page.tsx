import Link from "next/link";
import { ButtonLink } from "@/components/primitives/Button";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Magnetic } from "@/components/primitives/Magnetic";
import { PageTransition } from "@/components/primitives/PageTransition";
import { HomeFilm } from "@/components/home/HomeFilm";
import { NAV_FORWARD } from "@/lib/utils/view-transition";

const entryPoints = [
  {
    href: "/atlas",
    title: "The atlas",
    description: "Drag the timeline and watch kingdoms grow, shrink and disappear.",
  },
  {
    href: "/chronology",
    title: "The chronology",
    description: "Every event in order, with each kingdom on its own line.",
  },
  {
    href: "/polities",
    title: "The kingdoms",
    description: "One page per kingdom: its rulers, places, neighbours and evidence.",
  },
];

export default function Home() {
  return (
    <PageTransition>
      <div>
        <HomeFilm />

        <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
          <div className="flex flex-col items-start gap-8 border-b border-border pb-14 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <Eyebrow>Explore it yourself</Eyebrow>
              <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Every year, every kingdom, on one map.</h2>
              <p className="mt-4 font-sans leading-relaxed text-ink-muted">
                Those were four moments. In the atlas you can move to any year from 600 to 1700, click a kingdom to
                read about it, and see what evidence each claim rests on.
              </p>
            </div>
            <Magnetic className="inline-block">
              <ButtonLink href="/atlas" transitionTypes={NAV_FORWARD} variant="solid">
                Open the atlas →
              </ButtonLink>
            </Magnetic>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {entryPoints.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                transitionTypes={NAV_FORWARD}
                className="group block border-t border-border pt-5"
              >
                <h3 className="font-display text-xl text-ink group-hover:text-territory-selected">{entry.title}</h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-ink-muted">{entry.description}</p>
              </Link>
            ))}
          </div>

          <p className="mt-12 font-sans text-xs text-ink-muted">
            Kingdom borders come from a research dataset; descriptions, rulers, battles and places from Wikipedia and
            Wikidata. Two things are still drawn by hand: the Chera outline and the example routes.{" "}
            <Link href="/method" className="underline underline-offset-4 hover:text-ink">
              Read why
            </Link>
            .
          </p>
        </section>
      </div>
    </PageTransition>
  );
}
