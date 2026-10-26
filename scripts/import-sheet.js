import * as cheerio from 'cheerio';
import { mkdir, writeFile, rename } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const PUBHTML_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSf6EXr6CO83TubMGwoONrNvYeoCVID6GYhCC_Buwbe13zg2CbhRZMpYED4noPT5C80gK7UkBup7EmE/pubhtml';
const SHEET_BASE = `${PUBHTML_URL}/sheet?headers=false&gid=`;

export const TABS = [
  { key: 'cover', name: 'Cover', headers: ['ROYAL CHALLENGERS BENGALURU - FAN TRIBUTE DATABASE'] },
  { key: 'players', name: 'Players', headers: ['Photo', 'Player', 'League', 'Country', 'Role', 'Seasons at RCB', 'RCB Matches', 'RCB Runs', 'RCB Wickets', 'Current Status', 'Status Detail / Notes', 'Photo URL (full size)', 'Photo Source / Credit', 'Photo Search (if no photo yet)', 'Star Player?'] },
  { key: 'keyMoments', name: 'Key Moments', headers: ['Photo', 'Year', 'Date', 'League', 'Category', 'Moment', 'Description / Score', 'Key Players', 'Photo URL (full size)', 'Photo Source / Credit', 'Photo Search'] },
  { key: 'grounds', name: 'Grounds', headers: ['Photo', 'Ground', 'City', 'Country', 'Type', 'Capacity (approx)', 'League(s)', 'RCB Story at this Ground', 'Linked Key Moments (see Key Moments sheet)', 'Photo URL (full size)', 'Photo Source / Credit'] },
  { key: 'logos', name: 'Logos', headers: ['Logo', 'Era', 'Years Used', 'Team Name', 'Description', 'Colours', 'Key Change', 'Image Source'] },
  { key: 'allTeams', name: 'All Teams (IPL & WPL)', headers: ['Logo', 'League', 'Team', 'City', 'Seasons Active', 'Status', 'Home Ground', 'Owner', 'Titles', 'Runners-up / Best Finish', 'Captain (2026 or final)', 'Head Coach (2026 or final)', 'Name History', 'Logo History', 'Notes'] },
  { key: 'starPlayers', name: 'Star Players', headers: ['Photo', 'Rank', 'League', 'Player', 'Country', 'Era', 'Why a Star', 'Signature Moment / Stat'] },
  { key: 'seasons', name: 'Seasons', headers: ['League', 'Season', 'Captain', 'Head Coach', 'Finish', 'Highlight'] },
  { key: 'captains', name: 'Captains', headers: ['League', 'Captain', 'Country', 'Seasons', 'Notes'] },
  { key: 'coaches', name: 'Coaches', headers: ['Photo', 'Name', 'League', 'Role', 'Tenure', 'Country', 'Background', 'At RCB / Achievements', 'After RCB'] },
  { key: 'records', name: 'Records', headers: ['League', 'Record', 'Holder / Team', 'Value', 'Season / Date', 'Note'] },
  { key: 'squadOnly', name: 'Squad Only (Never Played)', headers: ['Player', 'League', 'Country', 'Role', 'Seasons in Squad', 'Note'] },
  { key: 'franchise', name: 'Franchise & More', headers: ['Section', 'Item', 'Details'] },
  { key: 'rcbCares', name: '4 June 2025 & RCB Cares', headers: ['Section', 'Item', 'Details'] },
  { key: 'websiteGuide', name: 'Website Guide', headers: ['Sheet -> Website page', 'How to use it'] },
  { key: 'sources', name: 'Sources', headers: ['What', 'Source'] }
];

const slugify = value =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toNumOrNull = value => {
  const cleaned = String(value ?? '').replace(/,/g, '').trim();
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
};

