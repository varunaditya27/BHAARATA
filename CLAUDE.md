<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# BHĀRATA — agent rules

Working rules for AI coding agents on this repository (`CLAUDE.md` mirrors this
file). People should start with [`README.md`](README.md).

## Read this first

| Before you… | Read |
|---|---|
| Touch product identity, tone, the domain model or what counts as "done" | [`PROJECT_BIBLE.md`](PROJECT_BIBLE.md) — the product canon |
| Change how the app is structured, or the map | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Add, import or relabel data | [`docs/DATA.md`](docs/DATA.md) |
| Change how anything looks, moves or reads | [`docs/DESIGN.md`](docs/DESIGN.md) |
| Run, build, deploy or debug | [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) |
| Pick up work | [`docs/BACKLOG.md`](docs/BACKLOG.md) |

`PROJECT_BIBLE.md` says *what* BHĀRATA is and must stay; the `docs/` folder says
*how* it is built today. If they disagree about the product, the Bible wins; if
they disagree about the code, the code and `docs/` win — and fix the doc.

## What BHĀRATA is

Not a SaaS dashboard, not a Wikipedia clone, not a chatbot with a history skin.
It is a source-aware, time-aware atlas whose core loop is:

> place → kingdom → time → event → evidence → source

The interface should make relationships in the data visible — not just display
records. See `PROJECT_BIBLE.md` §1–4 and §20 (non-negotiables) before adding any
feature.

## Current state

Read this before assuming anything is wired up. The detail is in `docs/DATA.md`.

- **Built:** the homepage film (globe, starfield, orbital descent, four scroll
  chapters); the Atlas (time scrubber, layers, hover, echoes, routes with moving
  ships, capital seals, battles, optional monuments, river flow, era tint,
  keyboard shortcuts, cinema view, compare two years, save as image, opt-in era
  sound); the Chronology (kingdom lanes, battles by period); Kingdom, People,
  Places and Evidence pages; the database browser and connections diagram; the ⌘K search (with year jump and recent items);
  share images per kingdom; Method (with credits); a colophon footer; a 404 page.
- **Data comes from three kinds of source, and every page says which:**
  - *Cliopatria* (CC BY 4.0): 54 kingdoms, 465 dated border shapes, 600–1700.
    Borders are one researched version of each territory, not exact frontiers.
  - *Wikidata / Wikipedia / Wikimedia Commons* (CC0 / CC BY-SA / per-file free
    licences): capitals, 26 geolocated battles, 154 protected monuments, 606 rulers, 344 dated sites,
    native-script names, summaries and photographs.
  - *Curated historical text* in PostgreSQL (`prisma/seed.sql`): the summaries of the 11
    curated kingdoms, 11 rulers, nine turning points. Each statement was
    checked against the Wikipedia article named in its provenance; keep it that
    way (check before editing, cite the article).
  - *Not researched, and labelled so:* Chera's outline and the two example
    routes, which are drawn by hand.
- **Evidence:** two real translations (*South Indian Inscriptions* Vol. II nos. 85
  and 88), each read from the printed page. There is no Tamil transcription:
  the scan's machine-read Tamil is garbled and must not be used.
- **Database:** PostgreSQL + PostGIS is the single source of truth (`prisma/schema.prisma`, `prisma/seed.sql`, `scripts/seed.mjs`). See `docs/DATABASE.md`.
- **Checks:** `npm run db:check` (`scripts/check-database.mjs`) verifies all 17 tables, PostGIS geometries, referential links, and domain schemas.
- **Not built:** IIIF, PMTiles, or a citation layer down to page
  numbers. See `docs/BACKLOG.md`.
- The git branch `legacy/frontend-v1` holds a prior, deliberately parked attempt.
  Don't pull from it without being asked.

## Architecture boundaries

```
lib/domain      Zod schemas + types (Polity, Person, Place, Event, Evidence, DateRange…), date formatting
lib/data        atlas-server.ts and read-atlas.ts read PostgreSQL directly
lib/geo         getHistoricalState(year, data), GeoJSON conversion, point-in-polygon, route motion
components/primitives   Small, logic-free pieces (Eyebrow, Rule, Badge, Plate, Odometer…). No app logic
components/map          The only code that touches MapLibre. React never re-renders the map;
                        it calls setFeatureState / setFilter / flyTo
components/atlas, chronology, entity, evidence, home, search, layout   Compose primitives and the map
app/*           Routes. Server components by default; "use client" only where interaction needs it
scripts/        Database seeding (seed.mjs), integrity checks (check-database.mjs), and MapLibre worker copy
```

