# Database Consolidation & Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate BHĀRATA's PostgreSQL + PostGIS database into a simplified 17-table schema with zero empty tables, zero 100%-`NULL` columns, deduplicated/repaired data, no legacy static data files (`prototype.ts`, `images.ts`, `lib/data/generated/`, `lib/data/geo/`, `public/data/*.geojson`), and a single deterministic PostgreSQL seed (`prisma/seed.sql` + `scripts/seed.mjs`).

**Architecture:** We first run a PostgreSQL data-repair and schema-simplification migration (`prisma/migrations/20261114000013_consolidate_database/migration.sql`) that merges duplicate entities, repairs PostGIS geometries, populates missing metadata, merges `statements` into `historical_items`, drops the 6 empty/redundant tables, drops the 24 dead columns, and adds constraints/indexes. We then update `prisma/schema.prisma`, regenerate the Prisma client, update the application's database readers (`lib/data/read-atlas.ts`, `lib/database-info.ts`, `lib/database-browser.ts`, `app/data/page.tsx`, `app/api/map/[kind]/route.ts`), move `ImageCredit`/`ImageKey` types to `lib/domain/types.ts`, delete all legacy static data files and old importer/seed scripts, and generate a single self-contained PostgreSQL seed (`prisma/seed.sql` + `scripts/seed.mjs`) with an updated verification suite (`scripts/check-database.mjs`).

**Tech Stack:** Next.js 16, TypeScript, PostgreSQL 18 + PostGIS 3.6, Prisma 7 (`@prisma/client`, `@prisma/adapter-pg`), Zod.

**Spec:** `docs/superpowers/specs/2026-11-14-database-consolidation-design.md`

## Global Constraints

- Never fabricate historical facts, dates, rulers, sources, or borders.
- Write in plain language; no jargon ("polity", "semantic", "epistemic") in user-facing text.
- Never add AI co-author trailers to git commits; keep commit messages short and plain.
- Every remaining table in `public` must have > 0 rows and zero 100%-`NULL` columns.
- All 465 `kingdom_borders` polygons must pass `ST_IsValid(outline)`.

---

### Task 1: Execute Data Consolidation & Schema Simplification Migration in PostgreSQL

**Files:**
- Create: `prisma/migrations/20261114000013_consolidate_database/migration.sql`
- Create: `scripts/apply-consolidation.mjs` (temporary migration runner while legacy files still exist to extract the 58 lost Wikipedia ruler summaries and 15 language codes before deleting `lib/data/generated/`)
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Consumes: Live PostgreSQL database on `DATABASE_URL` (`postgresql://bhaarata:bhaarata@localhost:55432/bhaarata`) and existing `lib/data/generated/imported-people.json` + `lib/data/generated/imported-names.json` (one last time to recover the 58 ruler summaries and 15 language codes before deletion).
- Produces: Consolidated 17-table PostgreSQL schema + Prisma client in `lib/generated/prisma/`.

- [ ] **Step 1: Write and run the data-repair & schema-simplification script and SQL migration**

Create `prisma/migrations/20261114000013_consolidate_database/migration.sql` and apply it along with the data consolidation steps:
1. Recover the 58 Wikipedia ruler summaries and `wikipedia-ruler-Q*` source links from `imported-people.json` into `people` and `information_sources`, and populate the 15 missing `other_names.language_code` values from `imported-names.json`.
2. Deduplicate the 163 colliding `places` (`fatehpur-sikri`, `ellora`, `hampi`, `bateshwar`, `raigad-fort`, `gauda`, `madurai`, plus the 152 `site-Q*`/`monument-Q*` pairs) into single canonical rows with `protected_place`, `start_year`, and `map_properties` preserved.
3. Repair the 9 invalid PostGIS polygons in `kingdom_borders` with `ST_Multi(ST_CollectionExtract(ST_MakeValid(outline), 3))` and add `CHECK (ST_IsValid(outline))`.
4. Align kingdom `start_year` and `end_year` for the 16 mismatched kingdoms, align `chera-1` border `from_year = 844`, and link the unlinked capitals (`anuradhapura`, `madurai`, `lahore`, `budaun`, `penukonda`, `chandragiri`) in `kingdom_capitals`.
5. Set `events.category = 'major_event'` on the 9 turning points, merge `battle-battle-of-talikota-1565` into `talikota`, clear erroneous/coarse coordinates on `battle-battle-of-salher-1672`, `battle-battle-of-diu-1509`, `battle-battle-of-chanderi-1528`, and `battle-battle-of-ghaghra-1529`, and fix the 4 mismatched + 6 empty battle summaries.
6. Set `people.date_kind = 'time_as_ruler'` on the 11 curated rulers, fix `kashmir-sultanate` repeat reign names (`third term`, `fourth term`, `fifth term`), populate `sources.url` and `sources.licence` on all rows, and delete remaining unreferenced rows in `sources` and `images`.
7. Add `statement`, `what_it_means`, `date_doubt`, `place_doubt`, `meaning_doubt`, and `statement_is_example` to `historical_items`, copy values from `statements`, and drop `disagreements`, `event_kingdom_sources`, `suggested_changes`, `import_checkpoints`, `statement_sources`, and `statements`.
8. Drop all 24 dead (100%-`NULL`) columns across `places`, `events`, `historical_items`, `sources`, `images`, `kingdom_capitals`, `event_kingdoms`, `event_places`, `route_kingdoms`, `item_kingdoms`, `other_names`, and `information_sources`, and add foreign-key indexes and unique constraints.

- [ ] **Step 2: Update `prisma/schema.prisma` and regenerate Prisma client**

Run: `npx prisma generate`
Expected: Prisma client generated cleanly in `lib/generated/prisma`.

- [ ] **Step 3: Commit schema and migration**

