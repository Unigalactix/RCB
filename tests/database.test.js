import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { filterSheetPlayers, filterKeyMoments, filterGrounds } from '../database.js';

const db = JSON.parse(await readFile(new URL('../assets/data/database.json', import.meta.url), 'utf8'));

test('published Google Sheet database contains all 13 sheets with exact row counts', () => {
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
  assert.equal(db.sources.length, 13);
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
