<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# BHĀRATA — agent rules

Read `PROJECT_BIBLE.md` before touching product identity, domain model, or
content tone. Read `IMPLEMENTATION_PLAN.md` and `GUIDANCE.md` for the
architecture/phase plan this build follows — they supersede PROJECT_BIBLE.md
on anything stack-related (PROJECT_BIBLE.md is product/content canon;
IMPLEMENTATION_PLAN.md/GUIDANCE.md are the engineering direction).

`GUIDANCE.md` was authored for OpenCode's `.opencode/skills/` loader. This
repo uses Claude Code instead, so its `npx skills add ...` installers were
skipped — the *rules* those skills would have enforced are folded into this
file instead. Treat the sections below as those skills' rulings.

## What BHĀRATA is

Not a SaaS dashboard, not a Wikipedia clone, not a chatbot with a history
skin. It is a source-aware, time-aware atlas whose core loop is:

> place → polity → time → event → evidence → source

The interface should make relationships in the data visible — not just
display records. See PROJECT_BIBLE.md §1–4, §20 (non-negotiables) before
adding any feature.

## Current state (read this before assuming anything is wired up)

- Phase 0–3 of IMPLEMENTATION_PLAN.md are done: Next.js App Router shell,
  design tokens/fonts, MapLibre-based Atlas with a time scrubber, a
  Chronology list page, and minimal Polity entity pages.
- **All domain data in `lib/data/prototype.ts` is illustrative placeholder
  data**, not a scholarly corpus. Boundary polygons are coarse hand-drawn
  approximations. Never present it as fact, and never add more of it just
  to make a screen look fuller — see Data policy below.
- Not yet built: People/Places/Evidence/Sources pages, Search command
  palette, IIIF viewer, PostgreSQL/PostGIS, Wikidata ingestion, a layers
  toggle panel (don't add checkboxes that don't control anything real —
  that's exactly the "decorative UI" GUIDANCE.md forbids).
- `legacy/frontend-v1` branch holds a prior, deliberately parked attempt.
  Don't pull from it without being asked.

## Architecture boundaries

```
lib/domain   — Zod schemas + types (Polity, Place, Event, DateRange, …)
lib/data     — data sources (currently: prototype.ts placeholder data)
lib/geo      — getHistoricalState(year)/getBoundariesAtYear(year), GeoJSON conversion
components/primitives — Text/Eyebrow/Rule/Badge/Button only. No app logic.
components/map        — MapLibre lifecycle. React never re-renders the map
                         itself; it calls setData/setFeatureState/flyTo.
components/chronology, components/entity, components/atlas — compose primitives + map
app/*        — routes. Server components by default; "use client" only
               where interaction requires it (map, timeline, search, IIIF).
```

Keep domain logic (date formatting, year-range queries) in `lib/`, not in
components. `getHistoricalState(year)` is the one function the timeline,
map, and any future entity panel should all call — don't reimplement "is
this polity active in year Y" elsewhere.

## Data policy (non-negotiable)

- Never fabricate historical facts, dates, rulers, sources, or boundaries
  as if they were real. Prototype/placeholder data must say so visibly
  (see the `Badge tone="uncertainty"` → "Illustrative prototype data"
  pattern already used on /atlas, /polities, /chronology, /method).
- Unknown ≠ empty. Uncertain ≠ false. Missing ≠ zero.
- Every `DateRange` carries a `confidence` and qualifiers
  (`circa`/`before`/`after`/`unknown`) — use `formatDateRange()`, never
  print a bare year when the record doesn't support that precision.
- When real data eventually replaces the prototype set, each record needs
  actual provenance (a real source, not `PROTOTYPE_SOURCE`).

## Map rules

- MapLibre owns geography (sources/layers/camera). React owns surrounding
  UI. Never remount `<HistoricalMap>` on year/selection change — only its
  effects should run (see the comments in `HistoricalMap.tsx`).
- Historical geometry is data (`lib/data/prototype.ts` →
  `HistoricalBoundary[]`), never hardcoded JSX/SVG paths.
- Use `feature-state` for selection/hover, not component re-renders.
- The current basemap (CARTO Positron + a CSS sepia filter) is a Phase-1
  placeholder, not the intended final visual identity — see
  `components/map/mapStyle.ts` for the follow-up note (custom vector style
  once PostGIS/PMTiles exist).

## Motion rules

Use `motion/react` (not `framer-motion`). Animate `opacity`/`transform`
only. Every animation must justify itself (continuity, hierarchy, state
change) — no decoration-only motion, no bouncing, no animating everything
on a page at once. Reduced motion is automatic via Motion; don't fight it.

## UI rules

Editorial composition, not dashboard composition: typography, whitespace,
and rules (`<Rule />`) do the work that cards/shadows/gradients would do
elsewhere. No glassmorphism, no rounded-everything, no fake stats, no
"AI-powered" badges, no decorative icons. Every visual element must
communicate information or hierarchy — if you can't say what it
communicates, don't add it.

## Fonts

Display: Zodiak (self-hosted, `public/fonts/`, Fontshare — 400/700 only).
Interface: Ranade (self-hosted, `public/fonts/`, Fontshare — 400/500/700).
Devanagari running text: Anek Devanagari (`next/font/google`).
Devanagari display/epigraphic framing: Tiro Devanagari Hindi
(`next/font/google`). All wired through `lib/fonts.ts` — don't add a
competing font import elsewhere.

## Verification loop

Before calling a feature done: `npm run lint`, `npm run build`, then
actually run `npm run dev` and click through it in a browser — check
console/hydration errors, keyboard operability (the timeline scrubber is a
native `<input type="range">` on purpose), and that reduced-motion still
works. Don't declare something done because the build passed.

## Git

Never add yourself (or any AI co-author trailer) to commits.