```bash
git add prisma/schema.prisma prisma/migrations/20261114000013_consolidate_database/migration.sql
git commit -m "Consolidate PostgreSQL schema and repair historical records"
```

---

### Task 2: Update Application Readers, API Routes, and Image Types

**Files:**
- Modify: `lib/domain/types.ts`
- Modify: `lib/data/atlas-data.ts`
- Modify: `lib/data/read-atlas.ts`
- Modify: `lib/database-info.ts`
- Modify: `lib/database-browser.ts`
- Modify: `app/data/page.tsx`
- Modify: `app/api/map/[kind]/route.ts`
- Modify: 16 component/page files importing `ImageKey`/`ImageCredit` from `@/lib/data/images`

**Interfaces:**
- Consumes: Regenerated Prisma client (`lib/generated/prisma/client`).
- Produces: `readAtlas(db)` reading the 17-table schema, `/api/map/[kind]` filtering deduplicated `places` by attributes, and `ImageCredit`/`ImageKey` exported from `@/lib/domain/types`.

- [ ] **Step 1: Move `ImageCredit` and `ImageKey` to `lib/domain/types.ts` and update imports**

Export `ImageCredit` and `ImageKey` from `lib/domain/types.ts` and update the `import type` statements in `lib/data/atlas-data.ts`, `app/**`, and `components/**`.

- [ ] **Step 2: Update `lib/data/read-atlas.ts`, `lib/database-info.ts`, `lib/database-browser.ts`, `app/data/page.tsx`, and `app/api/map/[kind]/route.ts`**

1. In `lib/data/read-atlas.ts`: Read `statement`, `what_it_means`, `date_doubt`, `place_doubt`, `meaning_doubt`, and `statement_is_example` directly from `historical_items` and `sourceIds` from `information_sources` (`where item_id = e.id`).
2. In `lib/database-info.ts`, `lib/database-browser.ts`, and `app/data/page.tsx`: Remove deleted tables (`statements`, `statement_sources`, `disagreements`, `event_kingdom_sources`, `suggested_changes`) from `tableNames` and remove `suggested_changes` special-case column hiding.
3. In `app/api/map/[kind]/route.ts`: Update `sites` query to filter `WHERE p.start_year IS NOT NULL AND p.map_properties IS NOT NULL AND p.map_properties ? 'y'` and `monuments` query to filter `WHERE p.protected_place = true AND p.map_properties IS NOT NULL`.

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: Exit code 0 with zero type errors.

- [ ] **Step 4: Commit application reader updates**

```bash
git add lib/ app/ components/
git commit -m "Update database readers and map API for consolidated schema"
```

---

### Task 3: Remove Legacy Static Data Files, Generate Single PostgreSQL Seed, and Update Checks

**Files:**
- Delete: `lib/data/prototype.ts`, `lib/data/images.ts`, `lib/data/generated/`, `lib/data/geo/`, `public/data/borders.geojson`, `public/data/monuments.geojson`, `public/data/sites.geojson`
- Delete: `scripts/seed-db.mjs`, `scripts/seed-extra.mjs`, `scripts/seed-map-details.mjs`, `scripts/seed-site-details.mjs`, `scripts/seed-capital-details.mjs`, `scripts/seed-kingdom-order.mjs`, `scripts/check-reconciliation.mjs`, `scripts/apply-corrections.py`, `scripts/validate-data.py`, `scripts/check-places.py`, `scripts/import-*.py`, `scripts/review-battle-coordinates.py`, `reports/bhaarata-master-schema.sql`
- Create: `prisma/seed.sql`
- Create: `scripts/seed.mjs`
- Modify: `scripts/check-database.mjs`, `scripts/check-atlas-reader.mjs`, `scripts/check-browser-page.mjs`
- Modify: `package.json`, `docs/DATABASE.md`, `docs/DATA.md`

**Interfaces:**
- Consumes: Consolidated PostgreSQL database state.
- Produces: `npm run db:seed` (`scripts/seed.mjs` + `prisma/seed.sql`), `npm run db:check` (`scripts/check-database.mjs`), `npm run check:atlas` (`scripts/check-atlas-reader.mjs`), `npm run check:browser` (`scripts/check-browser-page.mjs`).

- [ ] **Step 1: Delete legacy static data files and obsolete scripts**

Remove `lib/data/prototype.ts`, `lib/data/images.ts`, `lib/data/generated/`, `lib/data/geo/`, `public/data/*.geojson`, and the obsolete seed/importer scripts.

- [ ] **Step 2: Export `prisma/seed.sql` and create `scripts/seed.mjs`**

Dump the clean PostgreSQL data from `bhaarata-database-1` into `prisma/seed.sql` and write `scripts/seed.mjs` so `npm run db:seed` deterministically populates the database from `prisma/seed.sql`.

- [ ] **Step 3: Update `scripts/check-database.mjs`, `scripts/check-atlas-reader.mjs`, `scripts/check-browser-page.mjs`, `package.json`, and `docs/DATABASE.md`**

Update the check scripts to validate all 17 PostgreSQL tables, zero empty tables, zero invalid PostGIS geometries, zero orphaned sources/images, zero duplicate place Q-IDs, `readAtlas(db)` schema validation, and `/data` + `/connections` rendering.

- [ ] **Step 4: Run full verification suite (`db:check`, `lint`, `tsc`, `build`)**

Run:
```bash
npm run db:check
npm run check:atlas
npm run check:browser
npm run check:time
npm run lint
npx tsc --noEmit
npm run build
```
Expected: All checks, linting, typecheck, and production build pass with exit code 0.

- [ ] **Step 5: Commit seed, checks, and cleanup**

```bash
git add -A
git commit -m "Replace static data files with unified PostgreSQL seed and checks"
```
