Absolutely. And after looking at the actual `main` state of **BHAARATA**, the implementation should be treated as a **proper product build**, not another round of styling.

One important thing first: I checked the current GitHub tree for `main`, and the repository currently exposes only `AGENTS.md`, `DESIGN.md`, and `PROJECT_BIBLE.md`. So before implementation, we should verify the earlier application source has not been dropped or moved. That becomes **Phase 0**, not something we discover halfway through the redesign.

The architecture below is what I would use to turn BHĀRATA into the cinematic atlas from the latest mockup.

---

# BHĀRATA
## Final Frontend Implementation Blueprint

### The target

The finished application should feel like:

> **an interactive historical atlas crossed with a digital archive and an editorial publication.**

Not a dashboard.

Not a map with cards around it.

Not a museum landing page.

The core interaction should be:

**Choose a time → see a world → discover a polity/place/person → investigate it → follow its evidence → return to the map with context preserved.**

That single loop should govern almost everything.

---

# 01. The technology stack

I would deliberately keep the stack relatively small.

| Layer | Technology | Purpose |
|---|---|---|
| Framework | **Next.js App Router** | Application architecture |
| Language | **TypeScript** | Strong domain modelling |
| Styling | **Tailwind CSS** | Design system |
| UI primitives | **Radix UI** selectively | Accessible dialogs, popovers, tabs etc. |
| Icons | **Lucide** | Functional iconography |
| Map | **MapLibre GL JS** | Interactive historical cartography |
| Map React integration | `react-map-gl/maplibre` or thin custom wrapper | React-friendly map lifecycle |
| Spatial data | **GeoJSON initially** | Prototype historical boundaries |
| Future spatial data | **PMTiles / vector tiles** | Large historical datasets |
| Basemap | **CARTO / Natural Earth** | Initial cartographic foundation |
| Historical geography | **OpenHistoricalMap + curated data** | Reference/enrichment |
| Database later | **PostgreSQL + PostGIS** | Actual DBMS layer |
| Search | PostgreSQL FTS + trigram initially | Fast local search |
| Entity enrichment | **Wikidata** | Relationships / identifiers |
| Archival imagery | **IIIF** | Deep-zoom manuscripts / inscriptions |
| Image handling | `next/image` | Responsive imagery |
| Animation | **Motion for React** | Page/UI transitions |
| Charts/timeline | SVG + custom React | Avoid chart-library visual sameness |
| State | URL state + small React state | Shareable exploration |
| Validation | Zod | Data contracts |
| Testing | Vitest + Playwright | Behaviour + visual regression |
| Deployment | Vercel | Next.js hosting |

The key principle:

### Don't install a library because it can make something move.

Every dependency should earn its place.

---

# 02. The visual architecture

The entire application should be built around six visual layers.

```text
┌─────────────────────────────────────────────┐
│ GLOBAL NAVIGATION                           │
├─────────────────────────────────────────────┤
│                                             │
│             CARTOGRAPHIC WORLD              │
│                                             │
│        historical geography / routes        │
│                                             │
│─────────────────────────────────────────────│
│ TIME                                        │
│ ───────●──────────────●─────────────────    │
│                                             │
│ ENTITY / EVIDENCE / CONTEXT                 │
└─────────────────────────────────────────────┘
```

But visually, these layers shouldn't all scream simultaneously.

Think:

### Primary
**Map**

### Secondary
**Time**

### Tertiary
**Entity**

### Supporting
**Evidence**

### Deep layer
**Sources**

That hierarchy is what prevents richness from becoming clutter.

---

# 03. The application shell

Build one permanent shell.

```text
app/
├── layout.tsx
├── page.tsx
│
├── atlas/
│   └── page.tsx
│
├── chronology/
│   └── page.tsx
│
├── polities/
│   └── [slug]/
│       └── page.tsx
│
├── people/
│   └── [slug]/
│       └── page.tsx
│
├── places/
│   └── [slug]/
│       └── page.tsx
│
├── evidence/
│   └── [slug]/
│       └── page.tsx
│
├── sources/
│   └── [slug]/
│       └── page.tsx
│
├── search/
│   └── page.tsx
│
├── method/
│   └── page.tsx
│
└── not-found.tsx
```

