# BHĀRATA — DESIGN.md

> Execution-level visual and interaction constitution for BHĀRATA.
>
> Read this file before creating, modifying, reviewing, or polishing any user-facing interface.

---

# 01 — PRIMARY DIRECTIVE

Build an interface that feels **authored, not assembled**.

BHĀRATA is an editorial historical atlas. Its interface should carry the authority of careful typography and cartographic composition without pretending the historical record is perfectly certain.

The visual language is:

**cinematic + editorial + cartographic + archival + contemporary**

The result can be striking, but never decorative for decoration's sake.

---

# 02 — CORE COMPOSITION

Do not default to:

```
hero
↓
three cards
↓
metrics
↓
CTA
```

BHĀRATA's native composition is:

```
PLACE
↓
MAP
↓
TIME
↓
ENTITY
↓
EVIDENCE
↓
SOURCE
```

The product should feel like a living atlas made interactive.

---

# 03 — ANTI-AI-SLOP PRINCIPLE

AI-generated interfaces often converge on familiar visual defaults. Current public frontend-agent research repeatedly calls out generic gradients, glass surfaces, oversized cards, fake dashboards, vague SaaS copy, excessive pills, and decorative interaction as recurring signals. The deeper pattern is not one particular color palette. It is **unexamined defaulting**. 

Therefore:

> **Do not merely avoid known “slop tells.” Make product-specific decisions.**

An interface can use cream, serif typography, thin rules, or editorial layouts and still become generic if those choices are copied mechanically.

---

# 04 — NEVER DEFAULT TO

Avoid unless a very specific product reason exists:

- purple/blue AI gradients
- neon accents
- glassmorphism
- translucent floating panels
- giant rounded rectangles
- excessive pill controls
- generic KPI dashboards
- fake analytics
- decorative “AI” badges
- generic assistant avatars
- gradient text
- glow borders
- stock tech imagery
- abstract blob backgrounds
- gratuitous parallax
- cursor trails
- card tilts
- bounce/spring effects on ordinary controls
- centered marketing hero layouts by reflex
- repeated three-card feature grids
- vague CTA copy
- hover-only historical meaning
- fake loading animations with no task value

These patterns are not forbidden because they are inherently bad. They are rejected because they are disproportionately associated with generated, interchangeable interface output.

---

# 05 — DO NOT CREATE “ANTI-SLOP SLOP”

Never replace generic AI UI with another rigid recipe such as:

```
cream
+ serif
+ red
+ thin border
+ huge heading
```

and call the interface distinctive.

Those ingredients may fit BHĀRATA, but only where they have a reason.

Ask of every major visual decision:

**What product, content, audience, or interaction problem does this solve?**

If the answer is unclear, reconsider.

---

# 06 — VISUAL DNA

Use contemporary translations of:

- atlases
- field notes
- cartography
- archival labels
- museum catalogues
- scholarly marginalia
- engraved maps
- epigraphy
- manuscripts
- architecture
- editorial magazines
- scientific plates
- old photographs

Do not literalistically cosplay these references.

Borrow their qualities:

- materiality
- evidence
- hierarchy
- annotation
- pacing
- precision
- restraint

---

# 07 — MATERIAL PALETTE

Think:

- paper
- ink
- graphite
- red earth
- oxidised pigment
- faded archive labels
- bronze
- stone
- occasional indigo

The implementation should remain crisp.

Use subtle CSS texture only when it improves atmosphere without harming legibility or performance.

Do not rely on heavy background images to manufacture “archival” mood.

---

# 08 — COLOR SYSTEM

Core tokens should express a small, stable hierarchy:

```
--paper
--paper-deep
--ink
--muted
--faint
--line
--line-heavy
--accent
```

The primary accent may be earthy red.

Accent should encode:

- selected state
- important event
- provenance signal
- annotation
- navigation emphasis

Do not spray accent color across the screen.

Additional colors are allowed only when they encode real domain distinctions.

Never use color as the sole state indicator.

---

# 09 — TYPOGRAPHY

Typography is structural.

### Editorial serif

Use for:

- display headings
- entity names
- historical titles
- quotations
- narrative text

### Functional sans

Use for:

- navigation
- controls
- supporting UI
- compact explanatory copy

### Mono

