import assert from 'node:assert/strict';
import { PrismaClient } from '../lib/generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';

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
  // 1. Verify all 17 schema tables exist and are non-empty, with zero 100%-NULL columns
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

  // 2. Verify expected entity counts
  assert.equal(await db.kingdoms.count(), 55);
  assert.equal(await db.people.count(), 668);
  assert.equal(await db.events.count(), 135);
  assert.equal(await db.historical_items.count(), 2);
  assert.equal(await db.kingdom_borders.count(), 466);
  assert.equal(await db.routes.count(), 2);

  // 3. Verify PostGIS geometry validity on all borders
  const [{ invalidBorders }] = await db.$queryRaw`
    SELECT count(*)::int AS "invalidBorders" FROM kingdom_borders WHERE NOT ST_IsValid(outline)
  `;
  assert.equal(invalidBorders, 0, 'All kingdom borders must have valid PostGIS geometries');

  // 4. Verify zero orphaned sources or images
  const [{ orphanSources }] = await db.$queryRaw`
    SELECT count(*)::int AS "orphanSources" FROM sources s
    WHERE NOT EXISTS (SELECT 1 FROM information_sources i WHERE i.source_id = s.id)
  `;
  assert.equal(orphanSources, 0, 'Zero orphaned sources allowed');

  const [{ orphanImages }] = await db.$queryRaw`
    SELECT count(*)::int AS "orphanImages" FROM images img
    WHERE NOT EXISTS (SELECT 1 FROM kingdoms k WHERE k.main_image_id = img.id)
      AND NOT EXISTS (SELECT 1 FROM people p WHERE p.portrait_id = img.id)
      AND NOT EXISTS (SELECT 1 FROM places pl WHERE pl.main_image_id = img.id)
      AND NOT EXISTS (SELECT 1 FROM historical_items h WHERE h.image_id = img.id)
  `;
  assert.equal(orphanImages, 0, 'Zero orphaned images allowed');

  // 5. Verify zero duplicate Wikidata Q-IDs in places
  const dupQ = await db.$queryRaw`
    SELECT map_properties->>'wikidata' AS q, count(*)::int AS c
    FROM places
    WHERE map_properties->>'wikidata' IS NOT NULL
    GROUP BY map_properties->>'wikidata'
    HAVING count(*) > 1
  `;
  assert.equal(dupQ.length, 0, 'Zero duplicate Wikidata Q-IDs in places');

  // 6. Verify capital links and evidence lines
  for (const [kingdom_id, place_id] of [['hoysala','dorasamudra'],['pala','pataliputra'],['bahmani','gulbarga'],['vijayanagara','hampi'],['vijayanagara','penukonda']]) {
    assert.equal(await db.kingdom_capitals.count({ where: { kingdom_id, place_id } }), 1);
  }
  const example = await db.historical_items.findFirstOrThrow({ include: { item_text_lines: true } });
  assert.ok(example.item_text_lines.length > 0);
  assert.ok(example.statement.length > 10);

  console.log('Consolidated PostgreSQL schema, 17 tables, PostGIS geometries, and referential integrity verified.');
} finally {
  await db.$disconnect();
}
