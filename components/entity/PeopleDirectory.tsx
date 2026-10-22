"use client";

import { useDeferredValue, useState } from "react";
import { fold } from "@/lib/utils/fold";

export type DirectoryGroup = {
  id: string;
  name: string;
  heading: React.ReactNode;
  rulers: { id: string; name: string; row: React.ReactNode }[];
};

/**
 * The rows and headings are rendered on the server and passed in; this
 * component only decides which to show. A kingdom's name matching keeps
 * its whole group, so typing "chola" lists every Chola ruler.
 */
export function PeopleDirectory({ groups }: { groups: DirectoryGroup[] }) {
  const [query, setQuery] = useState("");
  const q = fold(useDeferredValue(query).trim());
  const shown = groups
    .map((g) => (!q || fold(g.name).includes(q) ? g : { ...g, rulers: g.rulers.filter((r) => fold(r.name).includes(q)) }))
    .filter((g) => g.rulers.length > 0);
  const count = shown.reduce((n, g) => n + g.rulers.length, 0);

  return (
    <div>
      <label htmlFor="ruler-search" className="block font-sans text-sm text-ink-muted">
        Find a ruler or a kingdom
      </label>
      <input
        id="ruler-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="For example, Rajendra or Chola"
        autoComplete="off"
        spellCheck={false}
        className="mt-2 w-full max-w-md border border-border bg-paper-raised px-3 py-2 font-sans text-ink placeholder:text-ash focus:border-ink focus:outline-2 focus:outline-ink/20"
      />
      <p aria-live="polite" className="mt-2 font-sans text-sm text-ink-muted">
        {q
          ? count > 0 && `${count} ${count === 1 ? "ruler" : "rulers"} found`
          : `${count} rulers in ${groups.length} kingdoms`}
      </p>

      {!q && (
        <details className="mt-6 font-sans text-sm">
          <summary className="cursor-pointer text-ink hover:text-territory-selected">Jump to a kingdom</summary>
          <ul className="mt-3 columns-2 gap-x-8 sm:columns-3">
            {groups.map((g) => (
              <li key={g.id} className="py-1">
                <a href={`#${g.id}`} className="text-ink-muted hover:text-ink">
                  {g.name}
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}

      {q && shown.length === 0 && (
        <p className="mt-10 max-w-prose font-sans text-ink-muted">
          No ruler or kingdom matches &ldquo;{query.trim()}&rdquo;. Check the spelling, or type only part of the name.
        </p>
      )}

      {shown.map((g) => (
        <section
          key={g.id}
          id={g.id}
          aria-labelledby={`${g.id}-name`}
          className="mt-14 scroll-mt-24 [contain-intrinsic-size:auto_480px] [content-visibility:auto]"
        >
          {g.heading}
          <ul className="mt-2 sm:columns-2 sm:gap-x-12">
            {g.rulers.map((r) => (
              <li key={r.id} className="break-inside-avoid">
                {r.row}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
