import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { filterSheetPlayers, filterKeyMoments, filterGrounds, filterCoaches, filterSheetEntries, coachMarkup, sheetEntriesMarkup } from '../database.js';

const db = JSON.parse(await readFile(new URL('../assets/data/database.json', import.meta.url), 'utf8'));

test('published Google Sheet database contains all 16 sheets with exact row counts', () => {
  assert.equal(db.counts.sheets, 16);
  assert.equal(db.sheets.length, 16);
  assert.ok(Number.isFinite(Date.parse(db.fetchedAt)));
  assert.equal(db.counts.coaches, 51);
  assert.equal(db.counts.franchise, 27);
  assert.equal(db.counts.rcbCares, 37);
  assert.equal(db.counts.players, 223);
  assert.equal(db.counts.iplPlayers, 179);
  assert.equal(db.counts.wplPlayers, 43);
  assert.equal(db.counts.clt20OnlyPlayers, 1);
  assert.equal(db.counts.starPlayers, 40);
  assert.equal(db.counts.iplStars, 25);
  assert.equal(db.counts.wplStars, 15);
  assert.equal(db.counts.keyMoments, 45);
  assert.equal(db.counts.grounds, 31);
  assert.equal(db.counts.logos, 4);
  assert.equal(db.counts.allTeams, 20);
  assert.equal(db.counts.seasons, 23);
  assert.equal(db.counts.captains, 10);
  assert.equal(db.counts.records, 23);
  assert.equal(db.counts.squadOnly, 21);
  assert.equal(db.websiteGuide.length, 10);
  assert.equal(db.sources.length, 16);
});

test('new sheets retain every role, source row, qualification and reporting note', () => {
  for (const key of ['coaches', 'franchise', 'rcbCares']) {
    assert.equal(db[key].length, db.counts[key]);
    assert.equal(new Set(db[key].map(row => row.id)).size, db[key].length);
    assert.deepEqual(db[key].map(row => row.sourceRow), Array.from({ length: db[key].length }, (_, i) => i + 2));
    const sheet = db.sheets.find(tab => tab.key === key);
    assert.ok(sheet);
    assert.equal(sheet.rows, db[key].length);
    assert.equal(new URL(sheet.url).searchParams.get('gid'), sheet.gid);
  }
  assert.equal(db.coaches.filter(coach => coach.name === 'Venkatesh Prasad').length, 2);
  assert.ok(db.coaches.some(coach => coach.name === 'Anya Shrubsole' && coach.league === 'WPL'));
  assert.match(db.franchise.find(entry => entry.item.includes('2026 sale')).details, /pending formal completion/);
  assert.match(db.franchise.find(entry => entry.item === 'Carbon-neutral claim').details, /no independent certification/);
  assert.match(db.rcbCares.find(entry => entry.item.startsWith('Case status')).details, /No trial outcome/);
  assert.match(db.rcbCares.find(entry => entry.item.startsWith('Divyanshi')).details, /age as 14.*13/);
  assert.equal(db.rcbCares.filter(entry => entry.item.startsWith('Commitment ')).length, 6);
});

test('coaching and topic searches combine filters, include shared roles and do not mutate input', () => {
  const original = JSON.stringify(db.coaches);
  assert.ok(filterCoaches(db.coaches, { league: 'WPL', query: 'Mo Bobat' }).length);
  assert.equal(filterCoaches(db.coaches, { league: 'IPL', role: 'Head Coach', query: 'Anya' }).length, 0);
  assert.deepEqual(filterCoaches(db.coaches, { league: 'WPL', role: 'Bowling Coach', query: ' ANYA ' }).map(coach => coach.name), ['Sunetra Paranjape', 'Anya Shrubsole']);
  assert.equal(JSON.stringify(db.coaches), original);
  const commitments = filterSheetEntries(db.rcbCares, { section: 'RCB CARES', query: 'Commitment ' });
  assert.equal(commitments.length, 7);
  assert.equal(commitments.filter(entry => entry.item.startsWith('Commitment ')).length, 6);
  assert.equal(filterSheetEntries(db.franchise, { section: 'OWNERSHIP', query: '16,660' }).length, 1);
  assert.equal(filterSheetEntries(db.franchise, { query: '<no result>' }).length, 0);
});

test('new section markup exposes full details, safe text and source links', () => {
  const coach = { ...db.coaches[0], name: '<img src=x onerror=alert(1)>', afterRcb: '" & <later>' };
  const html = coachMarkup(coach, db.sheets.find(tab => tab.key === 'coaches').url);
  assert.match(html, /&lt;img/);
  assert.match(html, /&quot; &amp; &lt;later&gt;/);
  assert.match(html, /row 2/);
  assert.ok(html.includes(coach.tenure));
  const stories = sheetEntriesMarkup([{ id: 'test', sourceRow: 2, section: 'Care', item: '<title>', details: '<script>no</script>' }], db.spreadsheetUrl);
  assert.match(stories, /&lt;script&gt;no&lt;\/script&gt;/);
  assert.doesNotMatch(stories, /<script>/);
  assert.match(stories, /<details class="sheet-story"/);
});

test('all 223 players have required fields, photo credits, and Nayan Doshi as the sole CLT20-only player', () => {
  assert.equal(db.players.length, 223);
  const clt20Only = db.players.filter(p => p.league === 'CLT20');
  assert.equal(clt20Only.length, 1);
  assert.equal(clt20Only[0].name, 'Nayan Doshi');
  for (const player of db.players) {
    assert.ok(player.name);
    assert.ok(['IPL', 'WPL', 'CLT20'].includes(player.league));
    assert.ok(player.country);
    assert.ok(player.role);
    assert.ok(player.photoUrl.startsWith('http'));
    assert.ok(player.photoCredit);
  }
});

test('player, moment, and ground filters sort and filter accurately', () => {
  const defaultSorted = filterSheetPlayers(db.players);
  assert.equal(defaultSorted[0].name, 'Virat Kohli');
  assert.equal(defaultSorted[0].matches, 267);

  const topRuns = filterSheetPlayers(db.players, { sortBy: 'runs' });
  assert.equal(topRuns[0].name, 'Virat Kohli');
  assert.equal(topRuns[0].runs, 8428);

  const topWickets = filterSheetPlayers(db.players, { sortBy: 'wickets' });
  assert.equal(topWickets[0].name, 'Yuzvendra Chahal');
  assert.equal(topWickets[0].wickets, 139);

  const wplOnly = filterSheetPlayers(db.players, { league: 'WPL' });
  assert.equal(wplOnly.length, 43);

  const titleMoments = filterKeyMoments(db.keyMoments, { category: 'TITLE' });
  assert.equal(titleMoments.length, 4);

  const saGrounds = filterGrounds(db.grounds, { country: 'South Africa' });
  assert.equal(saGrounds.length, 6);
});

test('grounds and key moments maintain bidirectional links and clean titles', () => {
  const chinnaswamy = db.grounds.find(g => g.name === 'M. Chinnaswamy Stadium');
  assert.ok(chinnaswamy);
  assert.ok(chinnaswamy.linkedMomentIds.length >= 8);

  const kohli9000 = db.keyMoments.find(m => m.title === 'Kohli Crosses 9,000 IPL Runs');
  assert.ok(kohli9000);
  assert.doesNotMatch(kohli9000.description, /^000 IPL Runs/);

  const wpl2026Final = db.keyMoments.find(m => m.title === 'The Record Final - 204 Chased, Second WPL Crown');
  assert.ok(wpl2026Final);
  assert.doesNotMatch(wpl2026Final.description, /^Second WPL Crown/);
});
