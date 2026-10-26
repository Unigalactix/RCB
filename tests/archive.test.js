import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { players } from '../data.js';
import { competitions, snapshots, moments, matchSpotlights, comebackStreak, logoHistory, eraChapters, researchSources, metrics, rankStats, compareStats } from '../archive.js';
import { legendsInfographicData, jerseyEvolutionEras, initialTributeMessages } from '../infographic.js';
import { photos } from '../media.js';
import { photoMarkup, photoCredit, profileStats } from '../hub.js';

test('competition archive covers IPL, WPL and only verified CLT20 participation', () => {
  assert.deepEqual(Object.keys(competitions), ['ipl', 'wpl', 'clt20']);
  assert.equal(competitions.ipl.seasons.length, 19);
  assert.deepEqual(competitions.wpl.seasons.map(item => item.year), [2023, 2024, 2025, 2026]);
  assert.deepEqual(competitions.clt20.seasons.map(item => item.year), [2009, 2010, 2011]);
  assert.equal(competitions.clt20.seasons.at(-1).finish, 'Runners-up');
  for (const league of Object.values(competitions)) {
    assert.ok(league.source.startsWith('https://'));
    assert.ok(league.seasonSource.startsWith('https://'));
    assert.equal(new Set(league.seasons.map(season => season.year)).size, league.seasons.length);
  }
});

test('stat snapshots contain known stars with source-backed numbers or explicit unknowns', () => {
  for (const [league, snapshot] of Object.entries(snapshots)) {
    assert.equal(snapshot.records.length, 7);
    assert.equal(new Set(snapshot.records.map(record => record.playerId)).size, 7);
    for (const record of snapshot.records) {
      const player = players.find(item => item.id === record.playerId);
      assert.ok(player);
      assert.equal(player.team, league === 'ipl' ? 'men' : 'women');
      assert.ok(record.sources.length > 0);
      for (const source of record.sources) assert.ok(source.startsWith('https://'));
      for (const metric of Object.keys(metrics)) {
        assert.ok(Object.hasOwn(record, metric));
        assert.ok(record[metric] === null || (Number.isFinite(record[metric]) && record[metric] >= 0));
      }
    }
  }
  assert.equal(snapshots.ipl.records.find(record => record.playerId === 'virat').runs, 657);
  assert.equal(snapshots.wpl.records.find(record => record.playerId === 'perry').runs, 347);
  assert.equal(snapshots.wpl2026.records.find(record => record.playerId === 'bell').wickets, 12);
  assert.equal(snapshots.ipl.records.find(record => record.playerId === 'rajat').strikeRate, null);
});

test('leaderboards rank each metric correctly without mutating the source or treating null as zero', () => {
  const original = JSON.stringify(snapshots);
  assert.equal(rankStats('ipl', 'runs')[0].playerId, 'virat');
  assert.equal(rankStats('ipl', 'wickets')[0].playerId, 'hazlewood');
  assert.equal(rankStats('ipl', 'strikeRate')[0].playerId, 'jitesh');
  assert.equal(rankStats('wpl', 'runs')[0].playerId, 'perry');
  assert.equal(rankStats('wpl', 'wickets')[0].playerId, 'shreyanka');
  assert.equal(rankStats('ipl', 'runs').at(-1).runs, null);
  assert.equal(JSON.stringify(snapshots), original);
  assert.throws(() => rankStats('clt20', 'runs'), RangeError);
  assert.throws(() => rankStats('ipl', 'invalid'), RangeError);
});

test('comparison enforces one season and handles unknown values without NaN or division by zero', () => {
  const comparison = compareStats('ipl', 'virat', 'salt');
  assert.equal(comparison.rows.find(row => row.key === 'runs').leftWidth, 100);
  assert.equal(comparison.rows.find(row => row.key === 'wickets').a, null);
  assert.equal(comparison.rows.find(row => row.key === 'wickets').leftWidth, 0);
  for (const row of comparison.rows) {
    assert.ok(Number.isFinite(row.leftWidth) && row.leftWidth >= 0 && row.leftWidth <= 100);
    assert.ok(Number.isFinite(row.rightWidth) && row.rightWidth >= 0 && row.rightWidth <= 100);
  }
  assert.throws(() => compareStats('ipl', 'virat', 'perry'), RangeError);
  assert.throws(() => compareStats('ipl', 'virat', 'virat'), RangeError);
});

