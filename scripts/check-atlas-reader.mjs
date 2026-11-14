import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '../lib/generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import { readAtlas } from '../lib/data/read-atlas.ts';
import { atlasAccess } from '../lib/data/atlas-data.ts';
import { getHistoricalState } from '../lib/geo/historical-state.ts';
import { PolitySchema, PersonSchema, PlaceSchema, EventSchema, EvidenceSchema, SourceSchema, HistoricalBoundarySchema, RouteSchema } from '../lib/domain/types.ts';

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || 'postgresql://bhaarata:bhaarata@localhost:55432/bhaarata' }),
});
try {
  const actual = await readAtlas(db);
  assert.equal(actual.polities.length, 55, 'polities count');
  assert.equal(actual.people.length, 668, 'people count');
  assert.equal(actual.places.length, 55, 'named places count');
  assert.equal(actual.events.length, 135, 'events count');
  assert.equal(actual.evidence.length, 2, 'evidence count');
  assert.equal(actual.boundaries.length, 466, 'boundaries count');
  assert.equal(actual.routes.length, 2, 'routes count');

  for (const p of actual.polities) PolitySchema.parse(p);
  for (const p of actual.people) PersonSchema.parse(p);
  for (const p of actual.places) PlaceSchema.parse(p);
  for (const e of actual.events) EventSchema.parse(e);
  for (const e of actual.evidence) EvidenceSchema.parse(e);
  for (const s of actual.sources) SourceSchema.parse(s);
  for (const b of actual.boundaries) HistoricalBoundarySchema.parse(b);
  for (const r of actual.routes) RouteSchema.parse(r);

  const renamed = { ...actual.polities[0], slug: 'a-different-page-address' };
  const lookup = atlasAccess({ ...actual, polities: [renamed] });
  assert.equal(lookup.getPolityById(renamed.id), renamed);
  assert.equal(lookup.getPolityBySlug(renamed.slug), renamed);
  assert.equal(lookup.getPolityBySlug(renamed.id), undefined);

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
  console.log('Atlas reader validated all domain schemas and historical states for 45 sample years.');
} finally {
  await db.$disconnect();
}
