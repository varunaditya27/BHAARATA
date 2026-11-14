# Data & Sources

PostgreSQL + PostGIS is the single source of truth for all historical records, spatial geometries, sources, and image credits in BHĀRATA.

---

## 1. Sources & Licences

| Dataset | Source | Licence | Records in Database |
|---|---|---|---|
| **Kingdom borders & spans** | [Cliopatria](https://github.com/Seshat-Global-History-Databank/cliopatria) (Seshat Global History Databank) | CC BY 4.0 | 54 kingdoms, 465 validated PostGIS `MultiPolygon` border shapes (600–1700 CE), plus 1 hand-drawn illustrative border for Chera (`466` total) |
| **Rulers & biographical summaries** | Wikidata (CC0) and English Wikipedia monarch lists & articles | CC0 / CC BY-SA 4.0 | 606 rulers across 50 kingdoms (all within their kingdom's historical span) |
| **Places, capitals, dated sites & protected monuments** | Wikidata & Wikipedia | CC0 / CC BY-SA 4.0 | 392 deduplicated places: 51 named cities/capitals and 344 dated historical sites (600–1700 CE), of which 154 are ASI-protected monuments (`protected_place = true`) |
| **Turning points & battles** | Curated Wikipedia-checked turning points & Wikidata battles with verified coordinates | CC0 / CC BY-SA 4.0 | 35 events: 9 turning points (`major_event`) and 26 geolocated, kingdom-linked battles (`battle`) |
| **Epigraphic evidence** | *South Indian Inscriptions* Vol. II (nos. 85 and 88, 1913) | Public domain | 2 inscriptions (`sii-ii-85`, `sii-ii-88`) with 5 English translation lines |
| **Photographs** | Wikimedia Commons | CC0 / CC BY / CC BY-SA / Public domain | 97 credited images (`images` table + `public/images/`) |
| **Sources & provenance** | All cited works above | Per-source licence | 209 active sources linked via `information_sources` |

---

## 2. Database Tables (17 Populated Tables)

Every table in `public` is populated and contains zero unused (`100%-NULL`) columns:

1. `kingdoms` (55 rows)
2. `people` (606 rows)
3. `places` (392 rows)
4. `events` (35 rows)
5. `historical_items` (2 rows)
6. `item_text_lines` (5 rows)
7. `sources` (209 rows)
8. `images` (97 rows)
9. `kingdom_borders` (466 rows, enforced by `CHECK (ST_IsValid(outline))`)
10. `routes` (2 rows)
11. `kingdom_capitals` (61 rows)
12. `event_kingdoms` (38 rows)
13. `event_places` (9 rows)
14. `route_kingdoms` (2 rows)
15. `item_kingdoms` (2 rows)
16. `other_names` (241 rows)
17. `information_sources` (1,513 rows)

---

## 3. Seeding & Verification

- **Seed the database:** `npm run db:seed` (executes `scripts/seed.mjs` which loads `prisma/seed.sql` in a single transaction).
- **Verify integrity:** `npm run db:check` (executes `scripts/check-database.mjs` to check all 17 tables, PostGIS geometry validity, zero orphaned sources/images, zero out-of-range rulers, zero unlinked battles, and full Zod domain validation via `readAtlas`).
