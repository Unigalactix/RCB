import { mkdir, writeFile } from 'node:fs/promises';
import { unzipSync, strFromU8 } from 'fflate';
import { parse } from 'csv-parse/sync';
import { aggregateMatches } from './aggregate-season.js';

const headers = { 'User-Agent': 'RCBForever/1.0 (https://github.com/Unigalactix/RCB; attributed historical cricket data)' };
async function request(url) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(180000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response;
}
const sources = { ipl: 'https://cricsheet.org/downloads/ipl_json.zip', wpl: 'https://cricsheet.org/downloads/wpl_json.zip' };
const registerResponse = await request('https://cricsheet.org/register/people.csv');
const register = new Map(parse(await registerResponse.text(), { columns: true, skip_empty_lines: true }).map(person => [person.identifier, person]));
const archive = {
  fetched: new Date().toISOString().slice(0, 10),
  source: 'https://cricsheet.org/',
  license: 'Open Data Commons Attribution License 1.0',
  licenseUrl: 'https://opendatacommons.org/licenses/by/1-0/',
  methodology: 'Derived from all downloaded RCB match files, not official career totals. Match listings are not official appearances or full registered squads. Super overs excluded. No-result/no-play fixtures may be absent. Balls faced exclude wides; legal bowling balls exclude wides and no-balls; bowling runs exclude byes, leg-byes and penalty extras. Non-bowler dismissals are excluded from wickets. Source names and stable register identifiers retained.',
  competitions: {}
};
for (const [league, source] of Object.entries(sources)) {
  const response = await request(source);
  const files = unzipSync(new Uint8Array(await response.arrayBuffer()));
  const matches = Object.entries(files).filter(([name]) => name.endsWith('.json')).map(([name, contents]) => ({ id: name.replace('.json', ''), match: JSON.parse(strFromU8(contents)) }));
  const seasons = aggregateMatches(matches, league);
  const expectedYears = league === 'ipl' ? Array.from({ length: 19 }, (_, index) => 2008 + index) : [2023, 2024, 2025, 2026];
  for (const year of expectedYears) if (!seasons.some(season => season.year === year)) throw new Error(`Required season missing: ${league} ${year}`);
  for (const season of seasons) {
    for (const player of season.players) {
      const person = register.get(player.id);
      if (person) player.cricinfoId = person.key_cricinfo || null;
    }
    console.log(`${league.toUpperCase()} ${season.year}: ${season.matchIds.length} match files, ${season.players.length} participant records`);
  }
  archive.competitions[league] = { source, seasons };
}
await mkdir('assets/data', { recursive: true });
await writeFile('assets/data/seasons.json', `${JSON.stringify(archive)}\n`);
console.log('Wrote locally bundled seasonal data with source and methodology metadata.');
