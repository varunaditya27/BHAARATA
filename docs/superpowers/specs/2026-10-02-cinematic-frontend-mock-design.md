# BHĀRATA — Cinematic Frontend Mock & Architectural Specification

**Date:** 2026-10-02  
**Status:** Approved by User  
**Target:** Complete Cinematic Frontend Mock (Zero-Effort DB Drop-In Seam)

---

## 1. Executive Summary & Vision

BHĀRATA is a source-aware, time-aware digital historical atlas for exploring the political, geographic, material, and intellectual history of the Indian subcontinent. It operates under a strict anti-slop archival contract (paper/ink/earth palette, restraint, typographical hierarchy, no generic AI tropes, no purple glassmorphic dashboards).

This specification defines the complete transformation of the frontend into **The Living Epic Archive** — a masterwork blending:
1. **Monumental Archival Cinema**: Atmospheric 3D terrain lighting, tactile paper/ink surfaces, interactive raking-light epigraphic rubbing viewers, animated trade flows, and purposeful camera sweeps.
2. **Story-First Epic Atlas**: Chaptered documentary scrollytelling, kinetic primary source typography, and guided historical expeditions.
3. **The Zero-Effort DB Seam**: An asynchronous, typed repository layer that powers the entire frontend today from a dense, factually verified mock corpus, designed so that hooking up PostgreSQL and PostGIS tomorrow requires changing only the data-fetcher implementations with zero UI refactoring.

All historical records, names, dynasties, dates, inscriptions, and geographic coordinates are grounded in the **Indian Knowledge System (IKS)** and verified historical scholarship (Epigraphia Indica, Archaeological Survey of India, Corpus Inscriptionum Indicarum).

---

## 2. Technical Stack & Motion Architecture

- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5.
- **Cartography & 3D Topography**:
  - `maplibre-gl` (v6): OpenFreeMap Positron vector tiles pruned of modern borders, roads, and cities.
  - `maplibre-contour`: Client-side elevation contour lines and multi-directional hillshading via AWS Terrarium DEM.
- **Animation & Motion Engine**:
  - `gsap` (GreenSock) & `ScrollTrigger`: Cinematic camera choreography, SVG path animations (flowing dashed routes for monsoon winds and caravan highways), scroll-driven chapter synchronization, and kinetic text reveals.
  - `motion` (Framer Motion v12): Component layout animations, spring-physics docking for drawers/lightbox, and interactive gestural drag pads.
  - `prefers-reduced-motion`: Complete accessibility compliance; all camera flights become instant jumps, auto-play disables, and animated stroke dashes become static dashed lines.
- **Sensory Tactility (Web Audio API)**:
  - Subtle, high-frequency mechanical brass click when scrubbing timeline year ticks.
  - Muted by default with a persistent toggle.

---

## 3. System Architecture & The "Zero-Effort DB Drop-In" Seam

### 3.1 Asynchronous Service Layer (`lib/services/`)

All UI components and route pages interact exclusively with typed asynchronous service contracts. No component directly accesses static JSON files.

```typescript
// lib/services/atlasService.ts

export type CartographicLens = 
  | "political" 
  | "trade-monsoon" 
  | "epigraphy-sacred" 
  | "topography-rivers";

export interface AtlasStateQuery {
  year: number;
  lenses: CartographicLens[];
  selectedPlaceId?: string;
  relief?: boolean;
}

export interface AtlasSnapshot {
  year: number;
  activePolityIds: string[];
  activePolities: Polity[];
  contemporaryPlaces: Place[];
  dimmedPlaceIds: string[];
  contemporaryEvidence: Evidence[];
  activeRoutes: TradeRouteFeature[];
  activeZones: GeoJSON.FeatureCollection;
}

export interface IAtlasRepository {
  getAtlasSnapshot(query: AtlasStateQuery): Promise<AtlasSnapshot>;
  getPolity(id: string): Promise<Polity | null>;
  getPlace(id: string): Promise<Place | null>;
  getPerson(id: string): Promise<Person | null>;
  getHistoricalEvent(id: string): Promise<HistoricalEvent | null>;
  getEvidence(id: string): Promise<Evidence | null>;
  getSource(id: string): Promise<Source | null>;
  getCuratedExpedition(id: string): Promise<Collection | null>;
  getChronologyMatrix(params: ChronologyQueryParams): Promise<ChronologyMatrixResult>;
  comparePolities(idA: string, idB: string): Promise<ComparisonResult>;
  askCorpus(question: string): Promise<CorpusAnswerResult>;
  searchCorpus(query: string, kind?: EntityType): Promise<SearchResultItem[]>;
}
```