test('every downloaded photo exists, is bounded in size, and carries complete reusable-license attribution', async () => {
  assert.equal(Object.keys(photos).length, 5);
  const dirFiles = (await readdir(new URL('../assets/photos', import.meta.url))).sort();
  for (const required of ['dravid.jpg', 'green.jpg', 'rcb-logo.png', 'stadium.jpg', 'virat-kohli.png']) {
    assert.ok(dirFiles.includes(required), `Missing ${required}`);
  }
  assert.equal(photos.green.width, 660);
  assert.equal(photos.green.height, 1060);
  assert.match(photos.green.changes, /solo portrait/i);
  for (const [id, photo] of Object.entries(photos)) {
    assert.ok(id === 'stadium' || id === 'logo' || players.some(player => player.id === id));
    for (const key of ['src', 'author', 'source', 'license', 'licenseUrl', 'changes']) assert.ok(photo[key], `${id}: ${key}`);
    assert.match(photo.license, /^(CC BY(?:-SA)? [234]\.0|CC0|Public domain|GODL-India|User-supplied local asset)$/);
    assert.match(photo.source, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.equal(photo.photoType, id === 'stadium' ? 'venue' : id === 'logo' ? 'crest' : 'rcb-kit');
    const file = new URL(`../${photo.src}`, import.meta.url);
    const bytes = await readFile(file);
    assert.ok(bytes.length > 1000);
    assert.ok((await stat(file)).size < 3_000_000);
    assert.ok(Number.isInteger(photo.width) && photo.width > 0);
    assert.ok(Number.isInteger(photo.height) && photo.height > 0);
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
    assert.ok(isJpeg || isPng, `${id} should be a valid JPEG or PNG`);
  }
});

test('photo and profile markup preserve credits, safe attributes, and unknown-stat markers', () => {
  assert.match(photoMarkup('virat', '" onerror="alert(1)'), /alt="&quot; onerror=&quot;alert\(1\)"/);
  assert.match(photoMarkup('virat', 'Virat'), /loading="lazy"/);
  assert.match(photoCredit('dravid'), /CC BY 2\.0/);
  assert.equal(photoMarkup('rajat', 'Rajat'), '');
  assert.match(profileStats('rajat'), /—/);
  assert.match(profileStats('perry'), /WPL 2024/);
  assert.match(profileStats('ab'), /historical/);
});

test('moments have valid photographs, explicit photo context, source links and unique identities', () => {
  assert.equal(moments.length, 9);
  assert.equal(new Set(moments.map(moment => moment.id)).size, moments.length);
  assert.deepEqual([...new Set(moments.map(moment => moment.league))].sort(), ['clt20', 'ipl', 'wpl']);
  for (const moment of moments) {
    assert.ok(photos[moment.photo]);
    assert.ok(moment.source.startsWith('https://'));
    assert.ok(moment.photoContext.includes('not'));
    for (const key of ['title', 'date', 'summary', 'story', 'fact', 'photoAlt', 'linkLabel']) assert.ok(moment[key]);
  }
  assert.ok(researchSources.some(source => source.url === 'https://en.wikipedia.org/wiki/Royal_Challengers_Bengaluru'));
  assert.ok(researchSources.some(source => source.url === 'https://www.iplt20.com/'));
});

test('matchday visuals use sourced historical scorelines and accurately contextualized media', () => {
  assert.deepEqual(matchSpotlights.map(match => match.id), ['ipl-2026-final', 'wpl-2026-final', 'ipl-final', 'wpl-final', 'hyderabad']);
  assert.equal(matchSpotlights[0].rcbScore, '161/5');
  assert.equal(matchSpotlights[0].opponentScore, '155/8');
  assert.equal(matchSpotlights[1].rcbScore, '204/4');
  assert.equal(matchSpotlights[1].opponentScore, '203/4');
  assert.equal(matchSpotlights[2].rcbScore, '190/9');
  assert.equal(matchSpotlights[2].opponentScore, '184/7');
  for (const match of matchSpotlights) {
    assert.ok(photos[match.photo]);
    assert.ok(match.source.startsWith('https://www.iplt20.com/') || match.source.startsWith('https://www.wplt20.com/'));
    assert.ok(match.photoContext.length > 40);
    assert.equal(match.overs.length, 2);
  }
  assert.match(moments.find(moment => moment.id === 'green-2024').story, /Rajat Patidar, not Green, was Player of the Match/);
});

test('2024 IPL 6-match miracle comeback streak covers all six consecutive wins from Hyderabad to the CSK knockout', () => {
  assert.equal(comebackStreak.length, 6);
  assert.deepEqual(comebackStreak.map(item => item.step), ['01', '02', '03', '04', '05', '06']);
  assert.deepEqual(comebackStreak.map(item => item.opponent), ['SRH', 'GT', 'GT', 'PBKS', 'DC', 'CSK']);
  assert.match(comebackStreak[0].result, /35 runs/);
  assert.match(comebackStreak[1].result, /9 wickets/);
  assert.match(comebackStreak[2].result, /4 wickets/);
  assert.match(comebackStreak[3].result, /60 runs/);
  assert.match(comebackStreak[4].result, /47 runs/);
  assert.match(comebackStreak[5].result, /27 runs/);
  assert.match(comebackStreak[5].summary, /Yash Dayal/);
  for (const match of comebackStreak) {
    for (const key of ['id', 'date', 'venue', 'opponentFull', 'rcbScore', 'oppScore', 'potm', 'keyPerformers', 'summary', 'source']) {
      assert.ok(match[key], `${match.id}: ${key}`);
    }
  }
});

test('logo history covers all five RCB crest eras from 2008 to 2026 with individual logo files and six historical eras', async () => {
  assert.equal(logoHistory.length, 5);
  assert.deepEqual(logoHistory.map(item => item.id), ['logo-2008', 'logo-2009-2015', 'logo-2016-2019', 'logo-2020-2023', 'logo-2024-2026']);
  assert.equal(logoHistory.at(-1).bannerText, 'ROYAL CHALLENGERS BENGALURU');
  for (const item of logoHistory) {
    assert.ok(item.src.startsWith('./assets/logos/'));
    const bytes = await readFile(new URL(`../${item.src}`, import.meta.url));
    assert.ok(bytes.length > 1000);
    assert.equal(bytes[0], 0x89);
    assert.equal(bytes[1], 0x50);
  }
  assert.equal(eraChapters.length, 6);
  for (const chapter of eraChapters) {
    assert.ok(chapter.highlights.length >= 2);
  }
});

test('interactive infographic modules cover legends wagon wheels, jersey evolution eras, and tribute wall messages', () => {
  assert.deepEqual(Object.keys(legendsInfographicData), ['virat', 'ab', 'gayle', 'smriti']);
  for (const legend of Object.values(legendsInfographicData)) {
    assert.equal(legend.metrics.length, 4);
    assert.equal(legend.wagonWheel.length, 5);
    assert.ok(legend.badges.length >= 4);
    assert.ok(legend.trivia.length > 30);
  }
  assert.equal(jerseyEvolutionEras.length, 5);
  assert.equal(initialTributeMessages.length, 6);
});

test('official photo and squad destinations open externally without embedding restricted images', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /href="https:\/\/www\.iplt20\.com\/photos"/);
  assert.match(html, /href="https:\/\/www\.iplt20\.com\/teams\/royal-challengers-bengaluru\/squad"/);
  assert.match(html, /href="https:\/\/www\.iplt20\.com\/photos\/royal-challengers-bengaluru-vs-gujarat-titans-final--2026"/);
  assert.doesNotMatch(html, /<img[^>]+src="https:\/\/(?:www\.)?iplt20\.com/);
  assert.ok(researchSources.some(source => source.url === 'https://www.iplt20.com/terms-and-conditions'));
});