function classifyStatus(statusText) {
  const s = String(statusText || '').toLowerCase();
  if (s.includes('still rcb') || s.startsWith('rcb (')) return 'Still RCB (2026)';
  if (s.includes('retired')) return 'Retired';
  if (s.includes('moved') || s.includes('active') || s.includes('former rcb') || s.includes('no ipl team')) return 'Moved / Former RCB';
  return 'Other';
}

function classifyRoleGroup(roleText) {
  const r = String(roleText || '').toLowerCase();
  if (r.includes('wicket-keeper') || r.includes('wicketkeeper')) return 'Wicket-keeper';
  if (r.includes('all-rounder') || r.includes('allrounder')) return 'All-rounder';
  if (r.includes('bowler')) return 'Bowler';
  if (r.includes('batter') || r.includes('batsman')) return 'Batter';
  return 'All-rounder';
}

export function discoverTabs(html) {
  const decode = value => JSON.parse(`"${value.replace(/\\x([0-9a-f]{2})/gi, '\\u00$1')}"`);
  const tabs = [...html.matchAll(/items\.push\(\{name:\s*"((?:\\.|[^"\\])*)",\s*pageUrl:\s*"((?:\\.|[^"\\])*)",\s*gid:\s*"(\d+)"/g)]
    .map(match => ({ name: decode(match[1]), gid: match[3] }));
  if (!tabs.length) throw new Error('No published sheet tabs found; the workbook may be unavailable.');
  if (new Set(tabs.map(tab => tab.name)).size !== tabs.length) throw new Error('Duplicate published sheet names.');
  for (const tab of TABS) {
    if (!tabs.some(item => item.name === tab.name)) throw new Error(`Missing published sheet: ${tab.name}`);
  }
  for (const tab of tabs) {
    if (!TABS.some(item => item.name === tab.name)) throw new Error(`New sheet requires an import mapping: ${tab.name}`);
  }
  return tabs;
}

export function parseSheetRows(html, tab) {
  const $ = cheerio.load(html);
  const rows = [];
  $('table.waffle tbody tr').each((_, tr) => {
    const cells = $(tr).find('td').toArray().map(td => ({
      text: $(td).text().trim(), img: $(td).find('img').attr('src') || ''
    }));
    if (cells.some(cell => cell.text || cell.img)) rows.push(cells);
  });
  if (JSON.stringify(rows[0]?.map(cell => cell.text)) !== JSON.stringify(tab.headers)) {
    throw new Error(`Unexpected columns in ${tab.name}; review the published schema before importing.`);
  }
  if (rows.length < 2) throw new Error(`No records found in ${tab.name}.`);
  for (const [index, row] of rows.entries()) {
    if (row.length !== tab.headers.length) {
      throw new Error(`Unexpected cell count in ${tab.name}, row ${index + 1}.`);
    }
  }
  return rows;
}

export async function fetchRawTabs(fetcher = fetch) {
  const getHtml = async (url, name) => {
    const response = await fetcher(url, { cache: 'no-store', signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Failed to fetch ${name}: HTTP ${response.status}`);
    return response.text();
  };
  const tabs = discoverTabs(await getHtml(PUBHTML_URL, 'workbook'));
  const raw = {};
  const sheets = [];
  for (const published of tabs) {
    const tab = TABS.find(item => item.name === published.name);
    const url = SHEET_BASE + published.gid;
    raw[tab.name] = parseSheetRows(await getHtml(url, tab.name), tab);
    sheets.push({ key: tab.key, name: tab.name, gid: published.gid, url, rows: raw[tab.name].length - 1 });
  }
  return { raw, sheets };
}

export function buildDatabase(raw, { sheets, fetchedAt }) {

// 1. Cover
const coverLines = raw['Cover'].map(r => r.map(c => c.text).filter(Boolean).join(' — ')).filter(Boolean);

// 2. Website Guide
const websiteGuide = raw['Website Guide'].slice(1).map(r => ({
  section: r[0]?.text || '',
  instruction: r[1]?.text || ''
})).filter(x => x.section);

// 3. Sources
const sources = raw['Sources'].slice(1).map(r => ({
  topic: r[0]?.text || '',
  source: r[1]?.text || ''
})).filter(x => x.topic);

// 4. Star Players (40 rows: 25 IPL + 15 WPL)
const starPlayers = raw['Star Players'].slice(1).map(r => {
  const embeddedImg = r[0]?.img || '';
  const rank = Number(r[1]?.text || 0);
  const league = r[2]?.text || '';
  const name = r[3]?.text || '';
  const country = r[4]?.text || '';
  const era = r[5]?.text || '';
  let whyStar = r[6]?.text || '';
  let signatureMoment = r[7]?.text || '';

  // Repair the 5 known unquoted-comma cell splits from the source sheet
  if (name === 'Virat Kohli' && signatureMoment === 'all-time IPL top run-scorer') {
    whyStar = 'The King and the soul of RCB - one club since 2008, all-time IPL top run-scorer';
    signatureMoment = '973 runs in 2016 (4 centuries); 9,336+ career IPL runs; 75* POTM in 2026 Final';
  } else if (name === 'Faf du Plessis' && signatureMoment.endsWith('; 1')) {
    signatureMoment = 'Captain 2022-2024; 1,636 RCB runs across 45 matches';
  } else if (name === 'Glenn Maxwell' && signatureMoment === '1') {
    signatureMoment = '1,266 RCB runs & 18 wickets (513 runs in 2021 playoff campaign)';
  } else if (name === 'Bhuvneshwar Kumar' && signatureMoment.startsWith('finally played')) {
    whyStar = 'The veteran swing king of the title era - signed in 2009, finally played (and won) in 2025';
    signatureMoment = 'Key powerplay & death-overs leader in the 2025 & 2026 IPL title wins';
  } else if (name === 'Smriti Mandhana' && signatureMoment.endsWith('; 1')) {
    signatureMoment = '87 off 41 in the 2026 final; Orange Cap 2026 (377 runs); 1,023 career WPL runs';
  }

  return {
    id: slugify(name),
    rank,
    league,
    name,
    country,
    era,
    whyStar,
    signatureMoment
  };
});

// 5. Players (223 rows: 179 IPL + 43 WPL + 1 CLT20)
const localPhotoOverrides = {
  'virat-kohli': './assets/photos/virat-kohli.png',
  'cameron-green': './assets/photos/green.jpg',
  'rahul-dravid': './assets/photos/dravid.jpg'
};

const players = raw['Players'].slice(1).map((r, idx) => {
  const embeddedImg = r[0]?.img || '';
  const name = r[1]?.text || '';
  const id = slugify(name);
  const league = r[2]?.text || '';
  const country = r[3]?.text || '';
  const role = r[4]?.text || '';
  const seasons = r[5]?.text || '';
  const matches = toNumOrNull(r[6]?.text);
  const runs = toNumOrNull(r[7]?.text);
  const wickets = toNumOrNull(r[8]?.text);
  const status = r[9]?.text || '';
  const statusDetail = r[10]?.text || '';
  const photoUrl = r[11]?.text || '';
  const photoCredit = r[12]?.text || '';
  const photoSearch = r[13]?.text || '';
  const isStar = r[14]?.text === 'STAR';
  const starEntry = starPlayers.find(s => s.name.toLowerCase() === name.toLowerCase() || (s.name.includes(name) && league === s.league));

  return {
    index: idx + 1,
    id,
    name,
    league,
    country,
    role,
    roleGroup: classifyRoleGroup(role),
    seasons,
    matches,
    runs,
    wickets,
    status,
    statusGroup: classifyStatus(status),
    statusDetail,
    photoUrl,
    localPhoto: localPhotoOverrides[id] || null,
    photoCredit: photoCredit || 'Public cricket archive',
    photoSearch,
    isStar: isStar || Boolean(starEntry),
    starRank: starEntry ? starEntry.rank : null,
    whyStar: starEntry ? starEntry.whyStar : null,
    signatureMoment: starEntry ? starEntry.signatureMoment : null
  };
});

// Enrich starPlayers with player stats & photoUrl
for (const sp of starPlayers) {
  const match = players.find(p => p.name.toLowerCase() === sp.name.toLowerCase()) ||
    players.find(p => sp.name.toLowerCase().includes(p.name.toLowerCase()));
  if (match) {
    sp.playerId = match.id;
    sp.role = match.role;
    sp.matches = match.matches;
    sp.runs = match.runs;
    sp.wickets = match.wickets;
    sp.status = match.status;
    sp.photoUrl = match.photoUrl;
    sp.localPhoto = match.localPhoto;
    sp.photoCredit = match.photoCredit;
  }
}

// 6. Grounds (31 rows)
const grounds = raw['Grounds'].slice(1).map((r, idx) => {
  const embeddedImg = r[0]?.img || '';
  const name = r[1]?.text || '';
  const city = r[2]?.text || '';
  const country = r[3]?.text || '';
  const type = r[4]?.text || '';
  const capacity = r[5]?.text || '';
  const leagues = r[6]?.text || '';
  const story = r[7]?.text || '';
  const linkedMomentsRaw = r[8]?.text || '';
  const photoUrl = r[9]?.text || '';
  const photoCredit = r[10]?.text || '';
  const linkedMomentTitles = linkedMomentsRaw
    ? linkedMomentsRaw.split('|').map(s => s.trim()).filter(Boolean)
    : [];

  return {
    index: idx + 1,
    id: slugify(name),
    name,
    city,
    country,
    type,
    capacity,
    leagues,
    story,
    linkedMomentTitles,
    photoUrl,
    localPhoto: name.includes('Chinnaswamy') ? './assets/photos/stadium.jpg' : null,
    photoCredit: photoCredit || 'Stadium archive'
  };
});

// 7. Key Moments (45 rows)
const keyMoments = raw['Key Moments'].slice(1).map((r, idx) => {
  const embeddedImg = r[0]?.img || '';
  const year = r[1]?.text || '';
  const date = r[2]?.text || '';
  const league = r[3]?.text || '';
  const category = r[4]?.text || '';
  let title = r[5]?.text || '';
  let description = r[6]?.text || '';
  const keyPlayersRaw = r[7]?.text || '';
  const photoUrl = r[8]?.text || '';
  const photoCredit = r[9]?.text || '';
  const photoSearch = r[10]?.text || '';

  // Repair the 2 comma-split titles in Key Moments
  if (title === 'Kohli Crosses 9' && description.startsWith('000 IPL Runs,')) {
    title = 'Kohli Crosses 9,000 IPL Runs';
    description = description.replace(/^000 IPL Runs,/, '').trim();
  } else if (title === 'The Record Final - 204 Chased' && description.startsWith('Second WPL Crown,')) {
    title = 'The Record Final - 204 Chased, Second WPL Crown';
    description = description.replace(/^Second WPL Crown,/, '').trim();
  }

  const keyPlayers = keyPlayersRaw && keyPlayersRaw !== '-'
    ? keyPlayersRaw.split(';').map(s => s.trim()).filter(Boolean)
    : [];

  // Link to Ground by matching ground's linkedMomentTitles or text mention
  const matchedGround = grounds.find(g =>
    g.linkedMomentTitles.some(t =>
      t.toLowerCase().includes(title.toLowerCase().slice(0, 18)) ||
      title.toLowerCase().includes(t.replace(/\(\d{4}.*\)/, '').trim().toLowerCase().slice(0, 18))
    )
  ) || grounds.find(g => description.toLowerCase().includes(g.city.toLowerCase()) || description.toLowerCase().includes(g.name.split(' ')[0].toLowerCase()));

  return {
    index: idx + 1,
    id: `${year}-${slugify(title)}`,
    year,
    date,
    league,
    category,
    title,
    description,
    keyPlayers,
    groundId: matchedGround ? matchedGround.id : null,
    groundName: matchedGround ? `${matchedGround.name}, ${matchedGround.city}` : null,
    photoUrl,
    photoCredit: photoCredit || 'Public match archive',
    photoSearch
  };
});

// Populate resolved moment IDs on each ground
for (const g of grounds) {
  g.linkedMomentIds = keyMoments
    .filter(m => m.groundId === g.id || g.linkedMomentTitles.some(t => m.title.toLowerCase().includes(t.replace(/\(\d{4}.*\)/, '').trim().toLowerCase().slice(0, 16))))
    .map(m => m.id);
}

// 8. Logos (4 crest eras from the sheet, mapped to our local transparent logos)
const logoLocalMap = {
  '2008-2015': './assets/logos/logo-2009-2015.png',
  '2016-2019': './assets/logos/logo-2016-2019.png',
  '2020-2023': './assets/logos/logo-2020-2023.png',
  '2024-Present': './assets/logos/logo-2024-2026.png'
};

const logos = raw['Logos'].slice(1).map((r, idx) => {
  const era = r[1]?.text || '';
  const yearsUsed = r[2]?.text || '';
  const teamName = r[3]?.text || '';
  const description = r[4]?.text || '';
  let colours = r[5]?.text || '';
  let keyChange = r[6]?.text || '';
  let imageSource = r[7]?.text || '';

  if (era === 'Vertical Banner Crest' && colours.includes('Unveiled Feb 2020')) {
    const parts = colours.split(',Unveiled');
    colours = parts[0].trim();
    keyChange = `Unveiled${parts[1]}, ${keyChange}`;
  }

  return {
    index: idx + 1,
    id: slugify(`${era}-${yearsUsed}`),
    era,
    yearsUsed,
    teamName,
    description,
    colours,
    keyChange,
    imageSource,
    localLogo: logoLocalMap[yearsUsed] || './assets/logos/logo-2024-2026.png'
  };
});

// 9. All Teams (IPL & WPL) (20 rows: 15 IPL + 5 WPL)
const allTeams = raw['All Teams (IPL & WPL)'].slice(1).map((r, idx) => ({
  index: idx + 1,
  id: slugify(`${r[1]?.text}-${r[2]?.text}`),
  league: r[1]?.text || '',
  team: r[2]?.text || '',
  city: r[3]?.text || '',
  seasonsActive: r[4]?.text || '',
  status: r[5]?.text || '',
  homeGround: r[6]?.text || '',
  owner: r[7]?.text || '',
  titles: r[8]?.text || '',
  bestFinish: r[9]?.text || '',
  captain: r[10]?.text || '',
  headCoach: r[11]?.text || '',
  nameHistory: r[12]?.text || '',
  logoHistory: r[13]?.text || '',
  notes: r[14]?.text || '',
  isRcb: (r[2]?.text || '').includes('Royal Challengers')
}));

// 10. Seasons (23 rows: 19 IPL + 4 WPL)
const seasons = raw['Seasons'].slice(1).map((r, idx) => {
  const league = r[0]?.text || '';
  const season = Number(r[1]?.text || 0);
  const captain = r[2]?.text || '';
  const headCoach = r[3]?.text || '';
  const finish = r[4]?.text || '';
  const highlight = r[5]?.text || '';
  return {
    index: idx + 1,
    id: `${league.toLowerCase()}-${season}`,
    league,
    season,
    captain,
    headCoach,
    finish,
    isChampion: finish.toUpperCase().includes('CHAMPION'),
    isFinalist: finish.toLowerCase().includes('runners-up') || finish.toUpperCase().includes('CHAMPION'),
    highlight
  };
});

// 11. Captains (10 rows: 9 IPL + 1 WPL)
const captains = raw['Captains'].slice(1).map((r, idx) => ({
  index: idx + 1,
  id: slugify(`${r[0]?.text}-${r[1]?.text}`),
  league: r[0]?.text || '',
  captain: r[1]?.text || '',
  country: r[2]?.text || '',
  seasons: r[3]?.text || '',
  notes: r[4]?.text || ''
}));

// 12. Records (23 rows: 15 IPL + 8 WPL)
const records = raw['Records'].slice(1).map((r, idx) => ({
  index: idx + 1,
  id: slugify(`${r[0]?.text}-${r[1]?.text}`),
  league: r[0]?.text || '',
  record: r[1]?.text || '',
  holder: r[2]?.text || '',
  value: r[3]?.text || '',
  seasonDate: r[4]?.text || '',
  note: r[5]?.text || ''
}));

// 13. Squad Only (Never Played) (21 rows)
const squadOnly = raw['Squad Only (Never Played)'].slice(1).map((r, idx) => ({
  index: idx + 1,
  id: slugify(r[0]?.text || ''),
  name: r[0]?.text || '',
  league: r[1]?.text || '',
  country: r[2]?.text || '',
  role: r[3]?.text || '',
  seasonsInSquad: r[4]?.text || '',
  note: r[5]?.text || ''
}));

const coaches = raw['Coaches'].slice(1).map((row, index) => ({
  id: slugify(row.slice(1, 5).map(cell => cell.text).join('-')),
  sourceRow: index + 2,
  name: row[1].text,
  league: row[2].text,
  role: row[3].text,
  tenure: row[4].text,
  country: row[5].text,
  background: row[6].text,
  achievements: row[7].text,
  afterRcb: row[8].text
}));
const importEntries = name => raw[name].slice(1).map((row, index) => ({
  id: slugify(`${row[0].text}-${row[1].text}`),
  sourceRow: index + 2,
  section: row[0].text,
  item: row[1].text,
  details: row[2].text
}));
const franchise = importEntries('Franchise & More');
const rcbCares = importEntries('4 June 2025 & RCB Cares');
for (const [name, records] of Object.entries({ coaches, franchise, rcbCares })) {
  if (new Set(records.map(record => record.id)).size !== records.length) {
    throw new Error(`Duplicate record identities in ${name}.`);
  }
}

const database = {
  title: 'RCB Fan Tribute Database (2008–2026)',
  spreadsheetUrl: PUBHTML_URL,
  generatedAt: fetchedAt.slice(0, 10),
  fetchedAt,
  sheets,
  counts: {
    sheets: sheets.length,
    players: players.length,
    iplPlayers: players.filter(p => p.league === 'IPL').length,
    wplPlayers: players.filter(p => p.league === 'WPL').length,
    clt20OnlyPlayers: players.filter(p => p.league === 'CLT20').length,
    starPlayers: starPlayers.length,
    iplStars: starPlayers.filter(s => s.league === 'IPL').length,
    wplStars: starPlayers.filter(s => s.league === 'WPL').length,
    keyMoments: keyMoments.length,
    grounds: grounds.length,
    logos: logos.length,
    allTeams: allTeams.length,
    seasons: seasons.length,
    captains: captains.length,
    records: records.length,
    squadOnly: squadOnly.length,
    coaches: coaches.length,
    franchise: franchise.length,
    rcbCares: rcbCares.length
  },
  coverLines,
  websiteGuide,
  sources,
  records,
  starPlayers,
  players,
  squadOnly,
  keyMoments,
  grounds,
  logos,
  allTeams,
  seasons,
  captains,
  coaches,
  franchise,
  rcbCares
};

return database;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const { raw, sheets } = await fetchRawTabs();
  const database = buildDatabase(raw, { sheets, fetchedAt: new Date().toISOString() });
  const directory = new URL('../assets/data/', import.meta.url);
  const temporary = new URL('database.json.tmp', directory);
  await mkdir(directory, { recursive: true });
  await writeFile(temporary, JSON.stringify(database, null, 2), 'utf8');
  await rename(temporary, new URL('database.json', directory));
  console.log('Refreshed published sheets:', JSON.stringify(database.counts, null, 2));
}