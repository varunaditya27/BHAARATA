import Link from "next/link";
import type { Facets, Filters } from "@/lib/search/advanced";

const field =
  "mt-1.5 w-full border border-border bg-paper-raised px-3 py-2 font-sans text-sm text-ink placeholder:text-ash focus:border-ink focus:outline-2 focus:outline-ink/20";
const label = "block font-sans text-sm font-medium text-ink";

function Group({ title, children, open = true }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-t border-ink/70 py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg text-ink [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden className="font-sans text-sm text-territory transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="mt-3 space-y-4">{children}</div>
    </details>
  );
}

function Select({ name, text, value, options, any = "Any" }: {
  name: string; text: string; value: string; options: { value: string; label: string }[]; any?: string;
}) {
  return (
    <label className={label}>
      {text}
      <select name={name} defaultValue={value} className={field}>
        <option value="">{any}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function Check({ name, text, checked, value = "1" }: { name: string; text: string; checked: boolean; value?: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 font-sans text-sm text-ink">
      <input type="checkbox" name={name} value={value} defaultChecked={checked} className="h-4 w-4 accent-territory" />
      {text}
    </label>
  );
}

function Years({ f, fromText = "From year", toText = "To year" }: { f: Filters; fromText?: string; toText?: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <label className={label}>
        {fromText}
        <input type="number" name="from" defaultValue={f.from ?? ""} placeholder="600" min={-3000} max={2100} className={field} />
      </label>
      <label className={label}>
        {toText}
        <input type="number" name="to" defaultValue={f.to ?? ""} placeholder="1700" min={-3000} max={2100} className={field} />
      </label>
    </div>
  );
}

function KingdomChecks({ name, selected, kingdoms }: { name: string; selected: string[]; kingdoms: Facets["kingdoms"] }) {
  return (
    <div className="max-h-48 space-y-1.5 overflow-y-auto border border-border bg-paper-raised p-3">
      {kingdoms.map((k) => (
        <Check key={k.id} name={name} value={k.id} text={k.name} checked={selected.includes(k.id)} />
      ))}
    </div>
  );
}

const asOptions = (values: string[]) => values.map((v) => ({ value: v, label: v }));

export function SearchFilters({ f, facets }: { f: Filters; facets: Facets }) {
  const kingdomOptions = facets.kingdoms.map((k) => ({ value: k.id, label: k.name }));
  const rulers = f.kind === "rulers";
  const kingdoms = f.kind === "kingdoms";
  const places = f.kind === "places";
  const events = f.kind === "events";

  return (
    <form action="/search" method="get" className="font-sans">
      <input type="hidden" name="kind" value={f.kind} />

      <label className={label} htmlFor="q">
        Words
      </label>
      <input
        id="q"
        type="search"
        name="q"
        defaultValue={f.q}
        placeholder={rulers ? "Rajendra, a title, a word in the story" : "A name or a word"}
        autoComplete="off"
        spellCheck={false}
        className={field}
      />

      {!places && (
        <Group title="When">
          <Years f={f} fromText={rulers ? "Reigned from" : "From year"} toText={rulers ? "Reigned until" : "To year"} />
        </Group>
      )}

      {(rulers || events) && (
        <Group title="Kingdom" open={f.kingdoms.length > 0}>
          <KingdomChecks name="kingdom" selected={f.kingdoms} kingdoms={facets.kingdoms} />
        </Group>
      )}

      {(rulers || kingdoms) && (
        <Group title={rulers ? "About their kingdom" : "About the kingdom"} open={Boolean(f.region || f.religion || f.language || f.type)}>
          <Select name="region" text="Region" value={f.region} options={asOptions(facets.regions)} />
          <Select name="religion" text="Religion" value={f.religion} options={asOptions(facets.religions)} />
          <Select name="language" text="Language" value={f.language} options={asOptions(facets.languages)} />
          <Select name="type" text="Kind of state" value={f.type} options={asOptions(facets.types)} />
        </Group>
      )}

      {rulers && (
        <Group title="About the ruler" open={Boolean(f.datesAre || f.hasSummary)}>
          <Select
            name="datesAre"
            text="The dates are"
            value={f.datesAre}
            options={[{ value: "reign", label: "A reign" }, { value: "life", label: "A lifetime" }]}
          />
          <Check name="hasSummary" text="Has a written summary" checked={f.hasSummary} />
        </Group>
      )}

      {kingdoms && (
        <Group title="About its records" open={Boolean(f.minRulers || f.hasEvents)}>
          <label className={label}>
            At least this many rulers
            <input type="number" name="minRulers" min={1} defaultValue={f.minRulers ?? ""} placeholder="5" className={field} />
          </label>
          <Check name="hasEvents" text="Has a battle or turning point" checked={f.hasEvents} />
        </Group>
      )}

      {places && (
        <Group title="About the place">
          <fieldset>
            <legend className={label}>Kind</legend>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {facets.placeKinds.map((p) => (
                <Check key={p.kind} name="placeKind" value={p.kind} text={`${p.kind} (${p.n})`} checked={f.placeKinds.includes(p.kind)} />
              ))}
            </div>
          </fieldset>
          <Select name="region" text="Region" value={f.region} options={asOptions(facets.placeRegions)} />
          <Check name="protected" text="Protected today" checked={f.protectedOnly} />
        </Group>
      )}

      {events && (
        <Group title="About the event" open={Boolean(f.category)}>
          <Select
            name="category"
            text="Kind"
            value={f.category}
            options={facets.eventCategories.map((c) => ({ value: c, label: c === "battle" ? "Battle" : c === "major_event" ? "Turning point" : c }))}
          />
        </Group>
      )}

      <Group
        title="Connected records"
        open={Boolean(f.during || f.contemporaryOf || f.borders || f.capitalOf || f.insideKingdom || f.reignOf)}
      >
        {rulers && (
          <>
            <Select
              name="during"
              text="Reigned during an event of their kingdom"
              value={f.during}
              options={[
                { value: "any", label: "Any event" },
                { value: "battle", label: "A battle" },
                { value: "major_event", label: "A turning point" },
              ]}
            />
            <Select name="contemporaryOf" text="Ruled at the same time as rulers of" value={f.contemporaryOf} options={kingdomOptions} />
          </>
        )}
        {kingdoms && <Select name="borders" text="Shared a border with" value={f.borders} options={kingdomOptions} />}
        {places && <Select name="capitalOf" text="Was the capital of" value={f.capitalOf} options={kingdomOptions} />}
        {(places || events) && (
          <>
            <Select name="insideKingdom" text="Lies inside the borders of" value={f.insideKingdom} options={kingdomOptions} />
            {places && (
              <label className={label}>
                In the year (leave empty for any year)
                <input type="number" name="insideYear" defaultValue={f.insideYear ?? ""} placeholder="1050" className={field} />
              </label>
            )}
          </>
        )}
        {events && (
          <label className={label}>
            During the reign of
            <input type="search" name="reignOf" defaultValue={f.reignOf} placeholder="Rajaraja" className={field} />
          </label>
        )}
      </Group>

      <div className="border-t border-ink/70 pt-4">
        <Select
          name="sort"
          text="Order"
          value={f.sort}
          any="Best match"
          options={[
            { value: "earliest", label: "Earliest first" },
            { value: "latest", label: "Latest first" },
            { value: "name", label: "By name" },
          ]}
        />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="submit"
          className="bg-territory px-5 py-2.5 font-sans text-sm font-medium text-paper-raised transition-colors hover:bg-territory-selected"
        >
          Show results
        </button>
        <Link href={`/search?kind=${f.kind}`} className="font-sans text-sm text-ink underline underline-offset-4 hover:text-territory-selected">
          Clear all
        </Link>
      </div>
    </form>
  );
}
