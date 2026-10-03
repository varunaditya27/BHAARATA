import Link from "next/link";
import { Eyebrow } from "@/components/primitives/Eyebrow";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[600px] px-6 py-24 text-center">
      <Eyebrow>Not found</Eyebrow>
      <h1 className="mt-2 font-display text-4xl text-ink">
        This record doesn&rsquo;t exist in the atlas.
      </h1>
      <p className="mt-4 font-sans text-ink-muted">
        It may not have been written yet, or the path has changed.
      </p>
      <Link
        href="/atlas"
        className="mt-6 inline-block font-sans text-sm underline underline-offset-4 text-ink hover:text-territory-selected"
      >
        Return to the atlas →
      </Link>
    </div>
  );
}