### 3.2 Phase II Migration Contract
- **Today (Phase I)**: `MockAtlasRepository` implements `IAtlasRepository` in memory using an expanded, deeply linked 18-polity historical database.
- **Tomorrow (Phase II)**: `PostgresAtlasRepository` implements `IAtlasRepository` backed by Supabase / PostgreSQL / PostGIS. The service factory in `lib/services/index.ts` swaps implementation based on `process.env.DATABASE_URL`. Zero React components or hooks change.

---

## 4. Substantial Historical Mock Expansion (Grounded in IKS)

The mock dataset in `lib/data/corpus.json` is expanded from 6 entities to a comprehensive pan-Indian historical matrix:

### 4.1 18 Polities & Verified Dynastic Bounds
1. **Magadha / Mahājanapadas** (c. 600–321 BCE, Capital: Rājagṛha / Pāṭaliputra)
2. **Maurya Empire** (c. 321–185 BCE, Capital: Pāṭaliputra)
3. **Śuṅga Empire** (c. 185–73 BCE, Capital: Vidiśā / Pāṭaliputra)
4. **Śātavāhana Empire** (c. 100 BCE–220 CE, Capitals: Pratiṣṭhāna / Amarāvatī)
5. **Kuṣāṇa Empire** (c. 30–375 CE, Capitals: Puruṣapura / Mathurā)
6. **Gupta Empire** (c. 319–550 CE, Capital: Pāṭaliputra)
7. **Vākāṭaka Dynasty** (c. 250–500 CE, Capital: Pravarapura / Nandivardhana)
8. **Empire of Harṣavardhana** (c. 606–647 CE, Capital: Kānyakubja)
9. **Early Cālukyas of Bādāmi** (c. 543–753 CE, Capital: Vātāpi)
10. **Pallavas of Kāñcī** (c. 275–897 CE, Capital: Kāñcīpuram)
11. **Rāṣṭrakūṭa Empire** (c. 753–982 CE, Capital: Mānyakheṭa)
12. **Imperial Coḻas** (c. 848–1279 CE, Capitals: Tañjāvūr / Gaṅgaikoṇḍacoḻapuram)
13. **Gurjara-Pratīhāra Empire** (c. 730–1036 CE, Capital: Kannauj)
14. **Pālas of Bengal** (c. 750–1161 CE, Capitals: Gauḍa / Vikramaśīlā)
15. **Hoysala Empire** (c. 1026–1343 CE, Capital: Dvārasamudra / Haḷebīḍu)
16. **Delhi Sultanate** (c. 1206–1526 CE, Capital: Dehlī)
17. **Vijayanagara Empire** (c. 1336–1646 CE, Capital: Vijayanagara / Hampi)
18. **Mughal Empire** (c. 1526–1857 CE, Capitals: Āgrā / Shāhjahānābād)

Each polity is accompanied by:
- Reconstructed GeoJSON territory files in `lib/data/zones/`, differentiating the sovereign core (*Mūla-Rājya*) from tributary or peripheral influence (*Sāmanta-Maṇḍala*).
- Real rulers, major historical events, associated archaeological findspots, and connected inscriptions.

### 4.2 30+ Key Historical Places
Geocoded with verified WGS84 coordinates, historical names, and modern equivalents:
- *North & Northwest*: Takṣaśilā (Taxila), Puruṣapura (Peshawar), Mathurā, Vārāṇasī, Pāṭaliputra (Patna), Rājagṛha, Sāñcī, Vidiśā, Kānyakubja (Kannauj), Prayāga (Allahabad), Nālandā.
- *Western & Central*: Ujjayinī (Ujjain), Bharukaccha (Barygaza / Bharuch), Śūrpāraka (Sopara), Pratiṣṭhāna (Paithan), Ellorā, Ajantā, Vātāpi (Badami), Mānyakheṭa (Malkhed).
- *Eastern*: Tāmralipti (Tamluk), Śiśupālagarh, Purī, Gauḍa.
- *Peninsular South & Coast*: Muziris / Pattanam, Korkai, Kāverīpaṭṭiṉam (Poompuhar), Kāñcīpuram, Tañjāvūr, Gaṅgaikoṇḍacoḻapuram, Madurai, Uttiramerūr, Dvārasamudra, Vijayanagara (Hampi).

