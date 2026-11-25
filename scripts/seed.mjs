import fs from 'node:fs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../lib/generated/prisma/client.ts';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || 'postgresql://bhaarata:bhaarata@localhost:55432/bhaarata' }),
});

const sql = ['seed.sql', 'enrichment-people.sql']
  .map(name => new URL(`../prisma/${name}`, import.meta.url))
  .filter(file => fs.existsSync(file))
  .map(file => fs.readFileSync(file, 'utf8'))
  .join('\n');
const statements = sql
  .split(/;\r?\n/)
  .map(s => s.trim())
  .filter(Boolean);

await prisma.$transaction(async tx => {
  await tx.$executeRawUnsafe(`
    TRUNCATE TABLE
      information_sources,
      other_names,
      item_kingdoms,
      route_kingdoms,
      event_places,
      event_kingdoms,
      kingdom_capitals,
      routes,
      kingdom_borders,
      item_text_lines,
      historical_items,
      events,
      people,
      places,
      kingdoms,
      sources,
      images
    RESTART IDENTITY CASCADE
  `);
  for (const stmt of statements) {
    await tx.$executeRawUnsafe(stmt);
  }
}, { timeout: 60000 });

console.log(`Seeded database with ${statements.length} SQL batch statements.`);
await prisma.$disconnect();
