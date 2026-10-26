import * as cheerio from 'cheerio';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const PUBHTML_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSf6EXr6CO83TubMGwoONrNvYeoCVID6GYhCC_Buwbe13zg2CbhRZMpYED4noPT5C80gK7UkBup7EmE/pubhtml';
const SHEET_BASE = `${PUBHTML_URL}/sheet?headers=false&gid=`;

const TABS = [
  { key: 'cover', name: 'Cover', gid: '1013178543' },
  { key: 'players', name: 'Players', gid: '618554855' },
  { key: 'keyMoments', name: 'Key Moments', gid: '759481013' },
  { key: 'grounds', name: 'Grounds', gid: '660646347' },
  { key: 'logos', name: 'Logos', gid: '716942872' },
  { key: 'allTeams', name: 'All Teams (IPL & WPL)', gid: '2054966032' },
  { key: 'starPlayers', name: 'Star Players', gid: '1038935935' },
  { key: 'seasons', name: 'Seasons', gid: '328981203' },
  { key: 'captains', name: 'Captains', gid: '571991846' },
  { key: 'records', name: 'Records', gid: '1552448583' },
  { key: 'squadOnly', name: 'Squad Only (Never Played)', gid: '2013565538' },
  { key: 'websiteGuide', name: 'Website Guide', gid: '1445540405' },
  { key: 'sources', name: 'Sources', gid: '71460464' }
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

async function fetchRawTabs() {
  try {
    const cached = await readFile(`${process.env.TEMP}\\rcb_sheet_html_dump.json`, 'utf8');
    return JSON.parse(cached);
  } catch {
    const dump = {};
    for (const tab of TABS) {
      const res = await fetch(SHEET_BASE + tab.gid);
      if (!res.ok) throw new Error(`Failed to fetch ${tab.name}: HTTP ${res.status}`);
      const html = await res.text();
      const $ = cheerio.load(html);
      const rows = [];
      $('table.waffle tbody tr').each((_, tr) => {
        const cells = [];
        $(tr).find('td').each((__, td) => {
          const img = $(td).find('img').attr('src') || '';
          const text = $(td).text().trim();
          cells.push({ text, img });
        });
        if (cells.some(c => c.text !== '' || c.img !== '')) rows.push(cells);
      });
      dump[tab.name] = rows;
    }
    return dump;
  }
}

const raw = await fetchRawTabs();

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

const database = {
  title: 'RCB Fan Tribute Database (2008–2026)',
  spreadsheetUrl: PUBHTML_URL,
  generatedAt: '2026-10-26',
  counts: {
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
    squadOnly: squadOnly.length
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
  captains
};

await mkdir('assets/data', { recursive: true });
await writeFile('assets/data/database.json', JSON.stringify(database, null, 2), 'utf8');
console.log('Generated assets/data/database.json with counts:', JSON.stringify(database.counts, null, 2));