Dependencies point down: routes → feature components → map/primitives → `lib/geo`
→ `lib/data` → `lib/domain`. Keep domain logic (date formatting, year-range
tests) in `lib/`, not in components.

`getHistoricalState(year, data)` is the one function the timeline, map and preview
panel all call. Do not reimplement "is this kingdom active in year Y" anywhere.

## Data policy (non-negotiable)

- **Never fabricate** historical facts, dates, rulers, sources, or borders as if
  they were real. A record with no source must say so visibly — see
  `lib/data/status.ts`, which computes each page's badge from its `provenance`.
- **Unknown ≠ empty. Uncertain ≠ false. Missing ≠ zero.** Show a gap as a gap.
- Every `DateRange` carries a `confidence` and qualifiers
  (`exact`/`circa`/`before`/`after`/`unknown`). Print with `formatDateRange()`;
  for a person use `formatPersonDates()`. Never print a bare year the record
  doesn't support.
- **A lifetime is not a reign.** A `Person` can have `datesAre: "reign" | "lifetime"` or an unspecified date type;
  pages word them differently and do not guess an unspecified type.
- **Battle links use directly recorded coordinates, not combatants.** Points
  can still be approximate, and a border match alone does not establish where
  the battle was fought. Do not restore coordinates borrowed from a related place.
- **Monuments are "protected today"**, not dated.
- Images must be real and credited. Licensing is not enforced: this is a small
  college course project, so any public source may be used, but every image and
  fact still names where it came from. Never pair a real artifact photo with
  invented content about that specific artifact; if the photo shows a different
  object, say so (`imageIsIllustrative`).
- New data arrives through an importer in `scripts/` with a cited source, never
  by hand-typing facts. Checklist: `docs/DATA.md` §8.

## Map rules

- MapLibre owns geography (sources, layers, camera). React owns the UI around it.
  Never remount `<HistoricalMap>` on year or selection change; only its effects
  should run.
- Historical geometry is data (`HistoricalBoundary[]`), never JSX or hand-drawn
  SVG paths.
- Use `feature-state` for selection, hover and visibility; use `setFilter` for
  year-windowed layers. In `applyHistoricalState`, write only what changed.
- A legend toggle must control a real layer. Don't add checkboxes that don't.
- Don't rely on `isStyleLoaded()`; use the ready flag and queue in
  `HistoricalMap.tsx`.
- The basemap is CARTO Positron, recoloured, with modern borders and country
  names removed on purpose. Map text uses glyphs generated from the project's
  own fonts (`public/map-glyphs/`).

## Motion rules

Use `motion/react` (not `framer-motion`). Animate `opacity` / `transform` only
(and map `feature-state` paint transitions). Every animation must justify itself
— continuity, hierarchy, cause, state change. No decoration-only motion, no
bouncing, no animating everything at once. Respect `prefers-reduced-motion`; the
map's ambient animation, the starfield and the homepage swoop all have reduced-
motion paths. Details: `docs/DESIGN.md` §6.

## UI and writing rules

Editorial composition, not dashboard composition: typography, whitespace and
rules do the work that cards, shadows and gradients do elsewhere. No
glassmorphism, no rounded-everything, no fake stats, no "AI-powered" badges, no
decorative icons. If you can't say what an element communicates, don't add it.

**Write in plain language.** No jargon ("polity", "semantic", "epistemic"), no
filler ("immersive", "seamless"). Say what a thing is, what is uncertain and why,
and where a claim comes from. Examples and rules: `docs/DESIGN.md` §7.

## Fonts

Display: Zodiak (self-hosted, `public/fonts/`, 400/700). Interface: Ranade
(self-hosted, 400/500/700). Indian-script text: Anek (Devanagari, Tamil, Kannada,
Telugu); Indian-script display: Tiro (same four). All wired through
`lib/fonts.ts` — don't add a competing font import elsewhere.

## Verification loop

Before calling a feature done: `npm run lint`, `npx tsc --noEmit`,
`npm run build`, then run it and **use it** in a browser — check the console for
errors and hydration warnings, keyboard operation (the timeline is a native
`<input type="range">` on purpose), a laptop-width viewport (about 1280 px; phones are out of scope), and reduced motion.
A passing build is not proof that it works. Checklist: `docs/DEVELOPMENT.md` §3.

## Git

- **Never add yourself (or any AI co-author trailer) to commits.**
- Keep commit messages short and plain.
- Commit generated data together with the script change that produced it.
