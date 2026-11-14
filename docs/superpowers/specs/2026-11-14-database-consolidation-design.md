# Database Consolidation & Simplification Design Spec

**Date:** 2026-11-14  
**Status:** Approved  

## 1. Goal

Consolidate BHĀRATA's PostgreSQL + PostGIS database into the single, simplified, self-contained source of truth for the application:
1. Eliminate all empty tables (`disagreements`, `event_kingdom_sources`, `suggested_changes`), internal staging tables (`import_checkpoints`), and redundant 1:1 tables (`statements`, `statement_sources`), leaving **16 populated relational tables**.
2. Drop all **24 dead (100%-`NULL`) columns** across all remaining tables so `/data` ("Browse the data") and the database schema contain no unused fields.
3. Deduplicate and repair data directly in PostgreSQL (merge the 163 duplicate `places` across `site-Q*`, `monument-Q*`, and named places; fix the 9 invalid PostGIS polygons in `kingdom_borders`; align kingdom dates with ruler/summary spans; fix battle coordinates and summaries; restore the 58 orphaned ruler summaries and source links; remove unused orphan sources and images; populate missing `events.category`, `people.date_kind`, `other_names.language_code`, `sources.url`, and `sources.licence`).
4. Remove legacy static data files (`lib/data/prototype.ts`, `lib/data/images.ts`, `lib/data/generated/`, `lib/data/geo/`, `public/data/*.geojson`) and multi-file seed scripts (`scripts/seed-*.mjs`), replacing them with a single deterministic PostgreSQL seed (`prisma/seed.sql` + `scripts/seed.mjs`) and a streamlined `scripts/check-database.mjs`.

---

## 2. Simplified Schema (16 Populated Tables)

### 2.1 Tables Removed (6 tables)
- `disagreements` (0 rows, unused by app)
- `event_kingdom_sources` (0 rows, unused by app)
- `suggested_changes` (0 rows, unused by app)
- `import_checkpoints` (internal seed-stage tracking, superseded by single deterministic seed)
- `statements` (2 rows, 1:1 with `historical_items` — merged directly into `historical_items`)
- `statement_sources` (2 rows, redundant with `information_sources` where `item_id IS NOT NULL`)

### 2.2 Dead (100%-`NULL`) Columns Removed
- **`places`**: Drop `approximate_radius_km`, `location_accuracy_note`.
- **`events`**: Drop `approximate_radius_km`, `location_accuracy_note`.
- **`historical_items`**: Drop `original_language`, `text_in_original_script`, `transliteration` (line-by-line text lives in `item_text_lines`, and `language`/`script` already exist on `historical_items`). Add merged statement columns from `statements`: `statement` (`TEXT NOT NULL`), `what_it_means` (`TEXT`), `date_doubt` (`TEXT`), `place_doubt` (`TEXT`), `meaning_doubt` (`TEXT`), `statement_is_example` (`BOOLEAN NOT NULL DEFAULT false`).
- **`sources`**: Drop `author`, `year_published`, `publisher_or_institution`.
- **`images`**: Drop `artist_or_creator` (duplicate of populated `image_creator`).
- **`kingdom_capitals`**: Drop `from_year`, `to_year`, `date_note`.
- **`event_kingdoms`**: Drop `role`, `connection_note`.
- **`event_places`**: Drop `relation_note`.
- **`route_kingdoms`**: Drop `sort_order`.
- **`item_kingdoms`**: Drop `relation_note`.
- **`other_names`**: Drop `checked_by_reader`.
- **`information_sources`**: Drop `statement_id` (since `statements` is merged into `historical_items` and `item_id` already links items to sources).

### 2.3 Retained 16 Populated Tables
1. `kingdoms` (54 rows)
2. `people` (668 rows)
3. `places` (~4,548 deduplicated rows)
4. `events` (135 rows after deduplicating Talikota)
5. `historical_items` (2 rows, including statement fields)
6. `item_text_lines` (38 rows)
7. `sources` (~398 active linked rows)
8. `images` (60 active linked rows)
9. `kingdom_borders` (465 valid PostGIS Multipolygon rows)
10. `routes` (2 PostGIS LineString rows)
11. `kingdom_capitals` (~53 rows linking kingdoms to capital places)
12. `event_kingdoms` (~133 rows)
13. `event_places` (~18 rows)
14. `route_kingdoms` (2 rows)
15. `item_kingdoms` (2 rows)
16. `other_names` (243 rows)
17. `information_sources` (~5,750 rows)

