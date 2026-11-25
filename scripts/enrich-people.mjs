// Adds rulers and fills missing ruler summaries from Wikipedia and Wikidata.
// Writes prisma/enrichment-people.sql, which db:seed runs after seed.sql.
// Run: mv prisma/enrichment-people.sql /tmp && npm run db:seed && npm run data:people   (about 30 minutes; resumes if interrupted)
import fs from 'node:fs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../lib/generated/prisma/client.ts';
import { chunk, flush, sparql, sqlNumber, sqlString, squash, wikidata, wikipedia } from './lib/wiki.mjs';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || 'postgresql://bhaarata:bhaarata@localhost:55432/bhaarata' }),
});

// Each kingdom's Wikipedia article (to find its Wikidata item) and the Wikipedia categories that list its rulers.
// Categories were chosen by checking that they exist and hold people; kingdoms with none rely on Wikidata alone.
const KINGDOMS = {
  ahmadnagar: ['Ahmadnagar Sultanate', ['Sultans of Ahmadnagar']],
  anuradhapura: ['Anuradhapura kingdom', ['Monarchs of Anuradhapura']],
  bahmani: ['Bahmani Sultanate', ['Bahmani sultans']],
  'bengal-sultanate': ['Bengal Sultanate', ['Sultans of Bengal']],
  berar: ['Berar Sultanate', ['Imad Shahi dynasty']],
  'bidar-sultanate': ['Bidar Sultanate', ['Barid Shahi sultans']],
  bijapur: ['Bijapur Sultanate', ['Sultans of Bijapur']],
  'chalukya-badami': ['Chalukya dynasty', ['Chalukya kings']],
  'chalukya-kalyani': ['Western Chalukya Empire', ['Western Chalukya kings']],
  chandra: ['Chandra dynasty', ['Chandra kings']],
  chauhan: ['Chauhan dynasty', ['Chahamanas of Shakambhari']],
  chaulukya: ['Chaulukya dynasty', ['Chaulukya kings']],
  chera: ['Chera dynasty', ['Chera kings']],
  chola: ['Chola dynasty', ['Chola kings']],
  dambadeniya: ['Kingdom of Dambadeniya', ['Monarchs of Dambadeniya']],
  'delhi-sultanate': ['Delhi Sultanate', ['Mamluk dynasty (Delhi)', 'Khalji dynasty', 'Tughlaq dynasty', 'Sayyid dynasty', 'Lodi dynasty']],
  'eastern-ganga': ['Eastern Ganga dynasty', ['Eastern Ganga kings']],
  gahadavala: ['Gahadavala dynasty', ['Gahadavala kings']],
  ghaznavid: ['Ghaznavid Empire', ['Ghaznavid sultans']],
  ghurid: ['Ghurid dynasty', []],
  golconda: ['Golconda Sultanate', ['Sultans of Golconda']],
  gorkha: ['Gorkha kingdom', ['Kings of Gorkha']],
  harsha: ['Harsha', []],
  hoysala: ['Hoysala Empire', ['Hoysala kings']],
  jaffna: ['Jaffna kingdom', []],
  jaunpur: ['Jaunpur Sultanate', []],
  kakatiya: ['Kakatiya dynasty', []],
  kamarupa: ['Kamarupa', ['Kings of Kamarupa']],
  kampili: ['Kampili kingdom', []],
  karkota: ['Karkota dynasty', ['Karkota dynasty']],
  'kashmir-sultanate': ['Kashmir Sultanate', ['Sultans of Kashmir']],
  lohara: ['Lohara dynasty', ['Lohara dynasty']],
  'madurai-nayaks': ['Madurai Nayak dynasty', ['Madurai Nayak dynasty']],
  maitraka: ['Maitrakas of Vallabhi', []],
  maratha: ['Maratha Empire', []],
  mughal: ['Mughal Empire', []],
  mysore: ['Kingdom of Mysore', ['Wadiyar dynasty']],
  pala: ['Pala Empire', ['Pala emperors']],
  pallava: ['Pallava dynasty', ['Pallava kings']],
  pandya: ['Pandya dynasty', ['Pandyan kings']],
  paramara: ['Paramara dynasty', ['Paramara dynasty']],
  polonnaruwa: ['Kingdom of Polonnaruwa', ['Monarchs of Polonnaruwa']],
  pratihara: ['Gurjara-Pratihara dynasty', []],
  rashtrakuta: ['Rashtrakuta Empire', ['Rashtrakuta emperors']],
  samma: ['Samma dynasty', []],
  sena: ['Sena dynasty', ['Sena kings']],
  sur: ['Sur Empire', []],
  'thanjavur-marathas': ['Thanjavur Maratha kingdom', []],
  'thanjavur-nayaks': ['Thanjavur Nayak kingdom', []],
  'turk-shahis': ['Turk Shahis', []],
  utpala: ['Utpala dynasty', ['Utpala dynasty']],
  vijayanagara: ['Vijayanagara Empire', ['Vijayanagara emperors']],
  yadava: ['Seuna dynasty', []],
  chandela: ['Chandela dynasty', []],
};

