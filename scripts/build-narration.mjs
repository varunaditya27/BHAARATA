// Writes public/narration/scripts.json: the ~20-second spoken description of every page, keyed by route.
// A route "/people/rajaraja-i" has the key "people-rajaraja-i"; "/" has the key "home".
// Every sentence is built from stored fields only, so the voice never says more than the page does.
// Run: npm run narration:text   then   npm run narration:audio
import fs from 'node:fs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../lib/generated/prisma/client.ts';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || 'postgresql://bhaarata:bhaarata@localhost:55432/bhaarata' }),
});

const MAX_WORDS = 55;
const ORDINALS = { I: 'the First', II: 'the Second', III: 'the Third', IV: 'the Fourth', V: 'the Fifth', VI: 'the Sixth', VII: 'the Seventh', VIII: 'the Eighth', IX: 'the Ninth', X: 'the Tenth' };

/** "Rajaraja I" is read "Rajaraja the First"; the model would otherwise say "Rajaraja eye". */
const speakName = name => name.replace(/\s*\([^)]*\)/g, '').replace(/\b(I{1,3}|IV|V|VI{0,3}|IX|X)\b$/, m => ORDINALS[m] ?? m);

const when = (start, end, startType, endType) => {
  if (start === null || startType === 'unknown') return null;
  const s = `${startType === 'about' ? 'around ' : startType === 'before' ? 'before ' : startType === 'after' ? 'after ' : ''}${start}`;
  if (end === null || endType === 'unknown' || end === start) return s;
  return `${s} to ${endType === 'about' ? 'around ' : ''}${end}`;
};

const a = word => (/^[aeiou]/i.test(word) ? 'an' : 'a');

const sentences = (text, count) => {
  const parts = (text ?? '').replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+(?:\s|$)/g) ?? [];
  return parts.slice(0, count).join('').trim();
};

const trimWords = text => {
  const words = text.split(/\s+/);
  if (words.length <= MAX_WORDS) return text;
  const cut = words.slice(0, MAX_WORDS).join(' ');
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '));
  return end > 100 ? cut.slice(0, end + 1) : cut.replace(/[,;:]?\s*\S*$/, '') + '.';
};

const out = {};
const add = (key, text) => { out[key] = trimWords(text.replace(/\s+/g, ' ').trim()); };

// --- Section pages, written by hand ------------------------------------------------------------------------------
add('home', 'Welcome to Bharata, an atlas of the Indian subcontinent from the year 600 to 1700. Scroll down to fall from orbit onto the map, and watch kingdoms rise and fade across eleven centuries. Every claim names its source, and where we do not know, the atlas says so.');
add('atlas', 'This is the atlas. Drag the timeline at the bottom to move through the years, and watch borders change. Click a kingdom to see its rulers, its capitals and its battles. Press the question mark for keyboard shortcuts, or play the timeline to see history unfold on its own.');
add('chronology', 'This is the timeline. Each coloured lane is one kingdom, drawn from its first year to its last, so you can see at a glance who ruled at the same time. Battles are marked along the bottom. Click any lane to open that kingdom.');
add('polities', 'These are the kingdoms, empires and sultanates of the atlas. Move the slider to see which of them held land in any given year, or search by name. Each card opens a page with its rulers, places, events and evidence.');
add('people', 'These are the rulers recorded in the atlas, grouped by kingdom and sorted by their dates. Some dates describe a reign and some only a lifetime, and the page says which. Search by name, or jump straight to a kingdom.');
add('places', 'These are the places of the atlas: capitals, temples, forts, tombs and mosques, each with a position on the map. Some are protected monuments today, and the page says so. Choose a place to see which kingdoms held it, and when.');
add('evidence', 'This is the evidence room. Here you can read real translations of inscriptions, and follow each claim back to its source. The page shows what is certain, what is uncertain, and why, so you can judge for yourself.');
add('search', 'This is the search page. Choose rulers, kingdoms, places or events, then narrow them with filters. You can ask for rulers who reigned during a battle, kingdoms that shared a border, or places inside a kingdom in a particular year.');
add('data', 'This is the database browser. Every table behind the atlas is open here, from kingdoms and rulers to sources and images. Choose a table to read its rows exactly as they are stored.');
add('connections', 'This diagram shows how the tables of the database are linked. Each box is a table, and each line is a connection, for example a ruler belonging to a kingdom, or a battle taking place inside one. Use it to understand how the records fit together.');