*(Note: 17 tables total in `public` when counting all 5 join tables + `other_names` + `information_sources` + `item_text_lines`, all 100% populated with zero empty tables.)*

### 2.4 Constraints & Indexes Added
- Re-enable `CHECK (ST_IsValid(outline))` on `kingdom_borders` after repairing the 9 self-intersecting polygons.
- Add `UNIQUE (kingdom_id, place_id)` on `kingdom_capitals`.
- Add foreign-key indexes on `information_sources` (`source_id`, `kingdom_id`, `person_id`, `place_id`, `event_id`, `item_id`, `route_id`, `border_id`) and `other_names` (`kingdom_id`, `person_id`, `place_id`).

---

## 3. Data Consolidation & Fixes in PostgreSQL

### 3.1 `places` Deduplication (163 Collisions)
- **Merge 9 Named-Place Collisions (`page_name IS NOT NULL`):**
  - `fatehpur-sikri`: Merge `site-Q179046` and `monument-Q179046` into `fatehpur-sikri` (`protected_place = true`, `start_year = 1569`, `map_properties` preserved, sources merged).
  - `ellora`: Merge `monument-Q189616` into `ellora` (`protected_place = true`).
  - `hampi`: Merge `monument-Q26732` into `hampi` (`protected_place = true`).
  - `bateshwar`: Merge `monument-Q4868834` into `bateshwar` (`protected_place = true`).
  - `raigad-fort`: Merge `monument-Q3626515` into `raigad-fort` (`protected_place = true`).
  - `gauda`: Merge `site-Q13058783` and `monument-Q13058783` into `gauda` (`protected_place = true`, `start_year = 1450`, `map_properties` preserved).
  - `madurai`: Merge `site-Q1424358` into `madurai` (`start_year` and `map_properties` preserved).
- **Merge 152 Remaining `site-Q*` + `monument-Q*` Pairs:**
  - Keep `site-Q*` as the surviving row, setting `protected_place = true`, merging `map_properties` (`id`, `name`, `kind`, `y`, `yEnd`, `polity`, `region`, `wikidata`, `wikipedia`, `summary`, `image`), reassigning `information_sources` from `monument-Q*` (deduplicating `(place_id, source_id)`), and deleting the duplicate `monument-Q*` row.
- **Update `/api/map/[kind]/route.ts`:**
  - `kind === 'sites'`: Filter `WHERE p.start_year IS NOT NULL AND p.map_properties IS NOT NULL AND p.map_properties ? 'y'` (instead of `p.id LIKE 'site-%'`).
  - `kind === 'monuments'`: Filter `WHERE p.protected_place = true AND p.map_properties IS NOT NULL` (instead of `p.id LIKE 'monument-%'`).

### 3.2 `kingdoms`, `kingdom_borders`, and `kingdom_capitals`
- **Repair 9 Invalid PostGIS Polygons:**
  - Run `UPDATE kingdom_borders SET outline = ST_Multi(ST_CollectionExtract(ST_MakeValid(outline), 3)) WHERE NOT ST_IsValid(outline)` on `bijapur-38`, `bijapur-39`, and `vijayanagara-455..461`, then add `CHECK (ST_IsValid(outline))`.
- **Align Kingdom Dates (`start_year` / `end_year`):**
  - Update the 16 kingdoms whose `start_year`/`end_year` were overwritten by Cliopatria snapshot bounds so they match their historical dynasty spans (`vijayanagara` `1336–1646`, `bahmani` `1347–1527`, `delhi-sultanate` `1206–1526`, `chola` `850–1279`, `pandya` `590–1345`, `pallava` `275–897`, `chalukya` `543–753`, `rashtrakuta` `753–982`, `pala` `750–1161`, `gurjara-pratihara` `730–1036`, `western-chalukya` `973–1189`, `hoysala` `1026–1343`, `kakatiya` `1163–1323`, `eastern-ganga` `1078–1434`, `gajapati` `1434–1541`, `maratha` `1674–1818`), and expand `kingdoms` check constraint to allow `start_year >= 200` so `pallava` (`275`) is valid. Align `chera-1` border `from_year` to `844` to match `chera`.
- **Link Unlinked Capitals in `kingdom_capitals`:**
  - Link existing places in `places` (`anuradhapura` → `anuradhapura`, `madurai` → `madurai-sultanate`, `lahore` → `ghaznavid` & `ghurid`, `budaun` → `delhi-sultanate`, `penukonda` & `chandragiri` → `vijayanagara`).

