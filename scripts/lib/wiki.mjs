import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const UA = { 'User-Agent': 'BHAARATA-atlas-importer/0.1 (educational atlas project)' };
const cacheFile = path.join(process.env.BH_CACHE || os.tmpdir(), 'bhaarata-wiki-cache.json');
const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')) : {};
let unsaved = 0;
const sleep = ms => new Promise(r => setTimeout(r, ms));

/** GET a JSON API with a polite pause, retries, and an on-disk cache so a crashed run resumes where it stopped. */
async function getJson(url) {
  if (cache[url]) return cache[url];
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      await sleep(250);
      const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30000) });
      const body = await res.json();
      // An error body (rate limit, lag) is parseable JSON, but it is not an answer and must not be remembered.
      if (body.error) throw new Error(body.error.info ?? 'API error');
      cache[url] = body;
      if (++unsaved >= 20) flush();
      return body;
    } catch {
      await sleep(2000 * (attempt + 1));
    }
  }
  throw new Error(`Gave up on ${url}`);
}

export function flush() {
  fs.writeFileSync(cacheFile, JSON.stringify(cache));
  unsaved = 0;
}

export const wikipedia = params =>
  getJson('https://en.wikipedia.org/w/api.php?' + new URLSearchParams({ format: 'json', ...params }));
export const wikidata = params =>
  getJson('https://www.wikidata.org/w/api.php?' + new URLSearchParams({ format: 'json', ...params }));
export const sparql = query =>
  getJson('https://query.wikidata.org/sparql?' + new URLSearchParams({ format: 'json', query }));

export const chunk = (list, size) => Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, i * size + size));

/** Lower-case, accent-free, letters only: "Rājarāja I" and "Rajaraja I" compare equal. */
export const squash = text => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]/g, '');

export const sqlString = value => (value === null || value === undefined ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`);
export const sqlNumber = value => (value === null || value === undefined ? 'NULL' : String(value));