const title = t => t.replace(/\s*\([^)]*\)\s*$/, '').trim();
const RULER_WORDS = /king|ruler|emperor|sultan|raja|monarch|chief|queen|maharaja|shah|emir|regent|nayak|peshwa|chhatrapati|governor/i;

// ---------------------------------------------------------------------------
// Reading dates and a short summary out of a Wikipedia introduction.
// ---------------------------------------------------------------------------

const REIGN = /\b(?:r\.|reigned|ruled|reign)[^\d()]{0,14}(?:c\.|circa|ca\.|about)?\s*(\d{3,4})\s*(?:CE|AD)?\s*(?:[–—-]|to)\s*(?:c\.\s*|circa\s+)?(\d{3,4})/i;
const LIFE = /\((?:[^()]{0,60};\s*)?(?:born\s+|b\.\s*)?(?:c\.\s*|circa\s+|ca\.\s*)?(\d{3,4})(?:\s*(?:CE|AD))?\s*(?:[–—-])\s*(?:c\.\s*|circa\s+)?(\d{3,4})(?:\s*(?:CE|AD))?\s*\)/;

/** Dates stated in the introduction, or null. `kind` is whether they describe a reign or a lifetime. */
function datesFromText(text) {
  const head = text.slice(0, 500);
  if (/\b(BCE|BC)\b/.test(head.slice(0, 250))) return { bce: true };
  for (const [re, kind] of [[REIGN, 'time_as_ruler'], [LIFE, 'life']]) {
    const m = head.match(re);
    if (m && Number(m[1]) <= Number(m[2]) && Number(m[1]) >= 100) return { start: Number(m[1]), end: Number(m[2]), kind };
  }
  return null;
}

/** The first paragraph, without pronunciation and native-script brackets, cut at a sentence end. */
function summaryFrom(extract) {
  const first = extract.split('\n').find(p => p.trim().length > 40) ?? '';
  const clean = first
    .replace(/\s*\([^()]*[^\p{Script=Latin}\p{Script=Common}\p{M}][^()]*\)/gu, '')
    .replace(/\s*\((?:[^()]*pronounced|[^()]*IPA)[^()]*\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= 420) return clean;
  const cut = clean.slice(0, 420);
  const end = Math.max(cut.lastIndexOf('. '), 0);
  return end > 120 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '') + '…';
}

// ---------------------------------------------------------------------------
// Wikipedia and Wikidata lookups.
// ---------------------------------------------------------------------------

/** Titles of the pages in a category. */
async function categoryPages(name) {
  const out = [];
  let cont = {};
  do {
    const r = await wikipedia({ action: 'query', list: 'categorymembers', cmtitle: `Category:${name}`, cmtype: 'page', cmlimit: '500', ...cont });
    out.push(...(r.query?.categorymembers ?? []).map(m => m.title));
    cont = r.continue ?? null;
  } while (cont);
  return out;
}

