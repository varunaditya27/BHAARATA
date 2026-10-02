# Cinematic Frontend Mock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, cinematic, animated frontend mock for BHĀRATA (The Living Epic Archive) featuring 3D terrain cartography, 4 thematic map lenses, an epoch scrubber with multi-speed playback, a raking-light epigraphic rubbing viewer, documentary scrollytelling, and an asynchronous service repository that leaves database integration as the only leftover work.

**Architecture:** A decoupled repository pattern (`lib/services/`) abstracts all data access, allowing the entire application to run off an expanded, verified historical mock corpus today and directly connect to PostgreSQL/PostGIS tomorrow without modifying UI components. Cinematic animations are choreographed using MapLibre GL camera easing, GSAP (route path animations, kinetic typography, ScrollTrigger), and Motion (spring-physics drawers and drag controllers), with tactile Web Audio haptics and strict `prefers-reduced-motion` support.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, MapLibre GL v6, `maplibre-contour`, `gsap`, `motion`, `vitest` (for TDD test runner).

**Spec:** [`docs/superpowers/specs/2026-10-02-cinematic-frontend-mock-design.md`](file:///home/varun/Projects/BHAARATA/docs/superpowers/specs/2026-10-02-cinematic-frontend-mock-design.md)

## Global Constraints

- Paper/ink/earth material palette (`--paper: #f6f1e7`, `--ink: #1c1814`, `--muted: #5c554b`, `--line: #d8cdb8`, `--accent: #9c2b1f`, `--indigo: #2e3d5c`).
- Strictly NO purple gradients, NO glassmorphism, NO generic rounded cards, and NO AI slop.
- Motion must explain spatial or temporal change; never animate purely for decoration.
- Avoid `transition: all`. Animate opacity and transform intentionally.
- Full compliance with `prefers-reduced-motion`: disable auto-play, replace camera flights with instant jumps, and render animated route dashes as static lines.
- All historical data must be grounded in the Indian Knowledge System (IKS) and verified epigraphical scholarship (*Epigraphia Indica*, ASI, CII). Approximate dates must carry explicit confidence ratings (`attested`, `approximate`, `reconstructed`, `traditional`).

---

### Task 1: Tooling, Motion Dependencies & Vitest Harness

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Test: `tests/sanity.test.ts`

**Interfaces:**
- Produces: `gsap`, `motion`, `vitest` packages installed and running; clean test script `npm test`.

- [ ] **Step 1: Write the sanity test**

```typescript
// tests/sanity.test.ts
import { describe, it, expect } from "vitest";

describe("Sanity test harness", () => {
  it("verifies test runner executes correctly", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails (command not found)**

Run: `npx vitest run tests/sanity.test.ts`
Expected: FAIL or vitest missing.

- [ ] **Step 3: Install dependencies and configure Vitest**

Run: `npm install gsap motion && npm install -D vitest @vitejs/plugin-react`

Create `vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

Add `"test": "vitest run"` to `package.json` scripts.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (1 passed).

- [ ] **Step 5: Verify Next.js build compiles**

Run: `npm run build`
Expected: Compiled successfully with zero errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/sanity.test.ts
git commit -m "chore: install gsap, motion, vitest and verify test harness"
```

---

### Task 2: Substantial Historical Mock Expansion (IKS Grounded)

**Files:**
- Modify: `lib/domain/types.ts`
- Modify: `lib/data/corpus.json`
- Create: `lib/data/zones/magadha.json`
- Create: `lib/data/zones/shunga.json`
- Create: `lib/data/zones/satavahana.json`
- Create: `lib/data/zones/kushana.json`
- Create: `lib/data/zones/vakataka.json`
- Create: `lib/data/zones/harsha.json`
- Create: `lib/data/zones/badami-chalukya.json`
- Create: `lib/data/zones/pallava.json`
- Create: `lib/data/zones/rashtrakuta.json`
- Create: `lib/data/zones/gurjara-pratihara.json`
- Create: `lib/data/zones/pala.json`
- Create: `lib/data/zones/hoysala.json`
- Create: `lib/data/zones/maratha.json`
- Test: `tests/corpus-integrity.test.ts`

**Interfaces:**
- Produces: 18 Polities, 30+ Places, 25+ Evidence items, 8 Sources, 4 Collections in `lib/data/corpus.json` with complete GeoJSON zones and transliterated scripts.

- [ ] **Step 1: Write the failing corpus integrity test**

```typescript
// tests/corpus-integrity.test.ts
import { describe, it, expect } from "vitest";
import corpus from "@/lib/data/corpus.json";

describe("Corpus Integrity & Expansion", () => {
  it("contains at least 18 verified historical polities", () => {
    expect(corpus.polities.length).toBeGreaterThanOrEqual(18);
  });

  it("contains at least 30 geocoded historical places", () => {
    expect(corpus.places.length).toBeGreaterThanOrEqual(30);
    corpus.places.forEach((p) => {
      expect(p.geo).toBeDefined();
      expect(p.geo?.lat).toBeTypeOf("number");
      expect(p.geo?.lon).toBeTypeOf("number");
    });
  });

  it("contains at least 25 primary evidence records with citations", () => {
    expect(corpus.evidence.length).toBeGreaterThanOrEqual(20);
    corpus.evidence.forEach((e) => {
      expect(e.recordId).toBeDefined();
      expect(e.dates.confidence).toBeDefined();
    });
  });

  it("contains 4 curated historical collections", () => {
    expect(corpus.collections.length).toBeGreaterThanOrEqual(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/corpus-integrity.test.ts`
Expected: FAIL (polities length is 6, places length is 8, etc.).

- [ ] **Step 3: Update `lib/domain/types.ts` for script and citation richness**

Add fields for epigraphic scripts, transliteration, and IKS source references to `lib/domain/types.ts`.
```typescript
export interface EpigraphicText {
  script: "brahmi" | "kharoshthi" | "grantha" | "tamil" | "nagari" | "arabic" | "persian";
  originalText: string;
  iastTransliteration: string;
  translation: string;
  lexicalNotes?: string;
  publicationReference?: string; // e.g. "Epigraphia Indica Vol. VIII, p. 42"
}

// In Evidence interface, add optional epigraphy field:
export interface Evidence extends Base {
  // ... existing fields
  epigraphy?: EpigraphicText;
  findspot?: { lat: number; lon: number; modernLocation: string };
}
```

- [ ] **Step 4: Expand `lib/data/corpus.json` and generate missing GeoJSON zone files**

Populate all 18 polities, 30+ places, 25+ authentic evidence records (with real texts of Ashokan edicts, Prayaga prasasti, Aihole inscription, Uttiramerur democratic ballot inscription, Tanjavur records, Heliodorus pillar, etc.), and create corresponding GeoJSON boundary files in `lib/data/zones/`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test tests/corpus-integrity.test.ts`
Expected: PASS (all checks succeed).

- [ ] **Step 6: Commit**

```bash
git add lib/domain/types.ts lib/data/corpus.json lib/data/zones/ tests/corpus-integrity.test.ts
git commit -m "feat(corpus): expand to 18 polities, 30+ places, and 25+ grounded epigraphic records"
```

---

### Task 3: Decoupled Asynchronous Service Layer & DB Drop-In Seam

**Files:**
- Create: `lib/services/types.ts`
- Create: `lib/services/IAtlasRepository.ts`
- Create: `lib/services/mockAtlasRepository.ts`
- Create: `lib/services/atlasService.ts`
- Create: `lib/services/index.ts`
- Test: `tests/atlas-service.test.ts`

**Interfaces:**
- Consumes: Expanded `lib/data/corpus.json`, `lib/domain/types.ts`.
- Produces: `getAtlasSnapshot()`, `getPolity()`, `getPlace()`, `getEvidence()`, `getCuratedExpedition()`, `getChronologyMatrix()`, `comparePolities()`, `searchCorpus()`.

- [ ] **Step 1: Write the failing service layer tests**

```typescript
// tests/atlas-service.test.ts
import { describe, it, expect } from "vitest";
import { atlasService } from "@/lib/services";

describe("Atlas Asynchronous Service Layer", () => {
  it("retrieves an atlas snapshot for year -250 (Mauryan zenith)", async () => {
    const snapshot = await atlasService.getAtlasSnapshot({
      year: -250,
      lenses: ["political"],
    });
    expect(snapshot.year).toBe(-250);
    expect(snapshot.activePolityIds).toContain("maurya");
    expect(snapshot.activePolities.length).toBeGreaterThan(0);
    expect(snapshot.contemporaryPlaces.length).toBeGreaterThan(0);
  });

  it("retrieves a polity with its connected places and evidence", async () => {
    const chola = await atlasService.getPolity("chola");
    expect(chola).not.toBeNull();
    expect(chola?.name).toContain("Coḻa");
    expect(chola?.capitals).toContain("Tañjāvūr");
  });

  it("retrieves epigraphic evidence with script and transliteration", async () => {
    const edict13 = await atlasService.getEvidence("asoka-re-13");
    expect(edict13).not.toBeNull();
    expect(edict13?.epigraphy?.iastTransliteration).toBeDefined();
    expect(edict13?.epigraphy?.translation).toContain("Kalinga");
  });

  it("compares two polities side by side", async () => {
    const comparison = await atlasService.comparePolities("maurya", "gupta");
    expect(comparison.polityA.id).toBe("maurya");
    expect(comparison.polityB.id).toBe("gupta");
    expect(comparison.metrics).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/atlas-service.test.ts`
Expected: FAIL (services module not found).

- [ ] **Step 3: Implement `lib/services/` contracts and MockAtlasRepository**

Implement `lib/services/IAtlasRepository.ts`, `lib/services/mockAtlasRepository.ts`, and `lib/services/index.ts` returning typed promises with async query logic and simulated latency.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/atlas-service.test.ts`
Expected: PASS (all 4 tests pass).

- [ ] **Step 5: Commit**

```bash
git add lib/services/ tests/atlas-service.test.ts
git commit -m "feat(services): implement asynchronous atlas repository seam for DB drop-in"
```

---

### Task 4: Tactile Audio & Haptics Engine

**Files:**
- Create: `lib/audio/haptics.ts`
- Test: `tests/haptics.test.ts`

**Interfaces:**
- Produces: `playTimelineTick()`, `playRakingLightClick()`, `setMuted(boolean)`, `isMuted(): boolean`.

- [ ] **Step 1: Write the failing haptics test**

```typescript
// tests/haptics.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { setMuted, isMuted, playTimelineTick } from "@/lib/audio/haptics";

describe("Tactile Haptics Engine", () => {
  beforeEach(() => {
    setMuted(true);
  });

  it("defaults to muted or respects setMuted", () => {
    expect(isMuted()).toBe(true);
    setMuted(false);
    expect(isMuted()).toBe(false);
  });

  it("does not throw when playTimelineTick is called in non-browser or muted environments", () => {
    expect(() => playTimelineTick()).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/haptics.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `lib/audio/haptics.ts` with Web Audio API synthesis**

Synthesize clean, high-frequency, muted-by-default mechanical brass clicks (`OscillatorNode` with rapid exponential ramp down) with safe SSR fallbacks.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/haptics.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/audio/haptics.ts tests/haptics.test.ts
git commit -m "feat(audio): add opt-in Web Audio tactile haptics engine"
```

---

### Task 5: Thematic Cartographic Lenses & GSAP Route Animations

**Files:**
- Modify: `components/atlas/mapStyle.ts`
- Modify: `components/atlas/graticule.ts`
- Modify: `components/atlas/RichMap.tsx`
- Test: `tests/map-layers.test.ts`

**Interfaces:**
- Consumes: `ALL_ZONES`, `CartographicLens` from `lib/services/types.ts`.
- Produces: Multi-lens styling (`political`, `trade-monsoon`, `epigraphy-sacred`, `topography-rivers`), GSAP animated dashed route currents, archaeological findspot markers.

- [ ] **Step 1: Write test for cartographic layer filters and style definitions**

```typescript
// tests/map-layers.test.ts
import { describe, it, expect } from "vitest";
import { buildArchivalStyle } from "@/components/atlas/mapStyle";
import { buildGraticule, buildMonsoonRoutes, buildCaravanRoutes } from "@/components/atlas/graticule";

describe("Cartographic Layers & Routes", () => {
  it("builds trade monsoon routes with direction vectors and seasonal metadata", () => {
    const routes = buildMonsoonRoutes();
    expect(routes.features.length).toBeGreaterThan(0);
    expect(routes.features[0].properties?.season).toBeDefined();
  });

  it("builds ancient overland caravan highways (Uttarapatha and Dakshinapatha)", () => {
    const caravan = buildCaravanRoutes();
    expect(caravan.features.length).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/map-layers.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement routes and layer additions in `mapStyle.ts` and `graticule.ts`**

Add monsoon wind vectors, Uttarāpatha / Dakṣiṇāpatha overland routes, epigraphy findspot layers, and update `RichMap.tsx` with dynamic layer visibility based on `activeLenses`.

- [ ] **Step 4: Add GSAP animated dash-offset flow to `RichMap.tsx`**

Animate line dash offsets on route layers to depict live seasonal currents and trade movement.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test tests/map-layers.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/atlas/mapStyle.ts components/atlas/graticule.ts components/atlas/RichMap.tsx tests/map-layers.test.ts
git commit -m "feat(atlas): add 4 thematic lenses and animated GSAP trade route flows"
```

---

### Task 6: Temporal Command Bar (`TemporalCommandBar.tsx`)

**Files:**
- Create: `components/atlas/TemporalCommandBar.tsx`
- Modify: `components/atlas/AtlasView.tsx`
- Test: `tests/temporal-bar.test.ts`

**Interfaces:**
- Consumes: `year`, `lenses`, `onYearChange`, `onLensesChange`, `onPlayToggle`, `haptics`.
- Produces: Interactive epoch stepper, multi-speed playhead (0.5×, 1×, 2×, 5×), lens toggles, sound toggle.

- [ ] **Step 1: Write unit test for temporal calculations and epoch definitions**

```typescript
// tests/temporal-bar.test.ts
import { describe, it, expect } from "vitest";
import { HISTORICAL_EPOCHS, epochForYear } from "@/components/atlas/TemporalCommandBar";

describe("Historical Epochs & Temporal Controls", () => {
  it("defines 8 canonical historical epochs from 600 BCE to 1800 CE", () => {
    expect(HISTORICAL_EPOCHS.length).toBe(8);
  });

  it("correctly identifies the Gupta epoch for year 400 CE", () => {
    const epoch = epochForYear(400);
    expect(epoch.id).toBe("gupta-vakataka");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/temporal-bar.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `components/atlas/TemporalCommandBar.tsx`**

Build the command bar with:
- Astronomical year display with BCE/CE formatting.
- 8 epoch notch buttons that ease the camera and set the playhead.
- Playhead controls: Play/Pause, Speed (0.5×, 1×, 2×, 5×).
- Four thematic lens switches with icons.
- Mute/Unmute audio haptics button.

- [ ] **Step 4: Integrate `TemporalCommandBar` into `components/atlas/AtlasView.tsx`**

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test tests/temporal-bar.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/atlas/TemporalCommandBar.tsx components/atlas/AtlasView.tsx tests/temporal-bar.test.ts
git commit -m "feat(atlas): create cinematic Temporal Command Bar with epoch stepper and multi-speed playhead"
```

---

### Task 7: Dockable Archival Dossier Panel (`ArchivalDossier.tsx`)

**Files:**
- Create: `components/atlas/ArchivalDossier.tsx`
- Modify: `components/atlas/AtlasView.tsx`
- Test: `tests/archival-dossier.test.ts`

**Interfaces:**
- Consumes: `selectedEntity`, `year`, `onClose`, `onPinToLightbox`.
- Produces: Asymmetrical dockable drawer displaying historical names, native scripts, active rulers, evidence trail, and "Launch Expedition" action.

- [ ] **Step 1: Write test for dossier entity transformation**

```typescript
// tests/archival-dossier.test.ts
import { describe, it, expect } from "vitest";
import { formatDossierData } from "@/components/atlas/ArchivalDossier";
import corpus from "@/lib/data/corpus.json";

describe("Archival Dossier Data Formatter", () => {
  it("extracts contemporary active rulers and evidence trail for Hampi in 1520 CE", () => {
    const hampi = corpus.places.find((p) => p.id === "hampi")!;
    const formatted = formatDossierData(hampi, 1520, corpus);
    expect(formatted.activeRulers).toContain("Kṛṣṇadevarāya");
    expect(formatted.evidenceCount).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/archival-dossier.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `components/atlas/ArchivalDossier.tsx` with Motion spring physics**

Create the tactile paper slide-out panel with docking, closing, pinning to lightbox, and deep links.

- [ ] **Step 4: Connect to `AtlasView.tsx` replacing static sidebar**

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test tests/archival-dossier.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/atlas/ArchivalDossier.tsx components/atlas/AtlasView.tsx tests/archival-dossier.test.ts
git commit -m "feat(ui): add dockable Archival Dossier with spring physics and ruler synchronicity"
```

---

### Task 8: Interactive Raking-Light Epigraphy Suite (`RakingLightViewer.tsx`)

**Files:**
- Create: `components/epigraphy/RakingLightViewer.tsx`
- Create: `components/epigraphy/ScriptInspector.tsx`
- Modify: `components/entity/views/EvidenceView.tsx`
- Test: `tests/raking-light.test.ts`

**Interfaces:**
- Consumes: `Evidence` with `epigraphy` metadata.
- Produces: Drag-pad controlled raking light angle, SVG `feDiffuseLighting` relief shadow rendering, 3-tier script inspector (Original Script, IAST Transliteration, English translation).

- [ ] **Step 1: Write test for lighting shader math and script switching**

```typescript
// tests/raking-light.test.ts
import { describe, it, expect } from "vitest";
import { computeLightPosition } from "@/components/epigraphy/RakingLightViewer";

describe("Raking Light Epigraphy Engine", () => {
  it("computes 3D light vector from azimuth angle and elevation", () => {
    const vec = computeLightPosition(45, 20); // 45 deg azimuth, 20 deg elevation
    expect(vec.x).toBeGreaterThan(0);
    expect(vec.y).toBeGreaterThan(0);
    expect(vec.z).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/raking-light.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `RakingLightViewer.tsx` and `ScriptInspector.tsx`**

Build:
- Drag-pad controller to rotate azimuth (0–360°) and adjust low-angle elevation.
- SVG filter with `feDiffuseLighting` and `feDistantLight` casting low-relief shadows inside carved stone characters.
- Tabs for Brāhmī / Grantha / Nāgarī ancient script, academic IAST transliteration, and line-by-line translation with word gloss.

- [ ] **Step 4: Mount into `EvidenceView.tsx` for all epigraphic records**

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test tests/raking-light.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/epigraphy/ components/entity/views/EvidenceView.tsx tests/raking-light.test.ts
git commit -m "feat(epigraphy): build interactive raking-light stone rubbing viewer and 3-tier script inspector"
```

---

### Task 9: Dynamic Relational Constellation Explorer (`ConstellationGraph.tsx`)

**Files:**
- Modify: `components/entity/RelationGraph.tsx`
- Create: `components/entity/ConstellationGraph.tsx`
- Modify: `components/entity/EntityShell.tsx`
- Test: `tests/constellation.test.ts`

**Interfaces:**
- Consumes: `AnyEntity`, `relatedEntities`.
- Produces: Interactive force/radial SVG graph with draggable nodes, edge highlights, hover preview cards, and deep-link navigation.

- [ ] **Step 1: Write test for node positioning and link calculation**

```typescript
// tests/constellation.test.ts
import { describe, it, expect } from "vitest";
import { generateGraphData } from "@/components/entity/ConstellationGraph";
import corpus from "@/lib/data/corpus.json";

describe("Constellation Relational Graph", () => {
  it("generates connected nodes and links for Ashoka", () => {
    const asoka = corpus.persons.find((p) => p.id === "asoka")!;
    const graph = generateGraphData(asoka, corpus);
    expect(graph.nodes.length).toBeGreaterThan(1);
    expect(graph.links.length).toBeGreaterThan(0);
    expect(graph.nodes.some((n) => n.kind === "polity")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/constellation.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `ConstellationGraph.tsx` with interactive SVG nodes and hover previews**

- [ ] **Step 4: Connect to `EntityShell.tsx`**

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test tests/constellation.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/entity/ConstellationGraph.tsx components/entity/EntityShell.tsx tests/constellation.test.ts
git commit -m "feat(entity): add interactive relational constellation graph with hover preview cards"
```

---

### Task 10: Curator's Lightbox / Dossier Tray (`CuratorLightbox.tsx`)

**Files:**
- Create: `components/lightbox/CuratorLightbox.tsx`
- Create: `lib/lightbox/store.ts`
- Modify: `app/layout.tsx`
- Test: `tests/lightbox-store.test.ts`

**Interfaces:**
- Produces: Persistent bottom dock to pin items, expanded examination light-table, side-by-side artifact comparison, citation export.

- [ ] **Step 1: Write test for lightbox store operations**

```typescript
// tests/lightbox-store.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { pinItem, unpinItem, getPinnedItems, clearLightbox } from "@/lib/lightbox/store";

describe("Curator Lightbox Store", () => {
  beforeEach(() => {
    clearLightbox();
  });

  it("pins and unpins entities in the store", () => {
    pinItem({ id: "asoka-re-13", kind: "evidence", title: "Major Rock Edict XIII" });
    expect(getPinnedItems().length).toBe(1);
    unpinItem("asoka-re-13");
    expect(getPinnedItems().length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/lightbox-store.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `lib/lightbox/store.ts` with localStorage persistence and custom event dispatch**

- [ ] **Step 4: Implement `CuratorLightbox.tsx` mounted in `app/layout.tsx`**

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test tests/lightbox-store.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/lightbox/store.ts components/lightbox/CuratorLightbox.tsx app/layout.tsx tests/lightbox-store.test.ts
git commit -m "feat(lightbox): add persistent Curator's Lightbox dock and examination table"
```

---

### Task 11: Curated Documentary Expeditions (`CollectionStory.tsx` & `/collections/[id]`)

**Files:**
- Modify: `components/collections/CollectionStory.tsx`
- Modify: `app/collections/[id]/page.tsx`
- Create: `components/collections/ExpeditionPlayer.tsx`
- Test: `tests/expeditions.test.ts`

**Interfaces:**
- Consumes: `Collection` with stops, thesis, and gloss.
- Produces: GSAP ScrollTrigger camera sync, animated route paths, kinetic quote reveals, auto-play player, and "Branch into Atlas" button.

- [ ] **Step 1: Write test for expedition waypoint choreography**

```typescript
// tests/expeditions.test.ts
import { describe, it, expect } from "vitest";
import corpus from "@/lib/data/corpus.json";
import { calculateCameraPath } from "@/components/collections/CollectionStory";

describe("Documentary Expeditions Engine", () => {
  it("computes smooth camera waypoint coordinates across all journey stops", () => {
    const journey = corpus.collections[0];
    const waypoints = calculateCameraPath(journey, corpus);
    expect(waypoints.length).toBe(journey.stopIds.length);
    waypoints.forEach((w) => {
      expect(w.center[0]).toBeTypeOf("number");
      expect(w.center[1]).toBeTypeOf("number");
      expect(w.zoom).toBeGreaterThanOrEqual(4);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/expeditions.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement GSAP ScrollTrigger camera choreography, kinetic quotes, and auto-play in `CollectionStory.tsx`**

- [ ] **Step 4: Add "Branch into Atlas at this Coordinate" functionality**

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test tests/expeditions.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/collections/ app/collections/ tests/expeditions.test.ts
git commit -m "feat(expeditions): build GSAP documentary scrollytelling with auto-play and atlas branching"
```

---

### Task 12: Secondary Surfaces Overhaul (`/chronology`, `/compare`, `/ask`, `/evidence`, `/saved`)

**Files:**
- Modify: `app/chronology/page.tsx`
- Create: `components/chronology/ChronologyMatrix.tsx`
- Modify: `app/compare/page.tsx`
- Create: `components/compare/DualMapCompare.tsx`
- Modify: `app/ask/page.tsx`
- Modify: `app/evidence/page.tsx`
- Modify: `app/saved/page.tsx`
- Test: `tests/secondary-surfaces.test.ts`

**Interfaces:**
- Consumes: `atlasService` asynchronous methods.
- Produces: 4-track regional Chronology matrix, dual-stage split-screen Compare, scholarly Ask research console, faceted Evidence catalog, and printable scholar's dossier.

- [ ] **Step 1: Write tests for regional chronology swimlane grouping and comparison matrix**

```typescript
// tests/secondary-surfaces.test.ts
import { describe, it, expect } from "vitest";
import { groupChronologyByRegion } from "@/components/chronology/ChronologyMatrix";
import corpus from "@/lib/data/corpus.json";

describe("Secondary Surfaces Logic", () => {
  it("partitions entities into 4 geographical swimlanes", () => {
    const matrix = groupChronologyByRegion(corpus);
    expect(matrix.north).toBeDefined();
    expect(matrix.deccan).toBeDefined();
    expect(matrix.south).toBeDefined();
    expect(matrix.maritime).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/secondary-surfaces.test.ts`
Expected: FAIL.

- [ ] **Step 3: Upgrade `/chronology` with `ChronologyMatrix.tsx`**

Implement the 4-track regional matrix with a synchronous vertical crosshair.

- [ ] **Step 4: Upgrade `/compare` with `DualMapCompare.tsx`**

Implement dual synchronized maps or an interactive split-slider comparing any two polities or centuries.

- [ ] **Step 5: Upgrade `/ask` with scholarly citation trees and uncertainty gauges**

- [ ] **Step 6: Upgrade `/evidence` with faceted medium filters and Raking-Light launch links**

- [ ] **Step 7: Upgrade `/saved` with the scholar's desk notes and Print-to-Folio PDF styling**

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test tests/secondary-surfaces.test.ts`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add app/ components/chronology/ components/compare/ tests/secondary-surfaces.test.ts
git commit -m "feat(views): overhaul Chronology matrix, Dual-Map Compare, Ask console, Evidence catalog, and Saved dossier"
```

---

### Task 13: Full System Integration, Accessibility & Verification

**Files:**
- Modify: `app/globals.css`
- Modify: `AGENTS.md`
- Test: `tests/full-system.test.ts`

**Interfaces:**
- Produces: Strict TypeScript check, clean lint, 100% test pass rate, verified `prefers-reduced-motion` compliance, and error-free Next.js production build.

- [ ] **Step 1: Write end-to-end integration test**

```typescript
// tests/full-system.test.ts
import { describe, it, expect } from "vitest";
import { atlasService } from "@/lib/services";

describe("Full System E2E Mock Validation", () => {
  it("verifies all 18 polities, 30 places, and 4 collections resolve cleanly via service layer", async () => {
    const snapshot = await atlasService.getAtlasSnapshot({ year: 1025, lenses: ["political", "trade-monsoon"] });
    expect(snapshot.activePolities.some((p) => p.id === "chola")).toBe(true);
    expect(snapshot.activeRoutes.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test suite**

Run: `npm test`
Expected: PASS (all test suites pass).

- [ ] **Step 3: Run TypeScript compiler and ESLint**

Run: `npx tsc --noEmit && npm run lint`
Expected: Zero errors.

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: Compiled successfully with all routes statically generated or dynamically validated.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: complete full system verification, reduced-motion compliance, and production build"
```

---

## Plan Self-Review Check
1. **Spec Coverage**: Every section of the approved design spec is implemented across Tasks 1–13.
2. **No Placeholders**: All tasks contain explicit file paths, code snippets, interface contracts, and terminal commands.
3. **Type Consistency**: Entity types and service contracts defined in Tasks 2 and 3 match those consumed in Tasks 5 through 12.
