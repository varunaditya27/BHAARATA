import assert from 'node:assert/strict';

const base = process.env.BHAARATA_TEST_BASE_URL;
if (!base) throw new Error('Set BHAARATA_TEST_BASE_URL to the test app.');
const tables = ['kingdoms','people','places','events','sources','images','historical_items','item_text_lines','kingdom_borders','routes','kingdom_capitals','event_kingdoms','event_places','route_kingdoms','item_kingdoms','other_names','information_sources'];
async function read(query) {
  const response = await fetch(`${base}/data?${query}`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(!html.includes('The data is unavailable right now'));
  return html;
}
for (const table of tables) {
  const html = await read(new URLSearchParams({list:table}));
  assert.ok(html.includes(`value="${table}" selected`), `selected table: ${table}`);
  assert.ok(html.includes('<table'), `columns: ${table}`);
}
const found = await read(new URLSearchParams({list:'kingdoms',q:'Chola'}));
assert.ok(found.includes('/polities/chola'));
const notFound = await read(new URLSearchParams({list:'kingdoms',q:'not-a-real-kingdom-123'}));
assert.ok(notFound.includes('No entries found.'));
const literalSearch = await read(new URLSearchParams({list:'kingdoms',q:"' OR '1'='1"}));
assert.ok(literalSearch.includes('No entries found.'), 'search did not treat input as text');
const invalidTable = await read(new URLSearchParams({list:'kingdoms;select'}));
assert.ok(invalidTable.includes('value="kingdoms" selected'), 'unknown table was not rejected');
const pageTwo = await read(new URLSearchParams({list:'people',page:'2'}));
assert.ok(pageTwo.includes('Previous'));
for (const path of ['/', '/connections', '/api/atlas-data', '/api/map/sites', '/api/map/monuments']) {
  const response = await fetch(`${base}${path}`);
  assert.equal(response.status, 200, path);
}
console.log(`All ${tables.length} tables, search, paging, connections, and map endpoints passed.`);