/** Introductions, short descriptions and Wikidata ids for a list of article titles. */
async function articleDetails(titles) {
  const found = new Map();
  for (const group of chunk(titles, 20)) {
    const r = await wikipedia({
      action: 'query', prop: 'extracts|pageprops|description', exintro: '1', explaintext: '1', exlimit: '20',
      ppprop: 'wikibase_item', redirects: '1', titles: group.join('|'),
    });
    for (const page of Object.values(r.query?.pages ?? {})) {
      if (page.missing !== undefined) continue;
      found.set(page.title, { title: page.title, extract: page.extract ?? '', description: page.description ?? '', qid: page.pageprops?.wikibase_item ?? null });
    }
    // Wikipedia answers under the final title; let the title we asked for find it too.
    const moved = new Map([...(r.query?.normalized ?? []), ...(r.query?.redirects ?? [])].map(x => [x.from, x.to]));
    for (const asked of group) {
      let final = asked;
      for (let i = 0; i < 4 && moved.has(final); i++) final = moved.get(final);
      if (found.has(final)) found.set(asked, found.get(final));
    }
  }
  return found;
}

const yearOf = claim => {
  const v = claim?.mainsnak?.datavalue?.value;
  return v && v.precision >= 9 ? Number(v.time.slice(0, 5).replace('+', '')) : null;
};

/** Is each Wikidata item a human, and what birth and death years does it record? */
async function humans(qids) {
  const out = new Map();
  for (const group of chunk([...new Set(qids)], 50)) {
    const r = await wikidata({ action: 'wbgetentities', ids: group.join('|'), props: 'claims' });
    for (const [id, e] of Object.entries(r.entities ?? {})) {
      const claims = e.claims ?? {};
      out.set(id, {
        human: (claims.P31 ?? []).some(c => c.mainsnak?.datavalue?.value?.id === 'Q5'),
        born: yearOf(claims.P569?.[0]),
        died: yearOf(claims.P570?.[0]),
      });
    }
  }
  return out;
}

/** Reign or lifetime years from each article's infobox, for articles whose introduction states no dates. */
async function infoboxDates(titles) {
  const out = new Map();
  const years = text => [...text.matchAll(/\b(\d{3,4})\b/g)].map(m => Number(m[1])).filter(y => y >= 100 && y <= 1900);
  for (const group of chunk(titles, 20)) {
    const r = await wikipedia({ action: 'query', prop: 'revisions', rvprop: 'content', rvslots: 'main', redirects: '1', titles: group.join('|') });
    const moved = new Map([...(r.query?.normalized ?? []), ...(r.query?.redirects ?? [])].map(x => [x.from, x.to]));
    const byTitle = new Map(Object.values(r.query?.pages ?? {}).map(p => [p.title, p.revisions?.[0]?.slots?.main?.['*'] ?? '']));
    for (const asked of group) {
      let final = asked;
      for (let i = 0; i < 4 && moved.has(final); i++) final = moved.get(final);
      const wikitext = byTitle.get(final) ?? '';
      const field = names => (wikitext.match(new RegExp(`\\|\\s*(?:${names})\\s*=\\s*([^\\n]*)`, 'i')) ?? [])[1] ?? '';
      const reign = field('reign|reign_start|reign-start|term_start');
      const reignEnd = field('reign_end|reign-end|term_end');
      if (/\b(BCE|BC)\b/.test(reign)) continue;
      let ys = years(`${reign} ${reignEnd}`);
      let kind = 'time_as_ruler';
      if (!ys.length) {
        ys = years(`${field('birth_date')} ${field('death_date')}`);
        kind = 'life';
      }
      if (ys.length) out.set(asked, { start: ys[0], end: ys[ys.length - 1], kind });
    }
  }
  return out;
}

