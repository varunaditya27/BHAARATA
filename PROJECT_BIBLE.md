# BHĀRATA — PROJECT BIBLE

> Canonical product, research, engineering, and experience brief for BHĀRATA. Read this before changing architecture, content, data, or user experience.

## 1. Product

**BHĀRATA is a source-aware, time-aware digital historical atlas for exploring the political, geographic, material, and intellectual history of the Indian subcontinent without collapsing complex historical realities into static borders, king lists, or a single narrative.**

Core journey:

**place → polity → time → event → evidence → source**

BHĀRATA should feel like an excellent atlas, museum research interface, or scholarly publication that happens to be interactive.

It is not a generic history blog, king-list, Wikipedia clone, modern political map projected backward, SaaS dashboard, social network, quiz app, or chatbot wearing a history costume.

AI may assist search, discovery, extraction, translation, summarisation, or ingestion. AI is not the product identity and must not silently become the historical authority.

## 2. North Star

> Make the history of the Indian subcontinent spatially explorable, temporally legible, and evidentially accountable.

### Spatially explorable

Places, routes, settlements, capitals, archaeological sites, ecological regions, trade networks, and political centres are first-class objects.

### Temporally legible

Political geography changes. Users should be able to move through time rather than treating history as a single static map.

### Evidentially accountable

Important assertions should eventually lead toward their source records, objects, publications, datasets, or other evidence.

## 3. Product values

**Curiosity**  
Encourage wandering. A polity can lead to a ruler, a place, an inscription, a trade route, another polity.

**Precision**  
Never make a claim sound more certain than the record allows.

**Context**  
A ruler needs a period. A monument needs a place. A claim needs provenance.

**Legibility**  
Complex history does not justify confusing interaction design.

**Restraint**  
Use typography, composition, rhythm, hierarchy, and material cues before decoration.

**Traceability**  
The user should be able to ask “how do we know this?” and receive an actionable path.

**Plurality**  
Where scholarship contains competing interpretations, the data model should be able to represent them.

## 4. Audience

Primary:

- curious, digitally fluent readers exploring Indian history
- readers interested in place, time, power, and evidence

Secondary:

- university students
- educators
- researchers
- history enthusiasts
- museum and heritage audiences
- developers building educational/research experiences

Experts should not need a specialist GIS mindset merely to use the interface.

## 5. Core object graph

```
POLITY
  ↕
PERSON / RULER
  ↕
EVENT
  ↕
PERIOD / DATE RANGE
  ↕
PLACE
  ↕
GEOMETRY
  ↕
OBJECT / SITE
  ↕
CLAIM
  ↕
SOURCE / EDITION / REFERENCE
```

The interface should make movement through this graph natural.

Example:

```
Vijayanagara
   ↓
Kṛṣṇadevarāya
   ↓
historical event
   ↓
Vijayanagara region
   ↓
Hampi archaeological landscape
   ↓
inscription / monument / publication
   ↓
source metadata
```

## 6. Target domain model

### Polity

Suggested fields:

- id
- names
- alternative names
- transliteration variants
- polity type
- start/end periods
- date confidence
- capitals
- associated places
- people
- events
- geographic relationships
- claims
- source relationships
- notes

### Person

Rulers, administrators, intellectuals, religious figures, military actors, travellers, authors, and other historically relevant individuals.

### Place

Cities, settlements, capitals, ports, temple complexes, forts, archaeological sites, regions, geographic features, and other spatial entities.

### Event

A historically meaningful occurrence.

Support:

- exact dates when justified
- approximate dates
- date ranges
- date confidence
- associated places
- associated polities
- associated people
- sources
- related events

### Claim

A first-class historical assertion.

A claim should represent:

- proposition
- subject/entity
- time
- place
- source support
- evidence type
- interpretation status
- uncertainty
- conflicting claims

### Source

Bibliographic, archival, archaeological, epigraphic, numismatic, cartographic, or digital source.

### Evidence object

Physical/documentary material from which historical evidence is derived:

- inscription
- coin
- monument
- manuscript
- archaeological layer
- seal
- sculpture
- architectural feature
- archival record

## 7. Temporal policy

Time is foundational.

Never assume one integer year is sufficient.

Support eventually:

- year
- month/day where genuinely warranted
- start/end range
- circa
- before/after relations
- uncertain intervals
- overlapping periods
- textual dating
- scholarly dating
- alternative chronologies

Frontend language must preserve uncertainty.

Examples:

- c. 320–550 CE
- probably 11th century
- before 1200 CE
- dated to the early medieval period
- traditionally associated with…

Never turn uncertain chronology into fake precision.

## 8. Geographic policy

The map is a primary reasoning surface, not decoration.

The geographic layer should eventually support:

- points
- routes
- regions
- historical place coordinates
- time-indexed extents
- uncertain geometry
- multiple competing reconstructions
- scale-aware rendering

Critical rule:

**Do not portray ancient or medieval political space as though it were a modern nation-state boundary map.**

Where an extent is reconstructed, make the reconstruction semantically visible.

## 9. Evidence and provenance

BHĀRATA's credibility should come from traceability.

Important assertions should eventually connect to:

- source
- source type
- citation
- publication/edition
- external identifier
- repository/collection
- object identifier
- page / inscription / catalogue reference
- uncertainty
- interpretive notes

