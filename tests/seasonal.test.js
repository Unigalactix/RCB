import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { aggregateMatches } from '../scripts/aggregate-season.js';
import { sortedSeasonPlayers } from '../seasonal.js';
import { teamSeasons, seasonWinRate, highlightVideos } from '../archive.js';

const archive = JSON.parse(await readFile(new URL('../assets/data/seasons.json', import.meta.url), 'utf8'));
test('all 23 IPL/WPL seasons contain sourced stable-identity records and coverage metadata', () => {
  assert.deepEqual(archive.competitions.ipl.seasons.map(s => s.year), Array.from({ length: 19 }, (_, i) => 2008 + i));
  assert.deepEqual(archive.competitions.wpl.seasons.map(s => s.year), [2023, 2024, 2025, 2026]);
  assert.match(archive.license, /Open Data Commons Attribution/);
  for (const competition of Object.values(archive.competitions)) for (const season of competition.seasons) {
    assert.ok(season.players.length >= 11);
    assert.ok(season.matchIds.length > 0);
    assert.equal(new Set(season.matchIds).size, season.matchIds.length);
    assert.equal(new Set(season.players.map(p => p.id)).size, season.players.length);
    for (const player of season.players) {
      assert.ok(player.id && player.name);
      for (const key of ['runs', 'wickets', 'ballsFaced', 'legalBalls', 'matchListings', 'catches', 'stumpings']) assert.ok(Number.isInteger(player[key]) && player[key] >= 0, `${player.name}: ${key}`);
      assert.ok(player.matchListings <= season.matchIds.length);
      assert.equal(player.overs, `${Math.floor(player.legalBalls / 6)}.${player.legalBalls % 6}`);
    }
  }
});

test('downloaded totals reproduce known IPL and WPL season landmarks through 2026', () => {
  const player = (league, year, name) => archive.competitions[league].seasons.find(s => s.year === year).players.find(p => p.name === name);
  assert.equal(player('ipl', 2016, 'V Kohli').runs, 973);
  assert.equal(player('ipl', 2025, 'V Kohli').runs, 657);
  assert.equal(player('ipl', 2025, 'V Kohli').strikeRate, 144.71);
  assert.equal(player('ipl', 2026, 'V Kohli').runs, 675);
  assert.equal(player('ipl', 2026, 'B Kumar').wickets, 28);
  assert.equal(player('wpl', 2024, 'EA Perry').runs, 347);
  assert.equal(player('wpl', 2024, 'SR Patil').wickets, 13);
  assert.equal(player('wpl', 2026, 'S Mandhana').runs, 377);
});

test('aggregation handles extras, run outs, bench-listed participants, and excludes super overs', () => {
  const match = {
    info: { teams: ['Royal Challengers Bangalore', 'Opponent'], dates: ['2020-04-01'], gender: 'male', players: { 'Royal Challengers Bangalore': ['A', 'B', 'C'], Opponent: ['X', 'Y'] }, registry: { people: { A: 'a', B: 'b', C: 'c', X: 'x', Y: 'y' } } },
    innings: [
      { team: 'Royal Challengers Bangalore', overs: [{ deliveries: [
        { batter: 'A', non_striker: 'B', bowler: 'X', runs: { batter: 4, total: 4 } },
        { batter: 'A', non_striker: 'B', bowler: 'X', runs: { batter: 0, total: 1 }, extras: { wides: 1 } },
        { batter: 'A', non_striker: 'B', bowler: 'X', runs: { batter: 6, total: 7 }, extras: { noballs: 1 } },
        { batter: 'A', non_striker: 'B', bowler: 'X', runs: { batter: 4, total: 4, non_boundary: true }, wickets: [{ kind: 'run out', player_out: 'B' }] }
      ] }] },
      { team: 'Opponent', overs: [{ deliveries: [
        { batter: 'X', non_striker: 'Y', bowler: 'A', runs: { batter: 0, total: 4 }, extras: { legbyes: 4 } },
        { batter: 'X', non_striker: 'Y', bowler: 'A', runs: { batter: 0, total: 1 }, extras: { wides: 1 } },
        { batter: 'X', non_striker: 'Y', bowler: 'A', runs: { batter: 0, total: 0 }, wickets: [{ kind: 'run out', player_out: 'Y', fielders: [{ name: 'B' }] }] },
        { batter: 'X', non_striker: 'Y', bowler: 'A', runs: { batter: 0, total: 0 }, wickets: [{ kind: 'caught', player_out: 'X', fielders: [{ name: 'C' }] }] }
      ] }] },
      { team: 'Royal Challengers Bangalore', super_over: true, overs: [{ deliveries: [{ batter: 'A', non_striker: 'B', bowler: 'X', runs: { batter: 6, total: 6 } }] }] }
    ]
  };
  const season = aggregateMatches([{ id: 'test', match }], 'ipl')[0];
  const a = season.players.find(p => p.id === 'a');
  const b = season.players.find(p => p.id === 'b');
  const c = season.players.find(p => p.id === 'c');
  assert.equal(a.runs, 14);
  assert.equal(a.ballsFaced, 3);
  assert.equal(a.fours, 1);
  assert.equal(a.sixes, 1);
  assert.equal(a.legalBalls, 3);
  assert.equal(a.conceded, 1);
  assert.equal(a.wickets, 1);
  assert.equal(b.dismissals, 1);
  assert.equal(c.battingInnings, 0);
  assert.equal(c.matchListings, 1);
  assert.equal(c.catches, 1);
});