// --- Kingdoms -----------------------------------------------------------------------------------------------------
const kingdoms = await prisma.$queryRaw`
  SELECT k.id, k.page_name, k.name, k.kingdom_type, k.region, k.summary, k.start_year, k.end_year, k.start_date_type::text AS st, k.end_date_type::text AS et,
         (SELECT count(*) FROM people p WHERE p.kingdom_id = k.id) AS rulers,
         (SELECT string_agg(coalesce(kc.name_as_recorded, pl.name), ' and ' ORDER BY kc.display_order) FROM kingdom_capitals kc JOIN places pl ON pl.id = kc.place_id WHERE kc.kingdom_id = k.id) AS capitals
  FROM kingdoms k ORDER BY k.id`;
for (const k of kingdoms) {
  const span = when(k.start_year, k.end_year, k.st, k.et);
  const rulers = Number(k.rulers);
  add(`polities-${k.page_name}`, [
    `${speakName(k.name)}. ${a(k.kingdom_type)} ${k.kingdom_type.toLowerCase()} in ${k.region}${span ? `, from ${span}` : ''}.`.replace(/^(.*?\. )(a|an)/, (m, head, art) => head + art.replace(/^./, c => c.toUpperCase())),
    sentences(k.summary, 2),
    k.capitals ? (k.capitals.includes(' and ') ? `Its capitals were ${k.capitals}.` : `Its capital was ${k.capitals}.`) : '',
    rulers ? `The atlas records ${rulers} ${rulers === 1 ? 'ruler' : 'rulers'}.` : '',
  ].filter(Boolean).join(' '));
}

// --- Rulers -------------------------------------------------------------------------------------------------------
const people = await prisma.$queryRaw`
  SELECT p.page_name, p.name, p.role, p.summary, p.date_kind::text AS kind, p.start_year, p.end_year, p.start_date_type::text AS st, p.end_date_type::text AS et, k.name AS kingdom
  FROM people p LEFT JOIN kingdoms k ON k.id = p.kingdom_id ORDER BY p.id`;
for (const p of people) {
  const span = when(p.start_year, p.end_year, p.st, p.et);
  const dates = !span ? 'The dates are not recorded.' : p.kind === 'life' ? `Lived ${span}.` : `Ruled ${span}.`;
  const body = sentences(p.summary, 2) || 'Not much more is recorded here yet.';
  add(`people-${p.page_name}`, `${speakName(p.name)}, ${p.role}. ${dates} ${body}${p.kingdom ? ` ${p.kingdom} is one of the kingdoms in this atlas.` : ''}`);
}

// --- Places -------------------------------------------------------------------------------------------------------
const places = await prisma.$queryRaw`
  SELECT p.page_name, p.name, p.place_kind, p.region, p.protected_place,
         (SELECT string_agg(k.name, ' and ' ORDER BY k.name) FROM kingdom_capitals kc JOIN kingdoms k ON k.id = kc.kingdom_id WHERE kc.place_id = p.id) AS capital_of
  FROM places p WHERE p.page_name IS NOT NULL ORDER BY p.id`;
for (const p of places) {
  const region = p.region && p.region !== 'Indian subcontinent' ? ` in ${p.region}` : '';
  add(`places-${p.page_name}`, [
    `${p.name}. ${a(p.place_kind).replace(/^./, c => c.toUpperCase())} ${p.place_kind}${region}.`,
    p.capital_of ? `It was a capital of ${p.capital_of}.` : '',
    p.protected_place ? 'It is a protected monument today.' : '',
    'Open the page to see which kingdoms held this place, and when.',
  ].filter(Boolean).join(' '));
}

// --- Evidence -----------------------------------------------------------------------------------------------------
const items = await prisma.$queryRaw`SELECT page_name, title, item_type, statement FROM historical_items ORDER BY id`;
for (const e of items) {
  add(`evidence-${e.page_name}`, `${e.title}. ${a(e.item_type).replace(/^./, c => c.toUpperCase())} ${e.item_type}. ${sentences(e.statement, 2)} Read the translation, then follow the claim back to its source.`);
}

fs.mkdirSync(new URL('../public/narration/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('../public/narration/scripts.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
const counts = Object.values(out).map(t => t.split(/\s+/).length);
console.log(`${Object.keys(out).length} scripts, ${Math.min(...counts)}-${Math.max(...counts)} words (avg ${Math.round(counts.reduce((a, b) => a + b, 0) / counts.length)})`);
await prisma.$disconnect();
