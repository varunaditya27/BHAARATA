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
    title: "Explore the Atlas",
    description: "Move through time and watch political geography change.",
  },
  {
    href: "/chronology",
    title: "Follow a Century",
    description: "Read events in sequence, kingdom by kingdom.",
  },
  {
    href: "/polities/chola",
    title: "Investigate a Kingdom",
    description: "Start from one kingdom and follow its evidence outward.",
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
              <Eyebrow>Now it&rsquo;s yours</Eyebrow>
              <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Every year, every kingdom, on one map.</h2>
              <p className="mt-4 font-sans leading-relaxed text-ink-muted">
                The four chapters above are one path through the atlas. The atlas itself lets you drag through
                all nine and a half centuries, open any kingdom, and trace a claim back to the evidence behind it.
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
            The records behind these pages are illustrative prototype data — see{" "}
            <Link href="/method" className="underline underline-offset-4 hover:text-ink">
              Method
            </Link>{" "}
            for what that means.
          </p>
        </section>
      </div>
    </PageTransition>
  );
}