### 4.3 25+ Real Epigraphic, Numismatic & Monumental Records
Authentic historical records with text in original scripts (Brāhmī, Devanagari, Old Tamil, Grantha), academic IAST transliteration, English translation, and *Epigraphia Indica* citation:
1. *Aśoka Major Rock Edict XIII (Girnar / Shahbazgarhi)*: Kalinga conquest, dhamma-vijaya, naming Greek kings Antiochus, Ptolemy, Antigonus, Magas, Alexander.
2. *Aśoka Minor Rock Edict I (Maski / Brahmagiri)*: First epigraph confirming "Devanampriya" is King Asoka.
3. *Heliodorus Pillar Inscription (Besnagar/Vidisha)*: Greek ambassador from Taxila proclaiming himself a Bhagavata (follower of Vasudeva).
4. *Hathigumpha Inscription of Kharavela (Udayagiri, Odisha)*: Brahmi inscription recording Jain patronage and military expeditions.
5. *Junagadh Rock Inscription of Rudradaman I (150 CE)*: Earliest long Sanskrit inscription, recording repairs to the Sudarshana lake dam.
6. *Prayāga Praśasti of Samudragupta (Allahabad Pillar)*: Classical Sanskrit campu by Harisena detailing North and South conquests.
7. *Aihole Inscription of Pulakeśin II (634 CE)*: Composed by Ravikirti, recording the defeat of Harsha on the banks of the Reva (Narmada).
8. *Uttiramerūr Inscription of Parāntaka I Coḻa (920 CE)*: Detailed electoral rules and balloting system (*kuḍavōlai*) for the village assembly (*sabhā*).
9. *Brihadīśvara South Wall Inscription of Rājarāja I (1010 CE)*: Inscription recording the architectural construction, gifts of gold, and land grants.
10. *Tiruvalangadu Copper Plates of Rājendra I Coḻa*: Detailed account of the expedition to the Ganga and naval expedition to Srivijaya.
11. *Belur Temple Foundation Inscription (Hoysala Vishnuvardhana, 1117 CE)*: Commemorating the victory over the Cholas at Talakad.
12. *Quṭb Minār Inscription Bands (Iltutmish, 1220 CE)*: Arabic and Persian architectural inscriptions recording construction and repair.
13. *Hampi Vittala Temple Pillar Records (Kṛṣṇadevarāya, 1513 CE)*: Victory inscriptions following the capture of Udayagiri.

---

## 5. Primary Atlas Experience & The Temporal Command Bar

### 5.1 Hero Canvas & Dockable Archival Dossier
- **Full-Viewport Canvas Layout**: The map is hero-dominant, framed by the restrained masthead.
- **Dockable Archival Dossier**: An asymmetrical, tactile paper panel (width: 380px) on the right side.
  - Automatically activates when a place, ruler, or inscription is selected.
  - Displays historical names, native scripts, date confidence tags, contemporary active rulers, and the primary evidence trail.
  - Smoothly dockable/collapsible with spring physics.
  - Fast action button: "Launch Curated Expedition" centered on this entity.

### 5.2 Thematic Cartographic Lenses
Toggleable from the Command Bar:
1. **Political Spheres (*Rājya-Maṇḍala*)**: Core territories vs tributary zones with dashed confidence boundaries.
2. **Trade Networks & Monsoons (*Saṃvāha & Vāṇijya*)**:
   - Seasonal monsoon wind flow vectors (Southwest summer vs Northeast winter).
   - Maritime routes connecting Red Sea / Roman world to Muziris and Bay of Bengal routes to Southeast Asia.
   - Overland highways: *Uttarāpatha* and *Dakṣiṇāpatha* animated with GSAP dash-flows.
3. **Epigraphy & Sacred Geography (*Śilālekha & Tīrtha*)**:
   - Glowing archaeological findspots indicating scripts (Brāhmī, Kharoṣṭhī, Grantha, Nāgarī).
