# BHĀRATA frontend implementation resource pack for OpenCode

This is the **implementation-oriented list** I would give the coding agent. It focuses on what to install, what to consult, what to make the agent good at, and the rules it must follow.

The goal is not "use lots of libraries." The goal is:

> **Give OpenCode enough specialized knowledge to build a sophisticated historical atlas without letting it fall back to generic AI-generated React UI.**

---

# 1. Core stack

## Required

### Next.js
Use the latest stable Next.js compatible with the project, **App Router**, TypeScript.

Why:
- Server Components for data-heavy pages.
- Client Components only for interaction.
- Route-based code splitting.
- Built-in navigation/prefetching.
- Streaming/Suspense.
- URL-driven state.

Next.js now ships version-matched documentation inside the installed package and has dedicated AI-agent workflows. Current Next.js guidance specifically recommends agents consult the installed documentation rather than relying on older model knowledge. [GitHub](https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/ai-agents.mdx)

**Resource**

[Next.js documentation](https://nextjs.org/docs?utm_source=chatgpt.com)

---

## MapLibre GL JS

**Required.**

This is the map engine.

MapLibre uses WebGL and vector tiles, with a style specification that controls sources, layers, rendering order, labels, colors, camera defaults, etc. [MapLibre](https://maplibre.org/maplibre-gl-js/docs/?utm_source=chatgpt.com)

**Resources**

[MapLibre GL JS docs](https://maplibre.org/maplibre-gl-js/docs/?utm_source=chatgpt.com)

[MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/?utm_source=chatgpt.com)

### Agent skill

Install the official/community MapLibre agent skill collection:

```bash
npx skills add maplibre/maplibre-agent-skills
```

At minimum:

```bash
npx skills add maplibre/maplibre-agent-skills \
  --skill maplibre-cartography

npx skills add maplibre/maplibre-agent-skills \
  --skill maplibre-tile-sources

npx skills add maplibre/maplibre-agent-skills \
  --skill maplibre-pmtiles-patterns

npx skills add maplibre/maplibre-agent-skills \
  --skill maplibre-fonts-glyphs

npx skills add maplibre/maplibre-agent-skills \
  --skill maplibre-source-wiring
```

These are specifically designed to correct common AI mistakes around MapLibre, including tile sources, cartography, glyphs/non-Latin fonts, PMTiles, and source wiring. [GitHub](https://github.com/maplibre/maplibre-agent-skills)

**Do not let OpenCode implement MapLibre from memory.**

---

# 2. Map data

## Natural Earth

Use for:

- coastlines
- rivers
- geographic context
- terrain
- country/region scaffolding

It is useful because the data can be heavily customized instead of inheriting somebody else's visual map language.

**Resource**

[Natural Earth](https://www.naturalearthdata.com/?utm_source=chatgpt.com)

---

## OpenHistoricalMap

Use as:

- historical geographic reference
- potential historical geographic data source
- research aid

Do **not** automatically treat its data as authoritative historical truth.

**Resource**

[OpenHistoricalMap](https://www.openhistoricalmap.org/?utm_source=chatgpt.com)

---

# 3. PMTiles

Use when historical geographic data becomes too large for ordinary GeoJSON.

Architecture:

```text
GeoJSON / PostGIS
        ↓
      tiles
        ↓
     PMTiles
        ↓
    MapLibre
```

This allows static/serverless hosting without needing a traditional tile server.

**Resource**

[PMTiles documentation](https://docs.protomaps.com/pmtiles/?utm_source=chatgpt.com)

### Agent requirement

OpenCode must consult:

```text
maplibre-pmtiles-patterns
```

before implementing PMTiles. The MapLibre skill specifically covers static/serverless PMTiles patterns and GeoJSON/MBTiles conversion. [GitHub](https://github.com/maplibre/maplibre-agent-skills)

---

# 4. CARTO

Useful for the **prototype basemap**, not necessarily the final map.

Use:

```text
MapLibre
+
CARTO basemap
+
BHĀRATA historical layers
```

Do not make CARTO the visual identity of the application.

Also verify current usage/attribution requirements before deployment.

---

# 5. deck.gl

### Optional, not default.

Use only when MapLibre's native layers are insufficient.

Potential uses:

- huge point datasets
- animated routes
- dense historical movement networks
- particle-like flows
- heat/aggregation views
- sophisticated GPU overlays

deck.gl officially supports MapLibre and can synchronize its camera with MapLibre. [Deck.gl](https://deck.gl/docs/developer-guide/base-maps/using-with-maplibre?utm_source=chatgpt.com)

**Resource**

[deck.gl MapLibre integration](https://deck.gl/docs/developer-guide/base-maps/using-with-maplibre?utm_source=chatgpt.com)

### Rule

Do **not** install deck.gl just because it looks impressive.

Start with MapLibre.

Add deck.gl only when there is a concrete visualization that benefits from GPU layers.

---

# 6. PostgreSQL + PostGIS

For the eventual actual platform:

```text
PostgreSQL
+
PostGIS
```

PostGIS becomes essential for:

- historical territories
- place coordinates
- spatial relationships
- distance queries
- point-in-polygon
- route intersections
- geographical filtering

Spatial indexes should use GiST, and PostGIS's spatial predicates such as `ST_Intersects`, `ST_Contains`, `ST_Within`, etc. can use those indexes. [PostGIS](https://postgis.net/documentation/faq/spatial-indexes/?utm_source=chatgpt.com)

**Resources**

[PostGIS documentation](https://postgis.net/docs/?utm_source=chatgpt.com)

---

# 7. IIIF

This is a **high-value feature**.

Use IIIF for:

- inscriptions
- manuscripts
- paintings
- archaeological objects
- archival documents
- historical maps

IIIF Presentation API 3.0 models compound digital objects using manifests, canvases, annotation pages, annotations, ranges, etc. [IIIF](https://iiif.io/api/presentation/3.0/?utm_source=chatgpt.com)

The IIIF Image API allows requesting specific image regions, sizes, rotations and formats. [IIIF](https://iiif.io/api/image/2.1/?utm_source=chatgpt.com)

That means:

```text
whole inscription
       ↓
zoom
       ↓
specific region
       ↓
specific line
       ↓
transcription
       ↓
claim
```

This should be one of BHĀRATA's signature capabilities.

**Resources**

[IIIF Presentation API 3.0](https://iiif.io/api/presentation/3.0/?utm_source=chatgpt.com)

[IIIF Image API](https://iiif.io/api/image/3.0/?utm_source=chatgpt.com)

---

# 8. Motion

Use **Motion for React**.

Import:

```tsx
import { motion, AnimatePresence } from "motion/react"
```

Do **not** use the old:

```tsx
from "framer-motion"
```

Motion's current package uses `motion/react`. [GitHub](https://github.com/motiondivision/motion/blob/main/packages/framer-motion/README.md?utm_source=chatgpt.com)

Use it for:

- entity panel transitions
- shared element transitions
- drawers
- chronology UI
- subtle reveals
- page transitions
- image expansion
- hover/focus states

Motion supports layout and shared-element animations using `layout` and `layoutId`. [Motion](https://motion.dev/docs/react-layout-animations?utm_source=chatgpt.com)

### Agent skill

Install the free Motion skill:

```bash
npx motion-ai
```

The installer supports OpenCode and provides current Motion documentation through the agent skill/MCP setup. [GitHub](https://github.com/motiondivision/motion/blob/main/README.md?utm_source=chatgpt.com)

---

# 9. Animation rules

OpenCode must know:

### Animate

```text
opacity
transform
position
scale
clip-path
```

where appropriate.

### Avoid animating

```text
width
height
top
left
margin
padding
box-shadow
```

unless there is a deliberate reason.

Motion's performance documentation specifically recommends compositor-friendly properties such as `transform` and `opacity`. [Motion](https://motion.dev/docs/performance?utm_source=chatgpt.com)

### Global rule

No animation exists purely because "the page feels empty."

Every animation must communicate:

- spatial movement
- hierarchy
- continuity
- state change
- causality

---

# 10. Reduced motion

Every major animated interaction needs a reduced-motion path.

Use:

```tsx
<MotionConfig reducedMotion="user">
```

or `useReducedMotion()`.

Motion explicitly supports automatically adapting animations to the user's reduced-motion preference. [Motion](https://motion.dev/docs/react-accessibility?utm_source=chatgpt.com)

---

# 11. shadcn/ui

Use **selectively**.

Not as the visual identity.

shadcn gives us actual source code rather than an opaque component package, so components can be heavily customized. [shadcn/ui](https://ui.shadcn.com/docs)

Use it for:

- Dialog
- Drawer
- Command
- Tabs
- Tooltip
- Popover
- Dropdown
- Sheet
- ScrollArea
- Separator
- Skeleton
- Button primitives

Do **not** blindly use its default styling.

### Current shadcn situation

New shadcn projects now default to Base UI, while Radix remains supported. [shadcn/ui](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default?utm_source=chatgpt.com)

For this project:

**Prefer whichever primitive set is already established in the implementation. Do not switch component foundations halfway through the build.**

### Agent skill

```bash
npx skills add shadcn/ui
```

The official shadcn skill teaches agents to inspect project configuration, search existing components, compose them correctly and use the appropriate APIs. [GitHub](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/SKILL.md?plain=1\&utm_source=chatgpt.com)

---

# 12. Zod

Use Zod at all external-data boundaries.

```text
API
 ↓
Zod validation
 ↓
typed domain object
 ↓
application
```

Especially for:

- historical data
- GeoJSON
- Wikidata responses
- IIIF manifests
- URL parameters
- search filters

Zod 4 is currently stable and is TypeScript-first with static type inference. [Zod](https://zod.dev/?utm_source=chatgpt.com)

**Resource**

[Zod documentation](https://zod.dev/?utm_source=chatgpt.com)

---

# 13. Search

Start simple:

```text
PostgreSQL
 ├── full-text search
 └── pg_trgm
```

Later potentially:

```text
PostgreSQL
+
semantic search
```

Do not introduce Elasticsearch/Algolia/another external search service unless the dataset actually demands it.

---

# 14. Wikidata

Use it for:

- multilingual labels
- external identifiers
- related entities
- supplemental metadata

Architecture:

```text
Wikidata
   ↓
controlled ingestion
   ↓
validate
   ↓
PostgreSQL
   ↓
BHĀRATA
```

### Never:

```text
browser
 ↓
Wikidata SPARQL
 ↓
render page
```

for every request.

Treat Wikidata as **enrichment**, not the application's runtime database.

---

# 15. Next.js-specific agent skills

Install:

```bash
npx skills add vercel/next.js --skill next-dev-loop
```

This is especially important.

`next-dev-loop` tells the agent to verify the application at runtime, not merely run TypeScript/build checks. It uses Next.js's runtime tooling plus a real browser. [GitHub](https://github.com/vercel/next.js/blob/canary/skills/next-dev-loop/SKILL.md?utm_source=chatgpt.com)

Also consider:

```bash
npx skills add vercel/next.js \
  --skill next-cache-components-optimizer
```

Only when cache architecture becomes relevant.

Current Next.js agent tooling is specifically version-matched to the framework rather than relying on stale generic Next.js knowledge. [GitHub](https://github.com/vercel-labs/next-skills?utm_source=chatgpt.com)

---

# 16. Vercel agent skills

Install:

```bash
npx skills add vercel-labs/agent-skills \
  --skill react-best-practices
```

```bash
npx skills add vercel-labs/agent-skills \
  --skill composition-patterns
```

```bash
npx skills add vercel-labs/agent-skills \
  --skill react-view-transitions
```

These cover:

- React/Next performance
- component composition
- render optimization
- bundle size
- eliminating waterfalls
- shared transitions
- route transitions
- accessibility

The official collection currently includes these skills. [GitHub](https://github.com/vercel-labs/agent-skills/blob/main/README.md?utm_source=chatgpt.com)

---

# 17. Web Interface Guidelines

### Mandatory.

Install:

```bash
npx skills add vercel-labs/agent-skills \
  --skill web-design-guidelines
```

This should be run as a **review skill**, not something that determines the visual identity.

It checks:

- accessibility
- focus
- forms
- interaction
- responsive behaviour
- animation
- performance
- typography
- loading states
- URL state
- touch targets
- semantic HTML

Vercel explicitly recommends this skill for AI-generated interfaces. [GitHub](https://github.com/vercel-labs/web-interface-guidelines?utm_source=chatgpt.com)

---

# 18. Anti-AI-slop skill

Install an anti-slop skill as an additional **creative-review layer**:

```bash
npx skills add Krirox/anti-ai-slop-skills
```

The skill is explicitly designed to detect generic AI aesthetics and frontend patterns before/reviewing UI implementation. [GitHub](https://github.com/Krirox/anti-ai-slop-skills/blob/main/SKILL.md)

### But important:

Don't let it dictate:

> "every site should be brutalist."

That would simply replace **AI slop** with **anti-AI-slop slop**.

Its job:

```text
detect genericness
↓
challenge generic choices
↓
force intentional design
```

Not:

```text
generic AI design
↓
mandatory brutalism
```

---

# 19. Custom OpenCode skills worth creating

These are the **highest-value custom skills** for this project.

OpenCode supports project-local skills in:

```text
.opencode/skills/<skill-name>/SKILL.md
```

and loads them on demand. [OpenCode](https://opencode.ai/docs/skills?utm_source=chatgpt.com)

Create:

```text
.opencode/
└── skills/
    ├── bhaarata-ui/
    ├── historical-map/
    ├── historical-data/
    ├── evidence-ui/
    ├── cinematic-motion/
    ├── frontend-review/
    └── visual-qa/
```

---

# 20. `bhaarata-ui` skill

Purpose:

> Prevent the agent from reverting to generic SaaS UI.

Rules:

```text
- editorial composition over dashboard composition
- asymmetric layouts are allowed
- cards are not the default container
- use rules, typography and whitespace
- use archival visual references
- preserve visual hierarchy
- avoid excessive rounded containers
- avoid gradients unless genuinely required
- avoid glassmorphism
- avoid generic hero sections
- avoid fake statistics
- avoid decorative UI
- every visual element must communicate information or hierarchy
```

---

# 21. `historical-map` skill

Purpose:

> Force correct MapLibre architecture.

Rules:

```text
- MapLibre owns geographic rendering
- React owns surrounding UI
- never rerender the map unnecessarily
- use sources/layers instead of DOM polygons
- use feature-state for transient selection
- use filters/paint/layout properties for visual state
- use zoom-based visibility
- use custom MapLibre style JSON
- use proper glyph strategy for Indic scripts
- never hardcode historical geography into JSX
- historical geometry must be data
- geometry requires provenance
```

---

# 22. `historical-data` skill

Purpose:

> Stop the agent from inventing historical data.

Rules:

```text
- never fabricate historical facts
- never invent dates
- never invent rulers
- never invent sources
- never invent geographic boundaries
- every historical claim requires provenance
- distinguish source fact from interpretation
- preserve uncertainty
- don't silently normalize disputed dates
- don't silently resolve conflicting sources
```

This is critical.

---

# 23. `evidence-ui` skill

Purpose:

> Make provenance visible.

Rules:

```text
Claim
↓
Evidence
↓
Source
```

Every evidence interface should make it possible to answer:

```text
What is being claimed?
What supports it?
Where is that evidence?
What is interpretation?
What remains uncertain?
```

---

# 24. `cinematic-motion` skill

Rules:

```text
motion communicates continuity
never animate for decoration
prefer transform/opacity
respect reduced motion
use shared-element transitions selectively
map camera motion must have geographic meaning
page transitions must preserve spatial context
don't animate large numbers of DOM nodes
```

---

# 25. `visual-qa` skill

This is extremely important for OpenCode.

Every major implementation should trigger:

```text
1. build
2. lint
3. typecheck
4. dev server
5. browser inspection
6. screenshot
7. visual review
8. responsive review
9. accessibility review
10. fix
11. repeat
```

Playwright supports screenshot-based visual comparisons through `toHaveScreenshot()`. [Playwright](https://playwright.dev/docs/test-snapshots?utm_source=chatgpt.com)

---

# 26. Resources OpenCode should consult

### Next.js

[Next.js docs](https://nextjs.org/docs?utm_source=chatgpt.com)

### MapLibre

[MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/?utm_source=chatgpt.com)

### MapLibre Style Spec

[MapLibre Style Spec](https://maplibre.org/maplibre-style-spec/?utm_source=chatgpt.com)

### MapLibre Agent Skills

[MapLibre Agent Skills](https://github.com/maplibre/maplibre-agent-skills?utm_source=chatgpt.com)

### PMTiles

[PMTiles](https://docs.protomaps.com/pmtiles/?utm_source=chatgpt.com)

### IIIF Presentation

[IIIF Presentation API](https://iiif.io/api/presentation/3.0/?utm_source=chatgpt.com)

### IIIF Image

[IIIF Image API](https://iiif.io/api/image/3.0/?utm_source=chatgpt.com)

### Motion

[Motion docs](https://motion.dev/docs?utm_source=chatgpt.com)

### shadcn

[shadcn/ui docs](https://ui.shadcn.com/docs?utm_source=chatgpt.com)

### Vercel Web Interface Guidelines

[Web Interface Guidelines](https://vercel.com/design/guidelines?utm_source=chatgpt.com)

### Natural Earth

[Natural Earth](https://www.naturalearthdata.com/?utm_source=chatgpt.com)

### OpenHistoricalMap

[OpenHistoricalMap](https://www.openhistoricalmap.org/?utm_source=chatgpt.com)

### PostGIS

[PostGIS documentation](https://postgis.net/docs/?utm_source=chatgpt.com)

### Playwright

[Playwright docs](https://playwright.dev/docs/intro?utm_source=chatgpt.com)

---

# 27. DOs

## Architecture

- **DO** use Server Components by default.
- **DO** use Client Components only where interaction requires them.
- **DO** keep map rendering isolated from React-heavy UI.
- **DO** make historical state data-driven.
- **DO** keep URL state shareable.
- **DO** make components composable.
- **DO** validate external data with Zod.
- **DO** use TypeScript strictly.
- **DO** keep domain logic separate from presentation.

## Map

- **DO** use MapLibre layers/sources.
- **DO** use vector tiles when scale requires them.
- **DO** use zoom-dependent information density.
- **DO** use `feature-state` for transient selection.
- **DO** create a custom map style.
- **DO** treat map typography as part of the design.
- **DO** plan for Indic glyphs.
- **DO** preserve uncertainty in historical geography.
- **DO** use PMTiles once datasets grow.

## UI

- **DO** establish hierarchy before adding decoration.
- **DO** use typography as a major visual tool.
- **DO** use whitespace aggressively.
- **DO** use rules/dividers where appropriate.
- **DO** allow asymmetric editorial layouts.
- **DO** use full-bleed imagery selectively.
- **DO** make evidence visually traceable.
- **DO** use drawers for temporary context.
- **DO** use pages for durable context.
- **DO** make mobile a first-class composition.

## Motion

- **DO** animate transitions between related states.
- **DO** use shared-element transitions where meaningful.
- **DO** use map camera movement to communicate geography.
- **DO** use subtle reveal animations.
- **DO** respect reduced motion.
- **DO** test animations on lower-powered hardware.

## Agent workflow

- **DO** research current library APIs before implementation.
- **DO** use the relevant specialized skill.
- **DO** inspect the running application.
- **DO** make one coherent change at a time.
- **DO** verify after every meaningful change.
- **DO** take screenshots.
- **DO** inspect mobile.
- **DO** inspect ultra-wide.
- **DO** test keyboard navigation.
- **DO** test empty/loading/error states.
- **DO** remove unnecessary code after implementation.

---

# 28. DON'Ts

## UI

- **DON'T** build a SaaS dashboard.
- **DON'T** turn every section into a card.
- **DON'T** use huge rounded rectangles everywhere.
- **DON'T** use glassmorphism.
- **DON'T** use purple/blue AI gradients.
- **DON'T** use generic "AI-powered" badges.
- **DON'T** add fake metrics.
- **DON'T** add decorative charts.
- **DON'T** add floating widgets merely to fill space.
- **DON'T** overuse pills.
- **DON'T** use excessive shadows.
- **DON'T** use generic iconography as decoration.
- **DON'T** make everything symmetrical.
- **DON'T** make everything animated.
- **DON'T** copy a museum website aesthetic literally.

## Map

- **DON'T** use default OSM styling.
- **DON'T** put huge GeoJSON files directly into React state.
- **DON'T** render hundreds/thousands of DOM markers.
- **DON'T** rerender MapLibre because a side panel changed.
- **DON'T** rebuild the entire map when the year changes.
- **DON'T** use deck.gl unless MapLibre isn't enough.
- **DON'T** query external APIs for every map interaction.
- **DON'T** make external APIs the source of truth.

## Data

- **DON'T** fabricate historical facts.
- **DON'T** fabricate citations.
- **DON'T** invent historical borders.
- **DON'T** hide uncertainty.
- **DON'T** silently resolve contradictory historical evidence.
- **DON'T** use AI-generated historical content as authoritative data.
- **DON'T** put raw external API responses directly into components.

## Next.js

- **DON'T** make the entire application `"use client"`.
- **DON'T** fetch everything from the browser.
- **DON'T** duplicate server data into client state without a reason.
- **DON'T** use `useEffect` for data fetching that belongs on the server.
- **DON'T** ignore Next.js's current version-matched docs.
- **DON'T** optimize based on assumptions. Measure.

## Motion

- **DON'T** animate width/height unnecessarily.
- **DON'T** animate every list item simultaneously.
- **DON'T** create long cinematic transitions for ordinary navigation.
- **DON'T** block interaction during transitions.
- **DON'T** ignore `prefers-reduced-motion`.

## Agent behaviour

- **DON'T** generate 1,000 lines before running the app.
- **DON'T** assume a package API from training memory.
- **DON'T** install five libraries to solve one problem.
- **DON'T** rewrite working architecture without evidence.
- **DON'T** refactor unrelated code during feature work.
- **DON'T** declare something "done" because `npm run build` passes.
- **DON'T** trust the screenshot without testing interaction.
- **DON'T** trust the browser without checking TypeScript/build output.
- **DON'T** keep adding features when the interface is already overloaded.

---

# 29. Mandatory agent verification loop

Every OpenCode task should follow:

```text
UNDERSTAND
    ↓
INSPECT
    ↓
RESEARCH
    ↓
PLAN
    ↓
IMPLEMENT
    ↓
TYPECHECK
    ↓
LINT
    ↓
RUN
    ↓
BROWSER TEST
    ↓
SCREENSHOT
    ↓
VISUAL REVIEW
    ↓
ACCESSIBILITY REVIEW
    ↓
PERFORMANCE REVIEW
    ↓
FIX
    ↓
RETEST
```

Not:

```text
prompt
 ↓
generate 4,000 lines
 ↓
"Done"
```

The Next.js `next-dev-loop` skill is specifically designed around this edit → runtime verification cycle. [GitHub](https://github.com/vercel/next.js/blob/canary/skills/next-dev-loop/SKILL.md?utm_source=chatgpt.com)

---

# 30. The visual QA checklist

For every major screen:

### Composition

- Is there one dominant visual object?
- Is the hierarchy obvious?
- Does anything compete with the primary object?
- Is the page too card-heavy?
- Is the whitespace intentional?

### Typography

- Is the display type doing meaningful work?
- Are line lengths controlled?
- Are metadata levels clearly differentiated?
- Are Indic scripts rendered correctly?
- Are dates/numbers aligned consistently?

### Interaction

- Does hover communicate something?
- Does focus communicate something?
- Does selection persist?
- Does Back work?
- Can the user recover from an error?

### Map

- Are labels readable?
- Is the map too busy?
- Does zoom reveal information progressively?
- Is selected geography obvious without relying only on color?
- Does the camera movement have purpose?

### Motion

- Is the animation necessary?
- Is it fast enough?
- Does it preserve spatial continuity?
- Does reduced motion work?

### Mobile

- Is the map usable with one hand?
- Are controls at least adequately sized?
- Are panels scrollable?
- Does typography remain readable?
- Does the experience still feel like BHĀRATA?

---

# 31. The OpenCode "definition of done"

A feature is **not done** until:

```text
□ TypeScript passes
□ lint passes
□ production build passes
□ dev runtime works
□ browser interaction works
□ no console errors
□ no hydration errors
□ mobile tested
□ desktop tested
□ keyboard tested
□ reduced motion tested
□ loading state tested
□ empty state tested
□ error state tested
□ screenshot reviewed
□ unnecessary complexity removed
```

For map features:

```text
□ correct source
□ correct layer
□ correct filter
□ correct zoom behaviour
□ selection works
□ deselection works
□ camera state works
□ URL state works
□ map does not unnecessarily rerender
```

For historical data:

```text
□ schema validated
□ provenance present
□ dates explicit
□ uncertainty represented
□ source relationship present
```

---

# 32. The exact skill installation set

If you want the **minimal but powerful** OpenCode setup, install these:

```bash
# Next.js runtime verification
npx skills add vercel/next.js --skill next-dev-loop

# React/Next performance
npx skills add vercel-labs/agent-skills --skill react-best-practices

# React architecture
npx skills add vercel-labs/agent-skills --skill composition-patterns

# UI quality
npx skills add vercel-labs/agent-skills --skill web-design-guidelines

# Route/shared transitions
npx skills add vercel-labs/agent-skills --skill react-view-transitions

# MapLibre
npx skills add maplibre/maplibre-agent-skills

# shadcn
npx skills add shadcn/ui

# Motion
npx motion-ai

# Optional anti-slop layer
npx skills add Krirox/anti-ai-slop-skills
```

These aren't random skills. They cover the actual failure modes of this project:

```text
Next.js        → framework mistakes
React          → architecture/performance mistakes
shadcn         → component mistakes
MapLibre       → cartography/map mistakes
Motion         → animation mistakes
Web Guidelines → UX/a11y/performance mistakes
Anti-slop      → generic visual-design mistakes
```

The official MapLibre collection itself is specifically maintained around AI failure modes and has tested skills for common mapping problems. [GitHub](https://github.com/maplibre/maplibre-agent-skills)

---

# 33. Most important rule for OpenCode

Give the agent this mental model:

```text
BHĀRATA is not a website that contains a map.

BHĀRATA is a historical information system
whose primary interface happens to be a map.
```

Therefore:

```text
Map       = spatial query interface
Timeline  = temporal query interface
Entity    = semantic query interface
Evidence  = epistemic query interface
Sources   = provenance interface
Search    = cross-domain query interface
```

That distinction should drive the implementation.

And one final hard constraint:

> **If a proposed UI element does not help the user understand place, time, entity, evidence, or relationship, OpenCode should have to justify why it exists before adding it.**

That single rule will prevent a *lot* of AI-generated visual garbage.