test('season player search and sorting retain source records and place undefined rates last', () => {
  const records = archive.competitions.wpl.seasons.find(s => s.year === 2026).players;
  const original = JSON.stringify(records);
  assert.equal(sortedSeasonPlayers(records, 'runs')[0].name, 'S Mandhana');
  assert.equal(sortedSeasonPlayers(records, 'runs', '  MANDHANA ')[0].runs, 377);
  assert.equal(sortedSeasonPlayers(records, 'name', '<script>').length, 0);
  assert.equal(JSON.stringify(records), original);
});

test('19 team records reconcile wins, losses and no-results with valid win rates', () => {
  assert.equal(teamSeasons.length, 19);
  for (const season of teamSeasons) {
    assert.equal(season.won + season.lost + season.noResult, season.played, `${season.year}`);
    assert.ok(seasonWinRate(season) >= 0 && seasonWinRate(season) <= 100);
  }
  assert.equal(seasonWinRate(teamSeasons.find(s => s.year === 2025)), 73.3);
});

test('watchlist links are official, unique and explicitly distinguish video categories', () => {
  assert.equal(highlightVideos.length, 9);
  assert.equal(new Set(highlightVideos.map(video => video.id)).size, 9);
  assert.ok(highlightVideos.some(video => video.league === 'wpl'));
  for (const video of highlightVideos) assert.match(video.source, /^https:\/\/www\.(?:ipl|wpl)t20\.com\/videos\//);
});

test('registered rosters are separate attributed source extracts with explicit unresolved coverage', async () => {
  const rosters = JSON.parse(await readFile(new URL('../assets/data/rosters.json', import.meta.url), 'utf8'));
  assert.equal(rosters.competitions.ipl.length, 19);
  assert.equal(rosters.competitions.wpl.length, 4);
  assert.equal(rosters.competitions.clt20.length, 3);
  assert.equal(rosters.license, 'CC BY-SA 4.0');
  let resolved = 0;
  for (const competition of Object.values(rosters.competitions)) for (const season of competition) {
    assert.match(season.source, /^https:\/\//);
    if (['source-table', 'reported-squad'].includes(season.status)) {
      resolved++;
      assert.ok(season.players.length >= 11);
      for (const player of season.players) {
        assert.ok(player.name);
        if (season.status === 'source-table') assert.ok(player.country && player.batting);
      }
    } else {
      assert.equal(season.status, 'unresolved');
      assert.deepEqual(season.players, []);
    }
  }
  assert.equal(resolved, 25);
  assert.equal(rosters.competitions.clt20.find(season => season.year === 2011).players.length, 15);
  const currentWomen = rosters.competitions.wpl.find(season => season.year === 2026);
  assert.match(currentWomen.players.find(player => player.name === 'Ellyse Perry').notes, /Withdrew/);
  assert.ok(currentWomen.players.some(player => player.name === 'Sayali Satghare'));
});

test('2026 championships and official WPL destinations are first-class static content', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /id="champions"/);
  assert.match(html, /RCB 161\/5/);
  assert.match(html, /RCB 204\/4/);
  assert.match(html, /data-match="ipl-2026-final" aria-pressed="true"/);
  assert.match(html, /https:\/\/www\.wplt20\.com\/teams\/royal-challengers-bengaluru/);
  assert.match(html, /href="#season-stats"/);
});

test('original-resolution display media is HD while solo portraits are explicitly measured', async () => {
  const { photos } = await import('../media.js');
  assert.ok(photos.green.width >= 600 && photos.green.height >= 1000);
  assert.ok(photos.dravid.width >= 700 && photos.dravid.height >= 900);
  assert.equal(photos.logo.width, 267);
  assert.equal(photos.logo.height, 373);
  assert.ok(photos.stadium.width >= 2000);
  assert.equal(photos.virat.src, './assets/photos/virat-kohli.png');
  assert.equal(photos.virat.width, 612);
});
