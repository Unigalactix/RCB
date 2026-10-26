import { writeFile, mkdir } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
import { load } from 'cheerio';
import { reportedRosters } from './roster-supplements.js';

const headers = { 'User-Agent': 'RCBForever/1.0 (https://github.com/Unigalactix/RCB; attributed historical squad tables)' };
const rosters = { fetched: new Date().toISOString().slice(0, 10), source: 'https://en.wikipedia.org/', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', note: 'Extracted and transformed historical squad tables, not independently certified final registration lists. Replacements, withdrawals, and retained-player notes are preserved when present. Player statistics come from a separate match-participant dataset.', competitions: { ipl: [], wpl: [], clt20: [] } };

async function parsePage(page, section) {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.search = new URLSearchParams({ action: 'parse', page, prop: 'text|revid', format: 'json', redirects: '1', ...(section ? { section } : {}) });
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(45000) });
  if (!response.ok) throw new Error(`Wikipedia HTTP ${response.status} for ${page}`);
  const data = await response.json();
  if (data.error?.code === 'missingtitle') return null;
  if (data.error) throw new Error(data.error.info);
  return { $: load(data.parse.text['*']), title: data.parse.title, revision: data.parse.revid };
}
function text($, element) {
  const clone = $(element).clone();
  clone.find('sup,.sortkey,.sorttext,.reference').remove();
  return clone.text().replace(/\s+/g, ' ').trim();
}
function extract($) {
  const candidates = [];
  $('table').each((_, table) => {
    const rows = $(table).find('tr').toArray();
    const headerIndex = rows.findIndex(row => {
      const labels = $(row).children('th,td').toArray().map(cell => text($, cell).toLowerCase());
      return labels.some(label => /^(name|player)/.test(label)) && labels.some(label => /^(nat|nationality|country)/.test(label)) && labels.some(label => /batting/.test(label));
    });
    if (headerIndex < 0) return;
    const labels = $(rows[headerIndex]).children('th,td').toArray().map(cell => text($, cell).toLowerCase());
    const nameIndex = labels.findIndex(label => /^(name|player)/.test(label));
    const countryIndex = labels.findIndex(label => /^(nat|nationality|country)/.test(label));
    const battingIndex = labels.findIndex(label => /batting/.test(label));
    const bowlingIndex = labels.findIndex(label => /bowling/.test(label));
    const notesIndex = labels.findIndex(label => /notes/.test(label));
    let group = '';
    const players = [];
    for (const row of rows.slice(headerIndex + 1)) {
      const cells = $(row).children('th,td').toArray();
      if (cells.length === 1) { group = text($, cells[0]); continue; }
      if (cells.length <= Math.max(nameIndex, countryIndex, battingIndex)) continue;
      const name = text($, cells[nameIndex]);
      const country = text($, cells[countryIndex]) || $(cells[countryIndex]).find('img').first().attr('alt') || '';
      if (!name || !country || !/[A-Za-z]/.test(name) || /^(name|total)$/i.test(name)) continue;
      const link = $(cells[nameIndex]).find('a[href^="/wiki/"]').filter((_, item) => !/File:|Category:/.test($(item).attr('href'))).first().attr('href');
      players.push({ name, country, role: group || null, batting: text($, cells[battingIndex]), bowling: bowlingIndex >= 0 ? text($, cells[bowlingIndex]) : null, notes: notesIndex >= 0 && cells[notesIndex] ? text($, cells[notesIndex]) : '', profile: link ? `https://en.wikipedia.org${link}` : null });
    }
    if (players.length >= 11) candidates.push(players);
  });
  return candidates[0] || null;
}
for (const league of ['ipl', 'wpl', 'clt20']) {
  const years = league === 'ipl' ? Array.from({ length: 19 }, (_, i) => 2008 + i) : league === 'wpl' ? [2023, 2024, 2025, 2026] : [2009, 2010, 2011];
  for (const year of years) {
    if (league === 'wpl' && reportedRosters[year]) {
      const supplemental = reportedRosters[year];
      rosters.competitions.wpl.push({ year, ...supplemental, status: 'reported-squad', revision: null });
      console.log(`WPL ${year}: ${supplemental.players.length} factual reported-squad and replacement entries`);
      continue;
    }
    let page;
    let section;
    if (league === 'clt20') {
      page = `${year}_Champions_League_Twenty20_squads`;
      section = year === 2010 ? '5' : '6';
    } else {
      const city = year < (league === 'wpl' ? 2025 : 2024) ? 'Bangalore' : 'Bengaluru';
      page = `${year}_Royal_Challengers_${city}${league === 'wpl' ? '_(WPL)' : ''}_season`;
    }
    const result = await parsePage(page, section);
    const players = result ? extract(result.$) : null;
    if (!players) {
      console.warn(`UNRESOLVED ${league} ${year}: no verified complete squad table in ${page}`);
      rosters.competitions[league].push({ year, players: [], status: 'unresolved', source: `https://en.wikipedia.org/wiki/${page}`, revision: result?.revision || null });
    } else {
      console.log(`${league.toUpperCase()} ${year}: ${players.length} roster entries`);
      rosters.competitions[league].push({ year, players, status: 'source-table', source: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title.replaceAll(' ', '_'))}`, revision: result.revision });
    }
    await setTimeout(400);
  }
}
await mkdir('assets/data', { recursive: true });
await writeFile('assets/data/rosters.json', `${JSON.stringify(rosters)}\n`);
console.log('Saved attributed historical squad tables; unresolved seasons explicitly marked.');
