import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { players, milestones, seasons, questions, filterPlayers, quizVerdict } from '../data.js';

test('players have unique IDs and complete profile data', () => {
  assert.equal(new Set(players.map(player => player.id)).size, players.length);
  for (const player of players) {
    for (const field of ['id', 'name', 'number', 'team', 'role', 'country', 'label', 'accent', 'stat', 'statLabel', 'bio']) assert.ok(player[field], `${player.name}: ${field}`);
    assert.ok(['men', 'women', 'legends'].includes(player.team));
  }
});
test('team filters and case-insensitive searches combine correctly', () => {
  assert.equal(filterPlayers().length, 8);
  assert.equal(filterPlayers('men').length, 3);
  assert.equal(filterPlayers('women').length, 3);
  assert.equal(filterPlayers('legends').length, 2);
  assert.equal(filterPlayers('all', '  VIRAT ').at(0).id, 'virat');
  assert.equal(filterPlayers('women', 'Virat').length, 0);
  assert.equal(filterPlayers('all', '<script>').length, 0);
  assert.equal(filterPlayers('women', 'Australia').at(0).id, 'perry');
});
test('timeline is chronological and contains both championship milestones', () => {
  assert.deepEqual(milestones.map(item => item.year), ['2008', '2009', '2013', '2016', '2024', '2025']);
  assert.match(milestones.at(-1).text, /six runs/);
  assert.match(milestones.at(-2).text, /eight wickets/);
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
test('all local HTML assets exist and internal anchor targets resolve', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(target), `Missing target: ${target}`);
  for (const [, path] of html.matchAll(/(?:src|href)="\.\/([^"]+)"/g)) await readFile(new URL(`../${path}`, import.meta.url));
  assert.doesNotMatch(html, /(?:src|href)="\/(?:assets|styles|app)/);
});