/** Rulers Wikidata lists directly on a kingdom's item (head of state or head of government). */
async function wikidataRulers(kingdomQids) {
  const values = kingdomQids.map(q => `wd:${q}`).join(' ');
  const r = await sparql(`SELECT ?k ?title WHERE { VALUES ?k { ${values} } { ?k wdt:P35 ?p } UNION { ?k wdt:P6 ?p } ?p wdt:P31 wd:Q5 .
    ?a schema:about ?p ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?title }`);
  return (r.results?.bindings ?? []).map(b => ({ qid: b.k.value.split('/').pop(), title: b.title.value }));
}

// ---------------------------------------------------------------------------

const kingdoms = await prisma.$queryRaw`SELECT id, name, start_year, end_year FROM kingdoms ORDER BY id`;
// Run against a database seeded from seed.sql alone (move prisma/enrichment-people.sql aside first), so every person here is base data.
const base = await prisma.$queryRaw`SELECT id, name, kingdom_id, start_year, end_year, summary FROM people ORDER BY id`;
const baseIds = new Set(base.map(p => p.id));

const kingdomTitles = Object.entries(KINGDOMS).map(([id, [t]]) => [id, t]);
const kingdomDetails = await articleDetails(kingdomTitles.map(([, t]) => t));
const qidOf = Object.fromEntries(kingdomTitles.map(([id, t]) => {
  return [id, kingdomDetails.get(t)?.qid];
}));
const idOfQid = Object.fromEntries(Object.entries(qidOf).filter(([, q]) => q).map(([id, q]) => [q, id]));

// 1. Candidate rulers: category members plus Wikidata's own list.
const candidates = new Map(); // article title -> kingdom id
for (const [id, [, cats]] of Object.entries(KINGDOMS)) {
  for (const cat of cats) for (const t of await categoryPages(cat)) if (!candidates.has(t)) candidates.set(t, id);
}
for (const row of await wikidataRulers(Object.values(qidOf).filter(Boolean))) {
  if (!candidates.has(row.title)) candidates.set(row.title, idOfQid[row.qid]);
}
console.log(`${candidates.size} candidate articles`);

const details = await articleDetails([...candidates.keys()]);
const facts = await humans([...details.values()].map(d => d.qid).filter(Boolean));

const span = Object.fromEntries(kingdoms.map(k => [k.id, k]));

const needInfobox = [...candidates.keys()].filter(t => {
  const d = details.get(t);
  const f = d?.qid ? facts.get(d.qid) : null;
  return d && f?.human && !datesFromText(d.extract) && !(f.born !== null && f.died !== null);
});
const infobox = await infoboxDates(needInfobox);
const known = new Map(); // squashed name per kingdom -> true, for duplicate checks
for (const p of base) known.set(`${p.kingdom_id}:${squash(p.name)}`, true);
const sameManBase = (kingdomId, name, start) =>
  known.has(`${kingdomId}:${squash(name)}`) ||
  base.some(p => p.kingdom_id === kingdomId && start !== null && p.start_year !== null && Math.abs(p.start_year - start) <= 3 &&
    squash(p.name).slice(0, 5) === squash(name).slice(0, 5));