The evidence layer serves both research infrastructure and reader-facing explanation.

## 10. Data policy

Prototype records are acceptable during UI development and must remain clearly illustrative.

Production data must not be invented to make the interface look fuller.

Unknown ≠ empty.  
Uncertain ≠ false.  
Missing ≠ zero.

## 11. AI policy

AI can support:

- semantic search
- corpus question answering
- discovery
- entity linking assistance
- metadata extraction
- source summarisation
- translation assistance
- research workflows
- assisted ingestion
- clustering/classification

AI-derived answers should ideally expose:

- answer
- retrieved evidence
- source references
- uncertainty
- retrieval context
- whether a statement is source-derived or model-generated

Never:

- fabricate citations
- invent source metadata
- imply scholarship where none exists
- turn inference into fact
- hide uncertainty for smoother prose

## 12. Information architecture

Primary surfaces:

### Atlas
Spatial exploration and entity discovery.

### Chronology
Temporal exploration and event relationships.

### Entity
Deep views for polity, person, place, event, or object.

### Evidence
Sources, artefacts, inscriptions, citations, and provenance.

### Collections
Curated thematic journeys.

### Search
Cross-domain discovery.

### Method
How the corpus is built, interpreted, and rendered.

## 13. Search philosophy

Search is a discovery surface, not merely a filter.

Support:

- canonical names
- alternate spellings
- transliteration
- rulers
- places
- source terms
- periods
- tags
- semantic relationships
- natural-language questions later

Make domain type explicit in results.

Example:

```
Vijayanagara
POLITY

Hampi
PLACE

Kṛṣṇadevarāya
PERSON

Tāḷikōṭa
EVENT

Hampi inscription
EVIDENCE
```

## 14. Product personality

BHĀRATA should feel:

- editorial
- cinematic
- archival
- intellectual
- tactile
- restrained
- atmospheric
- precise
- curious
- contemporary

It should not feel:

- corporate
- generic AI
- template-generated
- glossy
- neon
- dashboard-like
- over-rounded
- decorative without meaning

## 15. Engineering architecture

Maintain these boundaries:

```
Domain data
    ↓
Data access / queries
    ↓
Application state
    ↓
Domain components
    ↓
UI primitives
    ↓
Routes / compositions
```

Do not put database calls, historical rules, large data literals, and complex rendering logic into one component.

Use domain language in filenames and props.

## 16. Target project structure

```
app/
components/
  atlas/
  chronology/
  entity/
  evidence/
  search/
  collections/
  layout/
  ui/
hooks/
lib/
  domain/
  data/
  queries/
  utils/
  validation/
server/
  db/
  services/
  ingestion/
  search/
public/
styles/
tests/
docs/
```

The exact folders may evolve. Separation of concerns should not.

This is the **target**. The structure that exists today is described in `docs/ARCHITECTURE.md`; `server/`, `hooks/`, `tests/` and `queries/` do not exist yet (see `docs/BACKLOG.md`).

## 17. Quality bar

A feature is not done because it renders.

It is done when:

- purpose is obvious
- interaction makes sense
- hierarchy is intentional
- content is meaningful
- loading/error/empty states exist where relevant
- mobile works
- keyboard interaction works
- reduced motion works
- historical uncertainty is honest
- domain logic remains modular
- no generic AI defaults leaked into the visual design

## 18. AI-agent operating rules

Before UI implementation:

1. Read PROJECT_BIBLE.md.
2. Read `docs/DESIGN.md`.
3. Inspect current architecture.
4. Identify affected domain boundaries.
5. Define interaction and content states.
6. Implement the smallest coherent feature.
7. Audit visually and interactively.
8. Remove generic defaults.
9. Verify accessibility and responsive behaviour.
10. Document meaningful architectural changes in `docs/ARCHITECTURE.md`.

Agents contribute code. They do not define product identity.

## 19. Evolution plan

### Phase I — Experience foundation
- modular frontend
- atlas interactions
- chronology
- evidence surfaces
- routing
- design contract

### Phase II — Historical data foundation
- domain schema
- PostgreSQL
- PostGIS
- source model
- claim model
- uncertainty model
- historical place model

### Phase III — Real atlas
- real geographic layers
- time-indexed spatial queries
- entity pages
- cross-domain search
- source navigation

### Phase IV — Research interface
- advanced filters
- comparison views
- collections
- saved explorations
- citation workflows

### Phase V — Responsible AI
- source-grounded search
- research assistant
- assisted discovery
- ingestion assistance
- transparent retrieval/citations

## 20. Non-negotiables

1. Never fabricate historical authority.
2. Never sacrifice traceability for visual polish.
3. Never make the map a decorative background.
4. Never turn BHĀRATA into generic SaaS.
5. Never let AI become the product's personality.
6. Never hide important uncertainty.
7. Never make a beautiful screen whose interaction model is unclear.
8. Never allow temporary data to masquerade as a scholarly corpus.
9. Never optimize for screenshots at the expense of actual exploration.
10. Every major feature must have a reason to exist.

## 21. Final test

Ask:

> Does this help a person understand how people, places, powers, events, and evidence relate across time?

If yes, keep exploring.

If no, reconsider the feature.

**BHĀRATA is a system for seeing relationships, not collecting facts.**
