const display = value => value === null ? '—' : String(value);

export function sortedSeasonPlayers(players, key, query = '') {
  const normalized = query.trim().toLocaleLowerCase('en');
  return players.filter(player => player.name.toLocaleLowerCase('en').includes(normalized)).sort((a, b) => {
    if (key === 'name') return a.name.localeCompare(b.name);
    if (a[key] === null && b[key] !== null) return 1;
    if (b[key] === null && a[key] !== null) return -1;
    return (b[key] ?? 0) - (a[key] ?? 0) || a.name.localeCompare(b.name);
  });
}

export async function initSeasonArchive() {
  const league = document.querySelector('#archive-league');
  const year = document.querySelector('#archive-year');
  const sort = document.querySelector('#archive-sort');
  const search = document.querySelector('#archive-search');
  if (!league || !year || !sort || !search) return;
  const controls = [league, year, sort, search];
  controls.forEach(control => { control.disabled = true; });
  try {
    const response = await fetch(new URL('./assets/data/seasons.json', import.meta.url));
    if (!response.ok) throw new Error(`HTTP ${response.status} loading season archive`);
    const archive = await response.json();
    if (!archive.competitions?.ipl?.seasons?.length || !archive.competitions?.wpl?.seasons?.length) throw new Error('Season archive has no valid IPL/WPL coverage');
    document.querySelector('#archive-methodology').textContent = `${archive.methodology} Data refreshed ${archive.fetched}. ${archive.license}.`;
    function render() {
      const competition = archive.competitions[league.value];
      const season = competition.seasons.find(item => item.year === Number(year.value));
      if (!season) throw new Error(`No ${league.value} season ${year.value}`);
      const players = sortedSeasonPlayers(season.players, sort.value, search.value);
      document.querySelector('#archive-coverage').textContent = `${league.value.toUpperCase()} ${season.year} · ${season.matchIds.length} source match files · ${season.players.length} recorded players · ${players.length} shown · ${season.firstDate} to ${season.lastDate}`;
      document.querySelector('#archive-caption').textContent = `${league.value.toUpperCase()} ${season.year} · All recorded RCB participants · Source-derived totals`;
      document.querySelector('#archive-download').href = competition.source;
      const body = document.querySelector('#archive-body');
      body.replaceChildren();
      for (const player of players) {
        const row = document.createElement('tr');
        const name = document.createElement('th');
        name.scope = 'row';
        name.textContent = player.name;
        if (player.cricinfoId) {
          const link = document.createElement('a');
          link.href = `https://www.espncricinfo.com/cricketers/player-${encodeURIComponent(player.cricinfoId)}`;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = `${player.name} ↗`;
          name.replaceChildren(link);
        }

        row.append(name);
        const values = [player.matchListings, player.battingInnings, player.runs, player.ballsFaced, player.strikeRate, player.battingInnings ? `${player.highest}${player.highestNotOut ? '*' : ''}` : '—', player.fours, player.sixes, player.overs, player.wickets, player.economy, player.catches, player.stumpings];
        for (const value of values) {
          const cell = document.createElement('td');
          cell.textContent = display(value);
          row.append(cell);
        }
        body.append(row);
      }
      if (!players.length) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 14;
        cell.textContent = 'No recorded players match this search.';
        row.append(cell);
        body.append(row);
      }
    }
    function setYears() {
      year.replaceChildren();
      for (const season of [...archive.competitions[league.value].seasons].reverse()) {
        const option = document.createElement('option');
        option.value = season.year;
        option.textContent = season.year;
        year.append(option);
      }
      search.value = '';
      render();
    }
    league.addEventListener('change', setYears);
    year.addEventListener('change', render);
    sort.addEventListener('change', render);
    search.addEventListener('input', render);
    controls.forEach(control => { control.disabled = false; });
    setYears();
  } catch (error) {
    console.error('Unable to load seasonal statistics:', error);
    const alert = document.querySelector('#archive-error');
    alert.hidden = false;
    alert.textContent = `The season data could not be loaded. ${error.message}. Reload the page or consult the linked Cricsheet source.`;
    document.querySelector('#archive-coverage').textContent = 'Season archive unavailable; no totals are being substituted.';
  }
}

export async function initRosters() {
  const league = document.querySelector('#roster-league');
  const year = document.querySelector('#roster-year');
  if (!league || !year) return;
  league.disabled = true;
  year.disabled = true;
  try {
    const response = await fetch(new URL('./assets/data/rosters.json', import.meta.url));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const archive = await response.json();
    function render() {
      const roster = archive.competitions[league.value].find(item => item.year === Number(year.value));
      if (!roster) throw new Error('The selected roster is absent from the archive');
      document.querySelector('#roster-source').href = roster.source;
      document.querySelector('#roster-source').textContent = roster.status === 'reported-squad' ? 'View reported squad source ↗' : 'View historical source ↗';
      document.querySelector('#roster-caption').textContent = `${league.value.toUpperCase()} ${roster.year} · Historical squad-source extract`;
      document.querySelector('#roster-status').textContent = ['source-table', 'reported-squad'].includes(roster.status)
        ? `${roster.players.length} ${roster.status === 'reported-squad' ? 'reported squad / replacement entries' : 'source roster entries'}${roster.revision ? ` · Wikipedia revision ${roster.revision}` : ''} · Refreshed ${archive.fetched}${league.value === 'clt20' ? ' · CLT20 player statistics not verified' : ''}${roster.sourceNote ? ` · ${roster.sourceNote}` : ''}`
        : `A complete registered roster has not been verified for ${league.value.toUpperCase()} ${roster.year}. ${league.value === 'clt20' ? 'No CLT20 player statistics are substituted.' : 'The match-participant statistics above remain available, but are not a full registration list.'}`;
      const additional = document.querySelector('#roster-additional-sources');
      additional.replaceChildren();
      for (const [index, source] of (roster.additionalSources || []).entries()) {
        const link = document.createElement('a');
        link.href = source;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = `Replacement/source update ${index + 1} ↗`;
        additional.append(link);
      }
      const body = document.querySelector('#roster-body');
      body.replaceChildren();
      for (const player of roster.players) {
        const row = document.createElement('tr');
        for (const [index, value] of [player.name, player.country, player.role, player.batting, player.bowling, player.notes].entries()) {
          const cell = document.createElement(index === 0 ? 'th' : 'td');
          if (index === 0) cell.scope = 'row';
          cell.textContent = value || '—';
          if (index === 0 && player.profile) {
            const link = document.createElement('a');
            link.href = player.profile;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = `${player.name} ↗`;
            cell.replaceChildren(link);
          }
          row.append(cell);
        }
        body.append(row);
      }
    }
    function setYears() {
      year.replaceChildren();
      for (const roster of [...archive.competitions[league.value]].reverse()) {
        const option = document.createElement('option');
        option.value = roster.year;
        option.textContent = roster.year;
        year.append(option);
      }
      render();
    }
    league.addEventListener('change', setYears);
    year.addEventListener('change', render);
    league.disabled = false;
    year.disabled = false;
    setYears();
  } catch (error) {
    console.error('Unable to load historical roster directory:', error);
    document.querySelector('#roster-status').textContent = `Roster data unavailable: ${error.message}. No substitute roster is being displayed.`;
  }
}