Then:

```text
components/
├── shell/
├── map/
├── chronology/
├── entities/
├── evidence/
├── search/
├── sources/
├── typography/
├── navigation/
└── primitives/
```

And:

```text
lib/
├── data/
├── db/
├── geo/
├── search/
├── iiif/
├── wikidata/
├── formatting/
└── validation/
```

This separation matters enormously later when PostgreSQL arrives.

---

# 04. The homepage

The homepage should **not** immediately dump the user into a dashboard.

It should be an invitation.

Imagine:

```text
BHĀRATA

A SOURCE-AWARE, TIME-AWARE ATLAS
OF THE INDIAN SUBCONTINENT


                    [historical map]

       850 CE                         1290 CE
          ●───────────────●──────────────●

         Explore the subcontinent
                 ↓
```

The map slowly breathes.

Not a cheesy animation.

Just subtle movement:

- coastline texture
- tiny place markers
- historical routes
- chronology cursor
- labels appearing as the map settles

Then:

### "Begin with a time."

Three entry points:

**Explore the Atlas**

**Follow a Century**

**Investigate an Object**

This establishes the three fundamental modes of BHĀRATA.

---

# 05. The Atlas workspace

This is the **hero experience**.

Desktop:

```text
┌────────┬─────────────────────────────────────┐
│        │                                     │
│ NAV    │                                     │
│        │               MAP                   │
│ Atlas  │                                     │
│ Time   │                                     │
│ People │                                     │
│ Places │                          ENTITY     │
│        │                          PANEL      │
│        │                                     │
├────────┴─────────────────────────────────────┤
│              CHRONOLOGY                      │
└──────────────────────────────────────────────┘
```

But the panels should **float into the map**, not form rigid dashboard columns.

---

# 06. MapLibre becomes the heart

This is where the project becomes genuinely impressive.