Use intentionally for:

- metadata
- source IDs
- dates
- map labels
- technical references

Do not turn every tiny label into uppercase monospace. That creates a style gimmick instead of information hierarchy.

---

# 10 — TYPE SCALE

Use contrast, not uniformity.

Suggested ranges:

```
Display     72–180 px
Section     42–88 px
Entity      32–58 px
Body        15–20 px
UI          11–14 px
Meta        8–11 px
```

Treat these as ranges.

Large type should establish hierarchy or atmosphere, not prove that the page is “modern.”

---

# 11 — RHYTHM

Good editorial rhythm can move through:

```
small datum
     ↓
large statement
     ↓
supporting context
     ↓
data surface
     ↓
annotation
```

Avoid endless repetition of:

heading + paragraph + card.

The page should have a pulse.

---

# 12 — GRID

Prefer:

- asymmetric columns
- deliberate offsets
- strong vertical alignment
- horizontal rules
- variable section widths
- generous negative space
- edge alignment

Use grids to support information architecture, not because the screen has empty space to fill.

---

# 13 — SPACING

Establish a token rhythm such as:

```
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 80 / 120 / 160
```

The precise implementation may vary.

Do not scatter arbitrary spacing values through every component without a geometry or content reason.

---

# 14 — RULES AND BORDERS

Hairline rules are useful when they:

- separate records
- define editorial columns
- establish hierarchy
- connect metadata
- create pacing

Do not outline every element.

A rule should organise information, not merely draw boxes.

---

# 15 — SURFACE LANGUAGE

Prefer:

- paper on paper
- paper-deep panels
- thin rules
- rare restrained shadow
- image as surface

Avoid:

- stacked floating-card piles
- blurred glass
- giant rounded shells
- heavy drop shadows
- glowing edges

---

# 16 — MAP

The map is one of the protagonists.

Priorities:

1. geography
2. selected entity
3. relevant relationships
4. chronology
5. labels
6. controls
7. annotations

Map controls should be quiet and precise.

They should not look like a game HUD.

When a user selects a location:

1. maintain orientation
2. emphasise the target
3. update entity context
4. expose useful related evidence

Do not zoom dramatically for every click.

---

# 17 — CHRONOLOGY

Time should feel manipulable.

Use:

- scrubber
- event markers
- date ranges
- context labels
- entity relationships

Scrubbing time should produce comprehensible changes.

Avoid generic timeline-card galleries.

---

# 18 — ENTITY DESIGN

Every entity should answer:

**What is this?**

**When?**

**Where?**

**What connects to it?**

**How do we know?**

Suggested order:

```
name
descriptor
dates
interpretation
facts
relationships
evidence
sources
```

Dates and identity should not be buried in prose.

---

# 19 — EVIDENCE DESIGN

Evidence is materially different from ordinary content.

Use:

- source labels
- record/reference IDs
- date
- source type
- short quotations when appropriate
- object/site imagery
- citation metadata
- uncertainty

A source is not simply a card. It is a node in the evidence chain.

---

# 20 — IMAGERY

Use images because they reveal something.

Good categories:

- inscriptions
- archaeological remains
- artefacts
- historic maps
- manuscripts
- architectural details
- landscapes
- archival photography

Avoid:

- generic stock photography
- “historian at laptop” imagery
- fake historical scenes
- AI-generated reconstructions presented as evidence
- decorative image galleries with no semantic role

---

# 21 — ICONOGRAPHY

Icons should:

- support recognition
- remain subordinate to text
- use a consistent stroke language
- have accessible names where interactive

Never add an icon merely because a component feels empty.

---

# 22 — MOTION SYSTEM

Motion should communicate:

- origin
- destination
- change
- relationship

Suggested ranges:

```
micro       120–180 ms
standard    180–300 ms
spatial     300–650 ms
editorial   650–1000 ms
```

Prefer restrained ease-out transitions.

Avoid ornamental physics.

---

# 23 — REDUCED MOTION

Respect:

```
@media (prefers-reduced-motion: reduce)
```

The interface must remain understandable when animation disappears.

---

# 24 — INTERACTION PRINCIPLE

Every action needs an obvious cause and visible result.

Bad:

click something → an unrelated part of the page quietly changes

Good:

select polity → map target changes + entity context updates + relevant relationships become discoverable

---

# 25 — MICROINTERACTIONS

Good:

- selected marker changes state
- underline draws in
- chronology marker moves
- drawer enters from its spatial edge
- evidence reference becomes visible at a meaningful moment

Bad:

- random 3D card tilt
- button grows merely on hover
- icon spins without semantic purpose
- perpetual background animation

---

# 26 — BUTTON COPY

Label the actual action.

Prefer:

- Open source index
- View evidence
- Locate centre
- Browse chronology
- Compare periods

Avoid vague labels such as “Continue” or “Explore” when the destination can be named.

Vercel's current Web Interface Guidelines explicitly recommend clear action labels and visible keyboard focus and mobile hit targets.

---

# 27 — SEARCH

Search is a research interaction.

Support:

- keyboard focus
- visible results
- empty state
- no-results state
- loading state
- filter clearing
- preserved query when useful

The search interface should expose domain types, not return an undifferentiated text dump.

---

# 28 — DIALOGS AND DRAWERS

Dialogs must:

- have an accessible name
- provide a clear close action
- manage focus appropriately
- return focus to the trigger where applicable
- avoid obscuring necessary context

The source drawer should feel like a continuation of the document.

---

# 29 — RESPONSIVE DESIGN

Mobile is not “desktop but smaller.”

Compose mobile intentionally.

Preserve:

- primary reading hierarchy
- map orientation
- chronology discoverability
- touch-friendly controls
- meaningful metadata

Reduce simultaneity rather than merely shrinking everything.

Current Vercel guidance recommends mobile hit targets of at least 44 px.

---

# 30 — ACCESSIBILITY

Required:

- keyboard operation
- visible `:focus-visible`
- semantic headings
- landmarks
- labelled controls
- correct button/link semantics
- text alternatives for meaningful images
- no critical hover-only information
- focus management
- reduced-motion support
- sensible contrast

Accessibility is part of composition.

If accessibility conflicts with a decorative idea, remove or redesign the decorative idea.

---

# 31 — CONTENT-FIRST STRESS TEST

Before shipping a component, test it with:

- very long title
- very short title
- missing metadata
- long paragraph
- no image
- one image
- several images
- long place name
- uncertain dates

A design that works only with ideal mock copy is not production-ready.

---

# 32 — STATE COMPLETENESS

Meaningful interactive components should consider:

- default
- hover
- focus
- active
- selected
- loading
- disabled
- empty
- error
- unavailable

State is product behaviour, not polish.

---

# 33 — DENSITY

BHĀRATA is allowed to be information-dense.

The problem is unorganised density.

Use:

- hierarchy
- grouping
- alignment
- spacing
- rules
- progressive disclosure

Do not solve every density problem by turning information into cards.

---

# 34 — EDITORIAL COMPOSITION

A major section should usually contain:

### One dominant visual idea

Map, entity, chronology, evidence object, or major statement.

### One supporting idea

Context, metadata, annotation, or narrative.

### One discovery route

A clear next meaningful exploration.

Do not create ten competing CTAs.

---

# 35 — CINEMATIC DOES NOT MEAN “MOVIE WEBSITE”

Do not confuse cinematic design with:

- giant dark gradients
- lens flares
- trailer typography
- full-screen transitions
- excessive parallax
- constant motion

For BHĀRATA, cinematic means:

**scale + pacing + atmosphere + composition + meaningful movement**

---

# 36 — EDITORIAL DOES NOT MEAN “OLD”

Archival references are a vocabulary, not a costume.

Modern implementation still requires:

- fast interaction
- responsive design
- strong keyboard behaviour
- URL-addressable state
- clear navigation
- robust mobile behaviour

---

# 37 — AI INTERFACE

When AI is introduced, present it as a research instrument.

Prefer:

```
ASK THE CORPUS

Which inscriptions connect this polity to this region?

[ Search ]

Answer
Retrieved records
Sources
Uncertainty
Related entities
```

Avoid:

```
✨ AI MAGIC
Ask our intelligent history copilot anything!!!
```

AI should feel useful, not theatrical.

---

# 38 — AI-GENERATED PROSE

Never let generated prose visually masquerade as primary evidence.

Preferred hierarchy:

