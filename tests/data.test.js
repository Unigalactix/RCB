import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { players, milestones, seasons, questions, filterPlayers, quizVerdict } from '../data.js';

test('players have unique IDs and complete profile data', () => {
  assert.equal(new Set(players.map(player => player.id)).size, players.length);
  for (const player of players) {
    for (const field of ['id', 'name', 'number', 'team', 'role', 'country', 'label', 'accent', 'stat', 'statLabel', 'socialHandle', 'socialUrl', 'bio']) assert.ok(player[field], `${player.name}: ${field}`);
    assert.ok(player.socialHandle.startsWith('@'));
    assert.ok(player.socialUrl.startsWith('https://'));
    assert.ok(['men', 'women', 'legends'].includes(player.team));
  }
});
test('team filters and case-insensitive searches combine correctly', () => {
  assert.equal(filterPlayers().length, 25);
  assert.equal(filterPlayers('men').length, 7);
  assert.equal(filterPlayers('women').length, 14);
  assert.equal(filterPlayers('legends').length, 4);
  assert.equal(filterPlayers('all', '  VIRAT ').at(0).id, 'virat');
  assert.equal(filterPlayers('women', 'Lauren Bell').at(0).id, 'bell');
  assert.equal(filterPlayers('women', 'Virat').length, 0);
  assert.equal(filterPlayers('all', '<script>').length, 0);
  assert.equal(filterPlayers('women', 'Australia').at(0).id, 'perry');
});
test('timeline is chronological and contains both championship milestones', () => {
  assert.deepEqual(milestones.map(item => item.year), ['2008', '2009', '2011', '2013', '2016', '2024', '2025', '2026']);
  assert.match(milestones.find(item => item.year === '2025').text, /six runs/);
  assert.match(milestones.find(item => item.year === '2024').text, /eight wickets/);
  assert.match(milestones.find(item => item.year === '2011').text, /Champions League/);
});
test('quiz has five valid questions and bounded verdicts', () => {
  assert.equal(questions.length, 5);
  for (const item of questions) {
    assert.equal(item.options.length, 4);
    assert.ok(item.answer >= 0 && item.answer < item.options.length);
    assert.ok(item.explanation.length > 20);
  }
  assert.equal(quizVerdict(5), 'A true-red original.');
  assert.equal(quizVerdict(3), 'Bold at heart.');
  assert.equal(quizVerdict(0), 'Your RCB story starts here.');
  assert.throws(() => quizVerdict(6), RangeError);
  assert.throws(() => quizVerdict(-1), RangeError);
});
test('season archive covers all 18 seasons with correct championship and finals', () => {
  assert.deepEqual(seasons.map(item => item.year), Array.from({ length: 18 }, (_, index) => 2008 + index));
  assert.equal(seasons.filter(item => item.finish === 'Runners-up').length, 3);
  assert.equal(seasons.filter(item => item.finish === 'Champions').length, 1);
  assert.equal(seasons.at(-1).finish, 'Champions');
  for (const season of seasons) assert.ok(season.stage);
});
test('all local HTML assets exist and internal anchor targets resolve across all multi-page HTML files', async () => {
  for (const pageFile of ['index.html', 'squad.html', 'seasons.html', 'history.html', 'moments.html']) {
    const html = await readFile(new URL(`../${pageFile}`, import.meta.url), 'utf8');
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, `Duplicate ID in ${pageFile}`);
    for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(target), `${pageFile} missing target: ${target}`);
    for (const [, path] of html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)) await readFile(new URL(`../${path}`, import.meta.url));
    assert.doesNotMatch(html, /(?:src|href)="\/(?:assets|styles|app)/);
  }
});