MapLibre is a strong fit because it renders vector-tile maps in WebGL and provides camera animation such as `flyTo`. [MapLibre](https://maplibre.org/maplibre-gl-js/docs/?utm_source=chatgpt.com)

Create:

```text
components/map/
├── historical-map.tsx
├── map-camera.tsx
├── map-controls.tsx
├── map-layers.tsx
├── polity-layer.tsx
├── place-layer.tsx
├── route-layer.tsx
├── map-labels.tsx
├── map-attribution.tsx
└── map-cursor.tsx
```

### Map layers

Don't just have:

> Political boundaries

Instead:

```text
MAP LAYERS

Political geography
  ☑ Polities
  ☑ Capitals
  ☐ Frontier uncertainty

Movement
  ☐ Trade routes
  ☐ Campaign routes
  ☐ Maritime networks

Places
  ☑ Major settlements
  ☐ Temples
  ☐ Fortifications
  ☐ Ports
  ☐ Archaeological sites

Physical
  ☑ Rivers
  ☑ Coastlines
  ☐ Terrain
```

The crucial thing:

### Layers should reveal information progressively.

At zoom 4:

> CHOLA

At zoom 6:

> Chola  
> Thanjavur  
> Kanchipuram  
> Nagapattinam

At zoom 8:

> temple sites  
> inscriptions  
> ports  
> roads

The map becomes more knowledgeable as you approach it.

---

# 07. Make the map look like BHĀRATA

Do **not** use the default OpenStreetMap aesthetic.

Natural Earth gives us public-domain geographic data that can be modified freely, making it useful for creating our own cartographic foundation. [Natural Earth Data](https://www.naturalearthdata.com/downloads/?utm_source=chatgpt.com)

Create a custom style:

```text
water
   ↓
desaturated blue-green

land
   ↓
warm parchment

terrain
   ↓
barely visible contour texture

political territory
   ↓
low-opacity pigment

selected territory
   ↓
stronger ink/pigment

routes
   ↓
fine dashed lines

sites
   ↓
tiny engraved symbols
```

The map should feel **printed**, not "Google Maps but beige."

---

# 08. The historical territory problem

This is one of the most important technical decisions.

Do not hardcode:

```tsx
<Polygon points="..." />
```

Instead define historical geometry as data.

```ts
type HistoricalBoundary = {
  polityId: string
  validFrom: number
  validTo: number
  geometry: GeoJSON.Feature
  confidence: "high" | "medium" | "low"
  sourceIds: string[]
}
```

Then:

```ts
getBoundariesAtYear(985)
```

returns the geometry.

This means the timeline can genuinely change the map.

---

# 09. The time machine

This should be one of the application's signature interactions.

Bottom:

```text
ANCIENT      CLASSICAL       EARLY MEDIEVAL       MEDIEVAL
   │             │                  │                 │

200 BCE ───── 200 ───── 600 ───── 900 ──●── 1200 ─── 1500
                                      985 CE
```

Dragging the cursor changes:

1. political boundaries
2. visible rulers
3. active events
4. major places
5. route networks
6. map labels
7. entity panel

But do **not** redraw the whole application.

Only transition affected layers.

---

# 10. Timeline animation

Use Motion for React for UI transitions.

For the map itself:

```ts
map.setFilter(...)
map.setPaintProperty(...)
map.flyTo(...)
```

rather than React re-rendering the entire map.

This distinction matters.

### React owns:

- panels
- typography
- controls
- drawers
- timeline UI

### MapLibre owns:

- geography
- polygons
- markers
- routes
- camera

This keeps the app fast.

---

# 11. Entity panel

When the user selects:

> CHOLA

don't navigate immediately.

Instead:

```text
                     CHOLA
                     சோழர்

                  c. 850–1279 CE

             IMPERIAL POLITY
             SOUTHERN INDIA

──────────────────────────────────

CAPITAL
Thanjavur

REGION
Tamilakam

KEY RULERS
Rajaraja I
Rajendra I

──────────────────────────────────

124 inscriptions
48 known major sites
27 associated rulers
63 cited references

             [OPEN FULL RECORD]
```

This is a **map-native preview**.

Clicking "Open Full Record" navigates to:

```text
/polities/chola
```

---

# 12. Entity pages

This is where the editorial personality explodes.

Not:

```text
Title
Card
Card
Card
Card
```

Instead:

```text
CHOLA
சோழர்

c. 850–1279 CE

──────────────────────────────

A major polity of southern India,
known for its expansive
administration, naval power,
and monumental architecture.

                         [IMAGE]
```

Then:

```text
OVERVIEW
RULERS
TERRITORY
PLACES
EVENTS
EVIDENCE
RELATED
```

Below:

### At a glance

### Territory

### Rulers

### Places

### Events

### Evidence

### Sources

The content should feel like a **scholarly publication**, not a profile page.

---

# 13. The really cool part: evidence trails

This is where BHĀRATA becomes different.

Suppose we say:

> Rajendra I conducted a northern campaign.

Don't just write it.

Show:

```text
CLAIM

"Rajendra I conducted a northern campaign."

       ↓

EVIDENCE

Tiruvilangadu inscription
Lines 12–18

       ↓

SOURCE

South Indian Inscriptions, Vol. III

       ↓

INTERPRETATION

Historical reconstruction based
on inscriptional evidence.

       ↓

UNCERTAINTY

Dating        ●●○
Interpretation ●●○
Geography     ●○○
```

That should be visually represented as a **thread**.

This becomes one of BHĀRATA's visual signatures.

---

# 14. IIIF changes the evidence experience

For manuscripts and inscriptions, investigate IIIF.

IIIF provides standardized image delivery and presentation APIs, including deep zoom and region-level access. [IIIF](https://iiif.io/assets/acc_implementation_guide_011017.pdf?utm_source=chatgpt.com)

So instead of:

> inscription.jpg

we can eventually have:

```text
┌───────────────────────────────────┐
│                                   │
│       INSCRIPTION IMAGE           │
│                                   │
│             ┌───────┐             │
│             │ text  │             │
│             └───────┘             │
│                                   │
└───────────────────────────────────┘

Selected lines: 12–18
```

The user can zoom into the exact region associated with a claim.

That is **genuinely mind-blowing**, because the evidence is no longer decorative imagery.

It becomes interactive source material.

---

# 15. Evidence page architecture

```text
/evidence/tiruvilangadu-inscription
```

Structure:

```text
EVIDENCE / INSCRIPTION 014

TIRUVILANGADU INSCRIPTION
OF RAJENDRA I

c. 11th century CE

──────────────────────────────────

[ LARGE IIIF IMAGE ]

──────────────────────────────────

METADATA              LOCATION

Date                  Tiruvilangadu
Material              Tamil Nadu
Script                Tamil
Language              Tamil
Catalogue ID          ASI No. 26/8

──────────────────────────────────

TRANSCRIPTION
TRANSLATION
NOTES
RELATED
```

Then:

```text
CLAIM       EVIDENCE       INTERPRETATION
```

This should feel almost like an investigation table.

---

# 16. Search becomes a major interaction

Use:

### `⌘ K`

or

### `Ctrl K`

Open:

```text
╭──────────────────────────────────────╮
│  Search the atlas...              ⌘K │
├──────────────────────────────────────┤
│                                      │
│  chola                               │
│                                      │
│  POLITIES                            │
│  Chola                    c.850–1279 │
│                                      │
│  PLACES                              │
│  Thanjavur                Tamil Nadu │
│                                      │
│  PEOPLE                              │
│  Rajaraja I               c.985–1014 │
│                                      │
│  EVIDENCE                            │
│  Thanjavur Inscription               │
│                                      │
╰──────────────────────────────────────╯
```

The search should understand:

```text
Chola
Rajaraja
Thanjavur
850
11th century
inscriptions
Tamil Nadu
```

Later, PostgreSQL FTS + `pg_trgm` can power this.

---

# 17. URL state is critical

A URL like:

```text
/atlas?
year=985
&polity=chola
&layers=territory,routes,sites
&zoom=5.4
```

means someone can send that exact exploration to someone else.

This is much more powerful than ordinary navigation.

The URL becomes:

> **a saved historical viewpoint.**

Later we can have:

```text
/atlas/chola-world-985
```

as curated collections.

---

# 18. Next.js architecture

Use Server Components aggressively.

### Server

```tsx
app/polities/[slug]/page.tsx
```

Fetch:

```text
polity
rulers
places
events
sources
evidence
```

Then pass the structured data to client components.

### Client

Only things like:

```tsx
<HistoricalMap />
<ChronologySlider />
<EntityPanel />
<SearchPalette />
<IIIFViewer />
```

should be client components.

This keeps the interactive surface focused.

---

# 19. Streaming

Use:

```text
loading.tsx
Suspense
```

for slower pieces.

Next.js supports streaming pages and individual components, allowing static parts of a page to appear while slower data loads. [Next.js](https://nextjs.org/learn/dashboard-app/streaming?utm_source=chatgpt.com)

For example:

```text
VIJAYANAGARA
──────────────────────

Hero                ← immediate

Overview             ← immediate

Territory            ← streamed

Rulers               ← streamed

Evidence             ← streamed

Sources              ← streamed
```

Never show a blank white loading page.

The skeleton itself should look like BHĀRATA.

---

# 20. Mobile is not desktop squeezed down

Mobile gets a completely different composition.

```text
┌────────────────────┐
│ BHĀRATA       ☰    │
├────────────────────┤
│                    │
│       MAP          │
│                    │
│        ●           │
│                    │
├────────────────────┤
│ CHOLA              │
│ சோழர்              │
│ c.850–1279         │
│                    │
│ [Explore record]   │
├────────────────────┤
│ 850 ──●──── 1279   │
└────────────────────┘
```

Swipe upward:

```text
ENTITY
↓
RULERS
↓
PLACES
↓
EVIDENCE
```

The map remains available rather than disappearing.

---

# 21. The navigation system

Desktop:

```text
BHĀRATA

ATLAS
CHRONOLOGY
POLITIES
PEOPLE
PLACES
EVIDENCE

────────────

COLLECTIONS
SOURCES
METHOD
```

But hide the navigation visually when the user is deeply exploring.

The interface should get out of the way.

Keyboard:

```text
⌘ K     Search
G A     Atlas
G C     Chronology
G P     Polities
G E     Evidence
Esc     Close panel
```

That creates a surprisingly powerful feeling.

---

# 22. Motion language

Motion needs rules.

### Camera

Slow.

```text
flyTo
duration: 800–1400ms
```

### Entity panels

Fast.

```text
180–280ms
```

### Timeline

Responsive.

```text
100–200ms
```

### Full-page transitions

Very subtle.

```text
300–450ms
```

Never:

- bounce everything
- parallax everything
- animate every card
- rotate icons unnecessarily

The map is already visually alive.

---

# 23. Cinematic transitions

There are three moments where we **break the normal UI**.

### 1. Entering a major historical period

The map expands.

```text
                 985 CE

       THE CHOLA WORLD
```

Then the interface returns.

### 2. Opening an entity

Map → location → record.

Camera:

```text
India
 ↓
South India
 ↓
Tamilakam
 ↓
Thanjavur
 ↓
Chola record
```

### 3. Opening evidence

Image expands to almost full viewport.

Then metadata appears around it.

This gives us cinematic moments without turning the whole application into a movie website.

---

# 24. Historical map sources

For initial geographic work:

### Natural Earth

Use it for:

- coastline
- rivers
- terrain
- country context
- geographic scaffolding

It is public domain. [Natural Earth Data](https://www.naturalearthdata.com/about/terms-of-use/?utm_source=chatgpt.com)

### OpenHistoricalMap

Use it as a historical geographic reference and potential data source. Its data is dedicated to the public domain except where otherwise noted. [OpenHistoricalMap](https://www.openhistoricalmap.org/?utm_source=chatgpt.com)

But:

### Never blindly treat either as historical truth.

Our curated historical data model remains authoritative for the project.

---

# 25. CARTO for prototype basemap

CARTO currently provides MapLibre-compatible basemaps and a free allowance, with up to 5M monthly tile requests for non-commercial use and 1M for commercial use under its current terms. Attribution is required. [CARTO](https://www.carto.com/basemaps/?utm_source=chatgpt.com)

So:

### Prototype

```text
MapLibre
+
CARTO
+
our historical layers
```

### Mature version

```text
MapLibre
+
our own vector tiles
+
Natural Earth
+
PostGIS
```

This removes dependence on a third-party visual style.

---

# 26. PMTiles later

Once historical geography becomes substantial:

```text
PostGIS
   ↓
GeoJSON / vector generation
   ↓
PMTiles
   ↓
MapLibre
```

Instead of sending enormous GeoJSON files to the browser.

This is the point where the map stops being a demo and starts becoming an actual atlas engine.

---

# 27. Wikidata

Use Wikidata as:

### enrichment

not

### authority.

For example:

```text
Rajendra I

BHĀRATA ID
P00182

Wikidata
Q312838
```

Then potentially enrich:

- aliases
- external identifiers
- birth/death information
- related people
- multilingual labels

But don't query Wikidata live for every page.

Its SPARQL service is currently much less responsive than historical benchmarks, with some queries timing out. [Wikidata](https://www.wikidata.org/wiki/Wikidata%3ASPARQL_query_service/query_limits?utm_source=chatgpt.com)

Instead:

```text
Wikidata
   ↓
ingestion job
   ↓
PostgreSQL
   ↓
BHĀRATA
```

---

# 28. The database eventually becomes beautiful

Your DBMS requirement actually fits naturally here.

The eventual domain model:

```text
POLITY
   │
   ├── RULED_BY → PERSON
   │
   ├── EXISTS_IN → PERIOD
   │
   ├── LOCATED_IN → REGION
   │
   ├── CONTROLLED → PLACE
   │
   ├── PARTICIPATED_IN → EVENT
   │
   └── SUPPORTED_BY → CLAIM

CLAIM
   │
   └── SUPPORTED_BY → EVIDENCE

EVIDENCE
   │
   └── DOCUMENTED_IN → SOURCE
```

This is where your DBMS course material becomes **structurally meaningful**, instead of being stapled onto the project.

---

# 29. Database-backed frontend architecture

Eventually:

```text
                    NEXT.JS
                       │
          ┌────────────┴────────────┐
          │                         │
     Server Components        Route Handlers
          │                         │
          └──────────┬──────────────┘
                     │
                DOMAIN SERVICES
                     │
              PostgreSQL/PostGIS
                     │
       ┌─────────────┼─────────────┐
       │             │             │
    Entities      Geography      Evidence
```

Client:

```text
MapLibre
Timeline
Search
IIIF Viewer
Panels
```

This is a clean architecture.

---

# 30. Design tokens

Do this **before** rebuilding components.

Something like:

```css
--bh-bg: ...
--bh-paper: ...
--bh-ink: ...
--bh-muted: ...
--bh-border: ...
--bh-accent: ...
--bh-water: ...
--bh-territory: ...
```

Typography:

```text
Display
Zodiak

Interface
Ranade

Indic / multilingual
Anek

Historical Devanagari
Tiro Devanagari Hindi
```

Don't allow individual components to invent their own typography.

---

# 31. The colour system

Keep it narrow.

### Base

```text
Ink
Paper
Ash
Stone
```

### Geographic

```text
Water
Land
Terrain
```

### Semantic

```text
Territory
Evidence
Uncertainty
Active
```

And use accent colour **sparingly**.

The Chola can have a pigment.

Vijayanagara can have another.

But don't turn every polity into a rainbow.

---

# 32. Richness without clutter

This is the most important UI rule.

Every screen gets:

### One dominant object.

For Atlas:

> Map

For Entity:

> Entity

For Evidence:

> Object

For Chronology:

> Time

Everything else supports it.

So:

```text
MAP
 ├── chronology
 ├── layers
 ├── entity
 └── annotations
```

Not:

```text
map
card
card
card
chart
chart
chart
stats
stats
stats
```

That's the difference between **information density** and **information noise**.

---

# 33. The "depth" system

Use three levels.

### Level 1
Immediately visible.

### Level 2
Click / hover / expand.

### Level 3
Deep investigation.

Example:

```text
CHOLA
```

Visible:

```text
c. 850–1279
Southern India
```

Click:

```text
Rulers
Places
Events
```

Investigate:

```text
Rajaraja I
 ↓
Brihadisvara Temple
 ↓
Inscription
 ↓
Claim
 ↓
Source
```

The interface gradually reveals complexity.

---

# 34. Don't make everything a card

This is important.

Use:

### cards
for genuinely grouped information.

### rules
for editorial separation.

### whitespace
for hierarchy.

### typography
for emphasis.

### map overlays
for geographic context.

### drawers
for temporary information.

### full pages
for things worth remembering.

This alone will make the UI dramatically less AI-generated.

---

# 35. Build the design system first

Create:

```text
components/primitives/

Text
Heading
Eyebrow
Rule
Button
IconButton
Badge
Divider
Tooltip
Popover
Dialog
Drawer
Tabs
ImageFrame
MetadataRow
SourceCitation
EvidenceMarker
```

Then:

```text
components/entities/
components/map/
components/evidence/
```

should compose these primitives.

---

# 36. The implementation order

This is the order I would actually build it.

## Phase 0
### Repository recovery

First verify the application source on `main`.

If the current tree really contains only:

```text
AGENTS.md
DESIGN.md
PROJECT_BIBLE.md
```

restore/recreate the application scaffold before touching visual work.

---

# Phase 1
## Foundation

Install/configure:

```text
Next.js
TypeScript
Tailwind
Motion
MapLibre
Lucide
Radix
Zod
```

Create:

```text
design tokens
fonts
global styles
layout
navigation
responsive breakpoints
```

Deliverable:

**empty BHĀRATA shell that already looks finished.**

---

# Phase 2
## Map engine

Build:

```text
HistoricalMap
MapControls
MapLayers
PolityLayer
PlaceLayer
RouteLayer
MapLabels
```

Start with:

```text
India
+
South Asia
+
major rivers
+
major cities
```

Then add:

```text
Chola
Pandya
Chera
Hoysala
Chalukya
Vijayanagara
```

Deliverable:

**beautiful interactive historical map.**

---

# Phase 3
## Time engine

Create:

```text
Chronology
TimelineCursor
PeriodMarkers
HistoricalState
```

Core function:

```ts
getHistoricalState(year)
```

Then connect:

```text
year
 ↓
map
 ↓
entities
 ↓
events
```

Deliverable:

**dragging through history genuinely changes the world.**

---

# Phase 4
## Entity engine

Build:

```text
EntityPreview
EntityPage
EntityHeader
EntityMetadata
EntityTimeline
EntityTerritory
EntityRulers
EntityPlaces
EntityEvidence
EntitySources
```

Deliverable:

**Chola / Vijayanagara pages feel like actual digital scholarship.**

---

# Phase 5
## Evidence engine

Build:

```text
EvidencePage
EvidenceImage
EvidenceMetadata
Transcription
Translation
Claim
EvidenceLink
Interpretation
Uncertainty
SourceReference
```

Then implement the visual:

```text
CLAIM
 ↓
EVIDENCE
 ↓
SOURCE
```

Deliverable:

**BHĀRATA gets its distinctive intellectual identity.**

---

# Phase 6
## IIIF

Initially:

```text
static images
```

Then:

```text
IIIF manifest
 ↓
IIIF image
 ↓
deep zoom
 ↓
region selection
```

Eventually:

```text
image region
 ↓
transcription line
 ↓
claim
```

This is one of the features I'd reserve for the "holy shit" moment of the project.

---

# Phase 7
## Search

Build:

```text
CommandPalette
SearchInput
SearchResults
SearchFilters
RecentSearches
```

Initially local data.

Then PostgreSQL:

```sql
to_tsvector(...)
```

and:

```sql
pg_trgm
```

for fuzzy matching.

---

# Phase 8
## Cinematic interactions

Only **after** the information architecture works.

Implement:

### Map fly-to

```text
India
→ South India
→ Thanjavur
```

### Entity opening

```text
map
→ preview
→ full record
```

### Time transition

```text
985 CE
→
1014 CE
```

### Evidence opening

```text
thumbnail
→
full archival object
```

These should feel deliberate.

---

# Phase 9
## Mobile

Don't just test desktop at 390px.

Create dedicated compositions.

Mobile priorities:

```text
MAP
ENTITY
TIME
SEARCH
EVIDENCE
```

Navigation becomes bottom/sheet-driven.

---

# Phase 10
## Performance

Then attack:

### Bundle size

MapLibre should not dominate the initial page.

Load it only where needed.

### Images

Use:

```tsx
next/image
```

### Map

Don't load every layer immediately.

### Search

Debounce.

### Database

Cache stable historical records.

### Server

Use streaming/Suspense where appropriate. [Next.js](https://nextjs.org/learn/dashboard-app/streaming?utm_source=chatgpt.com)

---

# 37. Performance architecture

The ideal initial request:

```text
HTML
 ├── typography
 ├── navigation
 ├── hero
 └── initial map shell
```

Then:

```text
map engine
 ↓
historical layers
 ↓
entity data
 ↓
secondary evidence
```

Not:

```text
DOWNLOAD ENTIRE HISTORY OF INDIA
```

on page load. 😭

---

# 38. Accessibility

This should be designed in, not patched later.

Map interactions need keyboard alternatives.

Every:

```text
colour
```

must have:

```text
label
```

Every:

```text
icon
```

needs accessible meaning.

Every:

```text
motion
```

must respect:

```css
prefers-reduced-motion
```

The timeline must work without dragging.

The map must have a textual alternative.

---

# 39. Testing strategy

Use:

### Vitest

For:

```text
getHistoricalState()
getPolityAtYear()
searchEntities()
formatDateRange()
```

### Playwright

For:

```text
open atlas
select Chola
move timeline
open entity
open evidence
search Thanjavur
navigate back
```

### Visual regression

Take screenshots at:

```text
1440px
1280px
1024px
768px
390px
```

This is extremely important for this project.

---

# 40. The visual review loop

Every major page goes through:

### Pass 1
Does it work?

### Pass 2
Does it look good?

### Pass 3
Does it feel like BHĀRATA?

### Pass 4
Can I remove 10%?

### Pass 5
Is anything visually shouting for no reason?

### Pass 6
Can someone understand the page in 5 seconds?

### Pass 7
Can someone explore it for 30 minutes?

That last two tests matter enormously.

---

# 41. The final route map

The finished frontend should roughly become:

```text
/
│
├── /atlas
│
├── /chronology
│
├── /polities
│   └── /chola
│       ├── overview
│       ├── rulers
│       ├── territory
│       ├── places
│       ├── events
│       └── evidence
│
├── /people
│   └── /rajaraja-i
│
├── /places
│   └── /thanjavur
│
├── /evidence
│   └── /tiruvilangadu-inscription
│
├── /sources
│   └── /south-indian-inscriptions
│
├── /collections
│
├── /search
│
└── /method
```

---

# 42. The final architecture

The whole thing eventually looks like:

```text
                         BHĀRATA
                            │
                     ┌──────┴──────┐
                     │             │
                  NEXT.JS       URL STATE
                     │
          ┌──────────┼───────────┐
          │          │           │
       SERVER      CLIENT      DATABASE
       COMPONENTS  COMPONENTS   LAYER
          │          │           │
          │          ├── MapLibre│
          │          ├── Timeline│
          │          ├── Search  │
          │          └── IIIF    │
          │                      │
          └──────────┬───────────┘
                     │
                 POSTGRESQL
                  + POSTGIS
                     │
       ┌─────────────┼──────────────┐
       │             │              │
    ENTITIES      GEOGRAPHY      EVIDENCE
       │             │              │
       └─────────────┼──────────────┘
                     │
                  SOURCES
```

And external data:

```text
Natural Earth ──────┐
OpenHistoricalMap ──┤
Wikidata ───────────┼──→ INGESTION → PostgreSQL
IIIF repositories ──┤
Historical sources ─┘
```

---

# 43. What makes this "mind-blowing"

Not animations.

Not fancy gradients.

Not WebGL for the sake of saying WebGL.

The magic comes from **relationships**.

Imagine doing this:

> Drag timeline to 1014 CE.

The map changes.

You see Chola territory.

You click Thanjavur.

A panel opens.

You click Rajaraja I.

His record appears.

You see an inscription.

Click it.

The inscription expands.

You select a line.

The corresponding claim highlights.

Click the claim.

The source opens.

Then:

**"View this claim on the historical map."**

And you're back where you started.

That is the experience.

The interface becomes a **web of historical relationships**.

That is far more impressive than 40 animated cards.

---

# 44. The development milestones

I'd structure the actual build as:

### M0
**Repository + architecture recovery**

### M1
**BHĀRATA visual system**

### M2
**Map engine**

### M3
**Chronology engine**

### M4
**Entity system**

### M5
**Evidence system**

### M6
**Search + command palette**

### M7
**IIIF archival layer**

### M8
**PostgreSQL/PostGIS integration**

### M9
**External-data ingestion**

### M10
**Cinematic interaction pass**

### M11
**Mobile + accessibility**

### M12
**Performance + testing**

### M13
**Final editorial polish**

And only **after M13** should we call it finished.

---

## The one architectural principle I would tattoo onto this project

> **The interface should never merely display the historical database. It should make the relationships inside the database visible.**

That is the bridge between your **DBMS project**, the historical-atlas idea, and the ridiculous level of frontend quality you're aiming for.

The map shows **where**.  
The chronology shows **when**.  
The entities show **who/what**.  
The evidence shows **how we know**.  
The sources show **where the knowledge comes from**.

And Next.js becomes the machinery quietly holding that whole thing together. 🗺️