```
AI summary
    ↓
retrieved evidence
    ↓
source metadata
```

The user should be able to distinguish synthesis from evidence.

---

# 39 — FRONTEND ARCHITECTURE

Organise by domain:

```
components/
  atlas/
  chronology/
  entity/
  evidence/
  search/
  collections/
  layout/
  ui/
```

Avoid giant `page.tsx` files.

Avoid names that describe visual accidents:

- BigCard
- CoolSection
- FancyPanel

Prefer domain names.

---

# 40 — DESIGN TOKENS

Centralise stable decisions around:

- colour
- typography
- spacing
- radii
- shadows
- motion
- layering
- breakpoints

Do not over-tokenise trivial one-offs.

Tokens should capture decisions that matter.

---

# 41 — VISUAL CODE QUALITY

Prefer:

- explicit props
- domain types
- focused hooks
- semantic HTML
- reusable primitives
- small render components
- CSS variables for system primitives
- predictable state

Avoid:

- giant inline style objects
- duplicated markup
- arbitrary magic numbers
- business rules hidden inside visual components
- tangled data fetching
- presentation components owning unrelated domain logic

---

# 42 — AGENT REVIEW LOOP

Every substantial UI change gets three reviews.

### Product review
Does this improve historical exploration?

### Craft review
Does this feel specifically designed for BHĀRATA?

### Interface review
Does it work across keyboard, mobile, loading, empty, error, and reduced-motion states?

Vercel explicitly recommends an in-repo design contract and an agent-oriented UI review workflow. citeturn622433search0

---

# 43 — SECOND-LOOK TEST

After implementation, stop thinking like the author.

Look at the interface as a stranger.

Ask:

- What do I see first?
- Do I know what this surface represents?
- Do I know what is interactive?
- Do I understand what changed after interaction?
- Does anything feel like filler?
- Does the design feel specific to BHĀRATA?
- Could this be generated for a hundred unrelated products?

Fix what the second look reveals.

---

# 44 — REMOVE-10-PERCENT PASS

Before ship, remove roughly 10% of decorative or redundant UI.

Keep only what improves:

- comprehension
- orientation
- discovery
- evidence
- atmosphere

Do not remove actual information simply to achieve fashionable minimalism.

---

# 45 — ANTI-SLOP ESCALATION

If an agent repeatedly produces generic UI:

1. Stop adding decoration.
2. Re-read PROJECT_BIBLE.md.
3. Re-read DESIGN.md.
4. Audit the visual hierarchy.
5. Identify the default that leaked in.
6. Recompose from content and task.
7. Re-run the second-look test.

Never compensate for generic structure with more effects.

---

# 46 — DONE MEANS

A BHĀRATA UI feature is complete when:

- its purpose is clear
- content has meaning
- hierarchy is obvious
- states are handled
- responsive behaviour is sound
- keyboard usage works
- motion is intentional
- design feels BHĀRATA-specific
- obvious generated defaults are gone
- code has clean boundaries
- the historical relationship model remains honest

---

# 47 — FINAL CREATIVE RULE

**The interface should feel like someone cared enough to decide.**

The strongest BHĀRATA decisions may be quiet:

- one precise rule
- a carefully tuned transition
- a date placed exactly where context is needed
- a map label suppressed when it becomes noise
- an evidence reference appearing at the moment curiosity peaks
- an unusual but purposeful alignment
- an uncertainty shown without alarm

That is the level of craft this project should pursue.

---

# 48 — RESEARCH INPUTS

Use these as research inputs, not visual templates:

- Vercel Web Interface Guidelines, including its explicit agent-integration guidance.
- Leo Stehlik, **no-slop-ui**, for recurring generated-interface patterns and review practice.
- Natter Gabriel, **frontend-craft**, for intentionality, migrating slop tells, and design craft.
- AkyRayy, **Frontend Design SKILLS for AI**, for modular design guidance and pre-ship review concepts.
- Additional public frontend-design skills reviewed for comparisons across aesthetics, motion, accessibility, code quality, and anti-slop workflows.

Do not mechanically reproduce any of them.

BHĀRATA must develop its own visual grammar.

---

# 49 — BHĀRATA DESIGN EQUATION

> **Meaning first. Composition second. Decoration last.**
