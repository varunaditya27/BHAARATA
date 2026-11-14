import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '../lib/generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import { readAtlas } from '../lib/data/read-atlas.ts';
import { atlasAccess } from '../lib/data/atlas-data.ts';
import { getHistoricalState } from '../lib/geo/historical-state.ts';
import { formatDateRange, yearInRange } from '../lib/domain/time.ts';
import { PolitySchema, PersonSchema, PlaceSchema, EventSchema, EvidenceSchema, SourceSchema, HistoricalBoundarySchema, RouteSchema } from '../lib/domain/types.ts';

const tables = [
  'kingdoms', 'people', 'places', 'events', 'sources', 'images',
  'historical_items', 'item_text_lines', 'kingdom_borders', 'routes',
  'kingdom_capitals', 'event_kingdoms', 'event_places', 'route_kingdoms',
  'item_kingdoms', 'other_names', 'information_sources',
];

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || 'postgresql://bhaarata:bhaarata@localhost:55432/bhaarata' }),
});

try {
  // 1. All 17 tables non-empty with zero 100%-NULL columns
  for (const table of tables) {
    const [{ count }] = await db.$queryRawUnsafe(`SELECT count(*)::int AS count FROM "${table}"`);
    assert.ok(count > 0, `Table ${table} must not be empty`);
    const cols = await db.$queryRaw`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${table} ORDER BY ordinal_position
    `;
    for (const { column_name } of cols) {
      const [{ nonNull }] = await db.$queryRawUnsafe(`SELECT count(*)::int AS "nonNull" FROM "${table}" WHERE "${column_name}" IS NOT NULL`);
      assert.ok(nonNull > 0, `Column ${table}.${column_name} is 100% NULL`);
    }
  }

  // 2. PostGIS validity, referential integrity, and zero orphans/duplicates
  const [{ invalidBorders }] = await db.$queryRaw`SELECT count(*)::int AS "invalidBorders" FROM kingdom_borders WHERE NOT ST_IsValid(outline)`;
  assert.equal(invalidBorders, 0, 'All kingdom borders must have valid PostGIS geometries');

  const [{ orphanSources }] = await db.$queryRaw`SELECT count(*)::int AS "orphanSources" FROM sources s WHERE NOT EXISTS (SELECT 1 FROM information_sources i WHERE i.source_id = s.id)`;
  assert.equal(orphanSources, 0, 'Zero orphaned sources allowed');

  const [{ orphanImages }] = await db.$queryRaw`
    SELECT count(*)::int AS "orphanImages" FROM images img
    WHERE NOT EXISTS (SELECT 1 FROM kingdoms k WHERE k.main_image_id = img.id)
      AND NOT EXISTS (SELECT 1 FROM people p WHERE p.portrait_id = img.id)
      AND NOT EXISTS (SELECT 1 FROM places pl WHERE pl.main_image_id = img.id)
      AND NOT EXISTS (SELECT 1 FROM historical_items h WHERE h.image_id = img.id)
  `;
  assert.equal(orphanImages, 0, 'Zero orphaned images allowed');

  const [{ outOfRangeRulers }] = await db.$queryRaw`
    SELECT count(*)::int AS "outOfRangeRulers" FROM people p JOIN kingdoms k ON k.id = p.kingdom_id
    WHERE p.end_year IS NULL OR p.end_year < k.start_year OR p.start_year > k.end_year
  `;
  assert.equal(outOfRangeRulers, 0, 'Zero out-of-range rulers allowed');

  const [{ unlinkedBattles }] = await db.$queryRaw`
    SELECT count(*)::int AS "unlinkedBattles" FROM events e
    WHERE e.category = 'battle' AND (e.map_point IS NULL OR NOT EXISTS (SELECT 1 FROM event_kingdoms ek WHERE ek.event_id = e.id))
  `;
  assert.equal(unlinkedBattles, 0, 'Zero unlinked or coordinate-less battles allowed');

  // 3. Validate readAtlas(db) and Zod domain schemas
  const actual = await readAtlas(db);
  assert.equal(actual.polities.length, 55, 'polities count');
  assert.equal(actual.people.length, 584, 'people count');
  assert.equal(actual.places.length, 51, 'named places count');
  assert.equal(actual.events.length, 35, 'events count');
  assert.equal(actual.evidence.length, 2, 'evidence count');
  assert.equal(actual.boundaries.length, 466, 'boundaries count');
  assert.equal(actual.routes.length, 2, 'routes count');

  for (const p of actual.polities) PolitySchema.parse(p);
  for (const p of actual.people) {
    PersonSchema.parse(p);
    assert.ok(p.imageKey && p.imageKey.startsWith('ruler-') && actual.images[p.imageKey], `missing dedicated ruler image: ${p.id}`);
  }
  for (const p of actual.places) {
    PlaceSchema.parse(p);
    assert.ok(p.imageKey && actual.images[p.imageKey], `missing place image: ${p.id}`);
  }
  for (const e of actual.events) EventSchema.parse(e);
  for (const e of actual.evidence) EvidenceSchema.parse(e);
  for (const s of actual.sources) SourceSchema.parse(s);
  for (const b of actual.boundaries) HistoricalBoundarySchema.parse(b);
  for (const r of actual.routes) RouteSchema.parse(r);

  for (const [id, image] of Object.entries(actual.images)) {
    if (image.file.startsWith('/')) {
      assert.ok(existsSync(join(process.cwd(), 'public', image.file)), `image file exists: ${id}`);
    }
  }

  for (let year = 600; year <= 1700; year += 25) {
    const state = getHistoricalState(year, actual);
    assert.ok(state.activePolities.length > 0, `active polities in ${year}`);
    assert.ok(state.activeBoundaries.length > 0, `active boundaries in ${year}`);
  }

  // 4. Date range edge cases
  const unknown = { startYear: 0, endYear: null, startQualifier: 'unknown', endQualifier: 'unknown', confidence: 'unknown' };
  assert.equal(formatDateRange(unknown), 'date unknown');
  assert.equal(yearInRange(1050, unknown), false);
  const sample = { polities: [{ id: 'x', period: unknown }], boundaries: [{ polityId: 'x', validFrom: 1000, validTo: 1100 }], events: [], routes: [] };
  assert.equal(getHistoricalState(1050, sample).activePolities.length, 1);
  assert.equal(getHistoricalState(1150, sample).activePolities.length, 0);

  const lookup = atlasAccess(actual);
  assert.equal(lookup.getPolityBySlug('chola')?.id, 'chola');

  console.log('Database schema, PostGIS geometries, domain schemas, and historical state verified.');
} finally {
  await db.$disconnect();
}