const usedIds = new Set(baseIds);
const sql = [];
const stats = { added: 0, notHuman: 0, outOfRange: 0, undated: 0, estimated: 0, spread: 0, duplicate: 0, bce: 0 };
const slug = s => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function sourceFor(personId, article) {
  const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(article.title.replace(/ /g, '_')).replace(/%2C/g, ',').replace(/%28/g, '(').replace(/%29/g, ')')}`;
  const id = `wikipedia-person-${personId}`;
  return [
    `INSERT INTO public.sources (id, title, source_type, source_details, url, licence) VALUES (${sqlString(id)}, ${sqlString('Wikipedia: ' + article.title)}, 'digital', ${sqlString(`English Wikipedia, "${article.title}", ${url.replace('https://', '')} (CC BY-SA 4.0). Name and dates, and the opening paragraph lightly trimmed.`)}, ${sqlString(url)}, 'CC BY-SA 4.0')`,
    `INSERT INTO public.information_sources (source_id, note, person_id) VALUES (${sqlString(id)}, 'Name, dates and summary.', ${sqlString(personId)})`,
  ];
}

/** Years for a ruler whose dates no source states, estimated from the article text and bounded by the kingdom's span. */
function estimateDates(extract, k) {
  const lo = Math.max(600, k.start_year ?? 600);
  const hi = Math.min(1700, k.end_year ?? 1700);
  const head = extract.slice(0, 800);
  const stated = [...head.matchAll(/\b(\d{3,4})\b/g)].map(m => Number(m[1])).filter(y => y >= lo - 30 && y <= hi + 30);
  if (stated.length) {
    const start = Math.max(lo, Math.min(...stated));
    return { start, end: Math.max(start, Math.min(hi, Math.max(Math.max(...stated), start + 15))), kind: 'time_as_ruler' };
  }
  const century = head.match(/\b(\d{1,2})(?:st|nd|rd|th)[- ]century\b/i);
  if (century) {
    const first = Math.max(lo, (Number(century[1]) - 1) * 100 + 1);
    const last = Math.min(hi, Number(century[1]) * 100);
    if (first < last) {
      const mid = Math.round((first + last) / 2);
      return { start: Math.max(lo, mid - 10), end: Math.min(hi, mid + 10), kind: 'time_as_ruler' };
    }
  }
  return null;
}

function emitPerson({ d, kingdomId, dates }) {
  const name = title(d.title);
  const k = span[kingdomId];
  const id = `${slug(name)}-${dates.start}-${kingdomId}`;
  if (usedIds.has(id)) { stats.duplicate++; return; }
  usedIds.add(id);
  const role = RULER_WORDS.test(d.description) && d.description.length <= 90 ? d.description.replace(/^./, c => c.toUpperCase()) : `Ruler of ${k.name}`;
  const summary = summaryFrom(d.extract);
  sql.push(
    `INSERT INTO public.people (id, page_name, name, role, kingdom_id, date_kind, summary, start_year, end_year, start_date_type, end_date_type, date_confidence) VALUES (${[
      sqlString(id), sqlString(id), sqlString(name), sqlString(role), sqlString(kingdomId),
      `${sqlString(dates.kind)}::public.person_date_type`, sqlString(summary || null),
      sqlNumber(dates.start), sqlNumber(dates.end), "'about'", "'about'", "'likely'",
    ].join(', ')})`,
    ...sourceFor(id, d),
  );
  stats.added++;
}

const unplaced = new Map(); // kingdom id -> rulers with no usable year, spread over the kingdom's span afterwards
for (const [articleTitle, kingdomId] of candidates) {
  const d = details.get(articleTitle);
  if (!d || !d.qid || !facts.get(d.qid)?.human) { stats.notHuman++; continue; }
  const name = title(d.title);
  const k = span[kingdomId];
  let dates = datesFromText(d.extract);
  if (dates?.bce) { stats.bce++; continue; }
  const f = facts.get(d.qid);
  if (!dates && f.born !== null && f.died !== null && f.born <= f.died) dates = { start: f.born, end: f.died, kind: 'life' };
  if (!dates) dates = infobox.get(articleTitle) ?? null;
  if (dates) {
    if (k.start_year !== null && (dates.end < k.start_year || dates.start > (k.end_year ?? 1700))) { stats.outOfRange++; continue; }
    if (sameManBase(kingdomId, name, dates.start)) { stats.duplicate++; continue; }
    emitPerson({ d, kingdomId, dates });
    continue;
  }
  // No source states this ruler's years. Keep the ruler only when the article ties the person to this kingdom
  // and does not place them before 600 CE, then estimate the years.
  const word = k.name.split(/[ (]/)[0].toLowerCase();
  const head = d.extract.slice(0, 600);
  const ties = word.length >= 4 && (head.toLowerCase().includes(word) || d.description.toLowerCase().includes(word));
  if (!ties || /\b([1-6])(?:st|nd|rd|th)[- ]century\b/i.test(head)) { stats.undated++; continue; }
  if (sameManBase(kingdomId, name, null)) { stats.duplicate++; continue; }
  const estimate = estimateDates(d.extract, k);
  if (estimate) { emitPerson({ d, kingdomId, dates: estimate }); stats.estimated++; }
  else unplaced.set(kingdomId, [...(unplaced.get(kingdomId) ?? []), d]);
}

// Rulers with no clue at all share the stretch of the kingdom's span, in name order, in equal slots.
for (const [kingdomId, list] of unplaced) {
  const k = span[kingdomId];
  const lo = Math.max(600, k.start_year ?? 600);
  const hi = Math.min(1700, k.end_year ?? 1700);
  const slot = (hi - lo) / list.length;
  list.sort((x, y) => x.title.localeCompare(y.title)).forEach((d, i) => {
    const start = Math.round(lo + i * slot);
    emitPerson({
      d, kingdomId,
      dates: { start, end: Math.min(hi, start + Math.min(25, Math.max(5, Math.round(slot)))), kind: 'time_as_ruler' },
    });
    stats.spread++;
  });
}
console.log('new rulers', stats);

// 2. Summaries for people already in the database that have none.
const wanted = base.filter(p => !p.summary);

/** Looks the person up on Wikipedia and returns the SQL that fills the summary, or null when no article clearly matches. */
async function summaryFor(person) {
  const k = span[person.kingdom_id];
  const word = (k?.name ?? '').split(/[ (]/)[0];
  const hits = await wikipedia({ action: 'query', list: 'search', srsearch: `${person.name} ${word}`, srlimit: '4' });
  const titles = (hits.query?.search ?? []).map(h => h.title);
  if (!titles.length) return null;
  const found = [...new Set((await articleDetails(titles)).values())];
  const hf = await humans(found.map(x => x.qid).filter(Boolean));
  const mine = squash(title(person.name)).replace(/(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/, '');
  const best = found.find(x => {
    if (!x.qid || !hf.get(x.qid)?.human) return false;
    const theirs = squash(title(x.title));
    const nameFits = theirs.includes(mine) || mine.includes(theirs);
    const dates = datesFromText(x.extract) ?? (hf.get(x.qid).born !== null ? { start: hf.get(x.qid).born, end: hf.get(x.qid).died ?? hf.get(x.qid).born } : null);
    const timeFits = !dates || person.start_year === null || (dates.end >= person.start_year - 60 && dates.start <= (person.end_year ?? person.start_year) + 60);
    const placeFits = x.extract.toLowerCase().includes(word.toLowerCase()) || x.description.toLowerCase().includes(word.toLowerCase());
    return nameFits && timeFits && (placeFits || (dates && person.start_year !== null));
  });
  const text = best && summaryFrom(best.extract);
  if (!best || !text) return null;
  return [`UPDATE public.people SET summary = ${sqlString(text)} WHERE id = ${sqlString(person.id)}`, ...sourceFor(person.id, best)];
}

// Eight lookups at a time: the connection is slow, and Wikipedia rate-limits faster clients.
let filled = 0;
let failed = 0;
const results = new Array(wanted.length);
let next = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (next < wanted.length) {
    const i = next++;
    try {
      results[i] = await summaryFor(wanted[i]);
    } catch {
      failed++;
      results[i] = null;
    }
    if (results[i]) filled++;
    if ((i + 1) % 50 === 0) { flush(); console.log(`${i + 1}/${wanted.length} looked up`); }
  }
}));
for (const statements of results) if (statements) sql.push(...statements);
console.log(`summaries filled: ${filled} of ${wanted.length} (${failed} lookups failed and were skipped)`);

fs.writeFileSync(new URL('../prisma/enrichment-people.sql', import.meta.url), sql.map(s => s + ';').join('\n') + '\n');
flush();
await prisma.$disconnect();