### 3.3 `events` Cleanup
- Set `category = 'major_event'` on all 9 turning points (`pulakeshin-harsha-narmada`, `arab-conquest-sindh`, `takkolam`, `rajaraja-chola-accession`, `somnath-sack`, `tarain-second`, `vijayanagara-foundation`, `talikota`, `panipat-first`).
- Merge `battle-battle-of-talikota-1565` into `talikota` (preserving its `event_kingdoms` links and sources, and deleting the duplicate `battle-battle-of-talikota-1565` row).
- Clear erroneous/coarse `map_point` on `battle-battle-of-salher-1672` (which had Surat's coordinates), `battle-battle-of-diu-1509`, `battle-battle-of-chanderi-1528`, and `battle-battle-of-ghaghra-1529`, and delete their `inside_borders` links derived from those points.
- Fix the 4 mismatched Wikipedia battle summaries (`battle-battle-of-waliyan-1221`, `battle-battle-of-fatehpur-1519`, `battle-skirmish-at-pipli-1640`, `battle-battle-of-qalat-i-ghilzai-1505`) and replace the 6 bare `"The battle location is not recorded here."` summaries with clear one-sentence descriptions.

### 3.4 `people`, `other_names`, `sources`, and `images` Cleanup
- Set `date_kind = 'time_as_ruler'` on the 11 curated rulers (`rajaraja-i`, `rajendra-i`, `krishnadevaraya`, `amoghavarsha-i`, `vikramaditya-vi`, `vishnuvardhana`, `dharmapala`, `mihira-bhoja`, `iltutmish`, `alauddin-hasan-bahman-shah`, `jatavarman-sundara-pandyan-i`).
- Fix `kashmir-sultanate` repeat reign names (`Muhammad Shāh (third term)`, `(fourth term)`, `(fifth term)` and `Fatēh Shāh (third term)`).
- Restore the 58 Wikipedia ruler summaries and `wikipedia-ruler-Q*` source links onto their matching `people` rows, and delete the remaining unused orphaned `sources` (~9 rows) and orphaned `images` (4 rows: `art-chola-nataraja`, `ruler-bukka`, `ruler-sri-krishnadevaraya`, `ruler-vishnuvardhana`).
- Populate `other_names.language_code` (`ta`, `te`, `ml`, `kn`, `hi`, `fa`) for all 15 rows where `language_code IS NULL`.
- Populate `sources.url` (extracting the Wikipedia URL from `source_details` for the 327 rows missing `url`) and `sources.licence` (`CC BY-SA 4.0`, `CC BY 4.0`, `CC0`, `Public domain`) across all rows in `sources`.

---

## 4. Codebase & Seed Consolidation

1. **Application Queries & UI:**
   - Update `prisma/schema.prisma` and regenerate the Prisma client (`npx prisma generate`).
   - Update `lib/data/read-atlas.ts` to read statement columns directly from `historical_items` and source citations from `information_sources`.
   - Update `lib/database-info.ts`, `lib/database-browser.ts`, and `app/data/page.tsx` to reflect the 17 populated tables and remove references to deleted tables (`suggested_changes`, `disagreements`, `statements`, `statement_sources`, `event_kingdom_sources`).
   - Update `app/api/map/[kind]/route.ts` to filter `sites` and `monuments` by column attributes rather than `id LIKE 'site-%'` / `'monument-%'`.
2. **Delete Legacy Static Data & Importers:**
   - Remove `lib/data/prototype.ts`, `lib/data/images.ts`, `lib/data/generated/`, `lib/data/geo/`, and `public/data/*.geojson`.
   - Remove the 6 legacy seed scripts (`scripts/seed-core.mjs`, `scripts/seed-extra.mjs`, `scripts/seed-database.mjs`, `scripts/seed-helpers.mjs`, `scripts/seed-records.mjs`, `scripts/seed-relations.mjs`) and legacy static-file check scripts that depended on `prototype.ts`.
3. **Single Deterministic PostgreSQL Seed & Verification:**
   - Export the cleaned PostgreSQL database into `prisma/seed.sql` and create a single `scripts/seed.mjs` (`npm run db:seed`) that loads `prisma/seed.sql` cleanly into PostgreSQL.
   - Update `scripts/check-database.mjs` (`npm run db:check`) and `scripts/check-browser-page.mjs` to validate the consolidated PostgreSQL schema and data without depending on `prototype.ts`.
   - Update `package.json` scripts and `docs/DATABASE.md` to match.
