import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Rule } from "@/components/primitives/Rule";

export const metadata = {
  title: "Method — BHĀRATA",
};

export default function MethodPage() {
  return (
    <div className="mx-auto max-w-[680px] px-6 py-16">
      <Eyebrow>How this corpus is built</Eyebrow>
      <h1 className="mt-2 font-display text-4xl text-ink">Method</h1>

      <Rule className="mt-8" />

      <section className="mt-8 space-y-4 font-sans leading-relaxed text-ink">
        <p>
          BHĀRATA is currently in its frontend-foundation phase. Every
          polity, place, boundary, and event visible right now is{" "}
          <strong>illustrative prototype data</strong> — hand-authored to
          exercise the map and chronology engines, not sourced from verified
          historical scholarship.
        </p>
        <p>
          Nothing here should be cited as fact. Boundary geometry in
          particular is a coarse approximation of a historical heartland,
          not a reconstruction of an actual frontier in a given year.
        </p>
        <p>
          The real data model — polities, people, places, events, claims,
          evidence, and sources, each carrying explicit provenance and
          uncertainty — is specified in <code>PROJECT_BIBLE.md</code> and
          will be backed by PostgreSQL/PostGIS in a later phase.
        </p>
      </section>
    </div>
  );
}
