import test from 'node:test';
import assert from 'node:assert/strict';
import { discoverTabs, parseSheetRows, fetchRawTabs, buildDatabase, TABS, PUBHTML_URL } from '../scripts/import-sheet.js';

const manifest = (tabs = TABS, offset = 100) => tabs.map((tab, index) =>
  `items.push({name: ${JSON.stringify(tab.name).replace(/&/g, '\\x26')}, pageUrl: "unused", gid: "${offset + index}"});`).join('\n');
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const table = (tab, values = tab.headers.map(() => 'Value')) => `<table class="waffle"><tbody>${
  [tab.headers, values].map(row => `<tr><th>row</th>${row.map(value => `<td>${escape(value)}</td>`).join('')}</tr>`).join('')
}</tbody></table>`;

test('discovers current gids and escaped names instead of relying on saved tab IDs', () => {
  const tabs = discoverTabs(manifest(TABS, 9000));
  assert.equal(tabs.length, 16);
  assert.deepEqual(tabs[5], { name: 'All Teams (IPL & WPL)', gid: '9005' });
  assert.equal(tabs.find(tab => tab.name === 'Coaches').gid, '9009');
  assert.throws(() => discoverTabs('<html>Unavailable</html>'), /No published sheet tabs/);
  assert.throws(() => discoverTabs(manifest(TABS.slice(0, -1))), /Missing published sheet/);
  assert.throws(() => discoverTabs(manifest([...TABS, { name: 'New data' }])), /New sheet requires an import mapping/);
  assert.throws(() => discoverTabs(manifest([...TABS, TABS[0]])), /Duplicate published sheet names/);
});

test('validates columns and preserves commas, ampersands, blank cells and uncertainty text', () => {
  const tab = TABS.find(tab => tab.key === 'franchise');
  const values = ['OWNERSHIP', 'Sale, 2026', 'Pending & unverified'];
  assert.deepEqual(parseSheetRows(table(tab, values), tab)[1].map(cell => cell.text), values);
  assert.equal(parseSheetRows(table(tab, ['A', 'B', '']), tab)[1][2].text, '');
  assert.throws(() => parseSheetRows(table({ ...tab, headers: ['Wrong', 'Item', 'Details'] }), tab), /Unexpected columns/);
  assert.throws(() => parseSheetRows(table(tab, ['Only one']), tab), /Unexpected cell count/);
  assert.throws(() => parseSheetRows('<html>Sign in</html>', tab), /Unexpected columns/);
});

test('fetches every current sheet on each refresh and refuses an incomplete response', async () => {
  const calls = [];
  let round = 100;
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    if (url === PUBHTML_URL) return new Response(manifest(TABS, round));
    const index = Number(new URL(url).searchParams.get('gid')) - round;
    return new Response(table(TABS[index]));
  };
  const first = await fetchRawTabs(fetcher);
  round = 500;
  const second = await fetchRawTabs(fetcher);
  assert.equal(calls.length, 34);
  assert.ok(calls.every(call => call.options.cache === 'no-store' && call.options.signal));
  assert.equal(first.sheets[0].gid, '100');
  assert.equal(second.sheets[0].gid, '500');
  assert.equal(second.sheets.find(tab => tab.key === 'coaches').rows, 1);
  await assert.rejects(fetchRawTabs(async url =>
    url === PUBHTML_URL ? new Response(manifest()) : new Response('Unavailable', { status: 503 })
  ), /HTTP 503/);
});

test('transformation preserves new-sheet fields verbatim without deduplicating people or fetching photos', () => {
  const raw = Object.fromEntries(TABS.map(tab => [tab.name, parseSheetRows(table(tab), tab)]));
  const cells = values => values.map(text => ({ text, img: '' }));
  const coach = ['Photo', 'Same Person', 'IPL & WPL', 'Mentor', '2024 (unverified)', 'India', 'Background & context', 'At RCB', 'Still RCB'];
  raw.Coaches = [raw.Coaches[0], cells(coach), cells(coach.map((value, i) => i === 3 ? 'Head Coach' : value))];
  raw.Coaches[1][0].img = 'https://docs.google.com/sheets-images-rt/temporary';
  raw['Franchise & More'] = [raw['Franchise & More'][0], cells(['OWNERSHIP', 'Sale, 2026', 'Pending; no confirmation.'])];
  raw['4 June 2025 & RCB Cares'] = [raw['4 June 2025 & RCB Cares'][0], cells(['REMEMBRANCE', 'A name', 'Differing ages: 13 and 14.'])];
  const sheets = TABS.map(tab => ({ key: tab.key, name: tab.name, gid: '123', url: PUBHTML_URL, rows: raw[tab.name].length - 1 }));
  const db = buildDatabase(raw, { sheets, fetchedAt: '2026-10-26T12:00:00.000Z' });
  assert.equal(db.coaches.length, 2);
  assert.notEqual(db.coaches[0].id, db.coaches[1].id);
  assert.equal(db.coaches[0].tenure, coach[4]);
  assert.equal(db.coaches[0].background, coach[6]);
  assert.equal(db.coaches[0].achievements, coach[7]);
  assert.equal(db.coaches[0].afterRcb, coach[8]);
  assert.equal(db.franchise[0].details, 'Pending; no confirmation.');
  assert.equal(db.rcbCares[0].details, 'Differing ages: 13 and 14.');
  assert.equal(db.generatedAt, '2026-10-26');
  assert.doesNotMatch(JSON.stringify(db), /sheets-images-rt/);
});