4. **Topography & River Basins (*Nadī-Tantra*)**:
   - 3D DEM relief (1.4× exaggeration, 55° pitch) highlighting river basins that dictated historical urbanization.

### 5.3 Temporal Command Bar (`TemporalCommandBar.tsx`)
- Astronomical slider (-600 BCE to 1800 CE) with 8 major historical epoch notches.
- Playhead with multi-speed playback: **0.5×, 1×, 2×, 5×**.
- Real-time territorial crossfades as time scrubs.
- Subtle Web Audio tactile feedback on year ticks (muteable).

---

## 6. The Tactile Archive & Raking-Light Epigraphy Suite

### 6.1 Interactive Raking-Light Epigraphy Viewer (`RakingLightViewer.tsx`)
- Drag-pad controller to rotate an oblique virtual light source across the stone or copper plate.
- Dynamic SVG relief lighting filter (`feDiffuseLighting` with variable azimuth and elevation) causing carved grooves to cast authentic low-relief shadows.
- Triple-Tier Script Inspector:
  1. Authentic ancient script (Brāhmī / Grantha / Old Tamil / Nāgarī).
  2. Academic IAST transliteration with macrons and diacritics.
  3. Scholarly English translation with epigraphical gloss and historical commentary.

### 6.2 Relational Constellation Explorer (`ConstellationGraph.tsx`)
- Dynamic interactive SVG graph displaying relationships between Polities, Rulers, Places, Events, and Inscriptions.
- Spring physics, hover preview cards, and connection edge highlighting.

### 6.3 Curator’s Lightbox Tray (`CuratorLightbox.tsx`)
- Persistent dockable tray allowing readers to "Pin" artifacts and places.
- Light-table examination view with side-by-side comparison.

---

## 7. Curated Expeditions (Documentary Scrollytelling)

Four master journeys in `/collections/[id]`:
1. **The Inscription Trail**: From Aśokan rocks to imperial Coḻa temple walls.
2. **Monsoon Winds & Spice Harbors**: From Roman Muziris to Chola Srivijaya.
3. **The Great Dynastic Seats**: The evolution of Indian imperial capitals.
4. **Sacred Geography & Thought Networks**: Transmission of philosophy across monastic and temple centers.

Features:
- **GSAP ScrollTrigger**: Orchestrates 3D camera pan, zoom, and pitch to each waypoint.
- **Animated Route Paths**: Fleets and caravans progressively drawing along routes.
- **Kinetic Archival Quotes**: Authentic historical quotes revealed in monumental typography.
- **Cinema Auto-Play**: Playhead that automatically tours through the expedition like an interactive documentary.
- **Branch to Atlas**: Seamless jump from any expedition stop directly into the open Atlas.

---

## 8. Secondary Surfaces Overhaul

1. **Chronology Matrix (`/chronology`)**:
   - 4 synchronized regional swimlanes (North, Deccan, South, Maritime).
   - Vertical time crosshair revealing contemporary synchronicity.
2. **Dual-Stage Split Compare (`/compare`)**:
   - Side-by-side or draggable split-screen map overlay comparing two polities or epochs.
   - Structural matrix comparing administrative centers, epigraphy, and coinage.
3. **Scholarly Ask Console (`/ask`)**:
   - Research console displaying semantic evidence retrieval paths and honest uncertainty meters.
4. **Faceted Evidence Archive (`/evidence`)**:
   - Filter by stone, copper plate, coin, monument, or manuscript, with direct launcher for the Raking-Light viewer.
5. **Research Workbench & Dossier (`/saved`)**:
   - Personal scholar's desk with notes scratchpad and "Print to Archival Folio / PDF" formatter.

---

## 9. Verification & Quality Standards

- **Zero Lint / Type Errors**: Strict TypeScript compliance.
- **Performance**: 60fps animations, optimized vector tile rendering, smooth timeline scrubbing.
- **Accessibility**: Keyboard navigable, visible focus states, complete `prefers-reduced-motion` fallbacks, ARIA live announcements for temporal changes.
- **Historical Grounding**: Every record reflects authentic scholarship; no invented certainty or synthetic AI hallucinations.

