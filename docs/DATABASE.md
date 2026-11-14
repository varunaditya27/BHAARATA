# Database

The atlas, search, map layers, and data pages read PostgreSQL + PostGIS directly as the single source of truth. There is no secondary JSON or TypeScript runtime store.

## Setup & Seeding

To run locally:
1. Start the PostGIS container with `docker compose up -d`.
2. Run `npm run db:setup` once. This applies `prisma/migrations/20261114000000_initial/migration.sql` and populates all 17 tables from the deterministic PostgreSQL seed (`prisma/seed.sql` via `scripts/seed.mjs`).
3. Run `npm run db:check` to verify schema integrity, PostGIS geometry validity, referential links, and domain schema validation.

## Schema Structure (17 Populated Tables)

`prisma/migrations` and `prisma/schema.prisma` define the 17 project tables:
- **Core records:** `kingdoms` (55), `people` (584), `places` (392 deduplicated cities, dated sites, and protected monuments), `events` (35 turning points and geolocated battles), `historical_items` (2 inscriptions with statements and uncertainty ratings), `item_text_lines` (5 translation lines), `sources` (209 cited sources with URLs and licences), and `images` (1,026 credited images across all kingdoms, rulers, places, and inscriptions).
- **Geography:** `kingdom_borders` (466 validated PostGIS `MultiPolygon` shapes with `CHECK (ST_IsValid(outline))`) and `routes` (2 PostGIS `LineString` paths).
- **Relationships:** `kingdom_capitals` (59), `event_kingdoms` (36), `event_places` (8), `route_kingdoms` (2), `item_kingdoms` (2), `other_names` (241), and `information_sources` (1,798).

## Pages & Endpoints

- `/data` ("Browse the data") lets visitors inspect and search all 17 tables.
- `/connections` ("How the data connects") queries `pg_constraint` to display foreign-key relationships across the 17 tables.
- `/api/map/sites` and `/api/map/monuments` serve GeoJSON `FeatureCollection` layers directly from `places` using PostGIS `ST_AsGeoJSON`.
