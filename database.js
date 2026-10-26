import { existingPlayerPhoto, existingPlayerPhotoMarkup, existingPhotoCreditMarkup } from './player-media.js';

const escapeHtml = value =>
  String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

const fmtNum = value => (value === null || value === undefined || value === '' ? '—' : Number(value).toLocaleString('en-IN'));

function mediaImgMarkup({ localPhoto, photoUrl, alt, credit, fallbackBadge = 'RCB', className = 'db-card-img' }) {
  const sharedPhoto = existingPlayerPhotoMarkup(alt, `${alt} in RCB franchise kit`, className);
  if (sharedPhoto) return sharedPhoto;
  const src = localPhoto || photoUrl || './assets/mark.svg';
  const fallbackAttr = `this.onerror=null;this.src='./assets/mark.svg';this.classList.add('img-fallback');`;
  return `<img class="${className}" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="${fallbackAttr}" data-credit="${escapeHtml(credit || '')}">`;
}

let cachedDb = null;
export async function loadDatabase() {
  if (cachedDb) return cachedDb;
  const response = await fetch(new URL('./assets/data/database.json', import.meta.url));
  if (!response.ok) throw new Error(`HTTP ${response.status} loading database.json`);
  cachedDb = await response.json();
  return cachedDb;
}

export function filterSheetPlayers(players, { league = 'all', statusGroup = 'all', roleGroup = 'all', country = 'all', starOnly = false, query = '', sortBy = 'matches' } = {}) {
  const q = query.trim().toLowerCase();
  const filtered = players.filter(p => {
    if (league !== 'all' && p.league !== league) return false;
    if (statusGroup !== 'all' && p.statusGroup !== statusGroup) return false;
    if (roleGroup !== 'all' && p.roleGroup !== roleGroup) return false;
    if (country !== 'all' && p.country !== country) return false;
    if (starOnly && !p.isStar) return false;
    if (q) {
      const hay = `${p.name} ${p.role} ${p.country} ${p.seasons} ${p.status} ${p.statusDetail} ${p.whyStar || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return filtered.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'runs') return (b.runs ?? -1) - (a.runs ?? -1) || (b.matches ?? -1) - (a.matches ?? -1);
    if (sortBy === 'wickets') return (b.wickets ?? -1) - (a.wickets ?? -1) || (b.matches ?? -1) - (a.matches ?? -1);
    return (b.matches ?? -1) - (a.matches ?? -1) || (b.runs ?? -1) - (a.runs ?? -1) || a.name.localeCompare(b.name);
  });
}

export function filterKeyMoments(moments, { league = 'all', category = 'all', query = '' } = {}) {
  const q = query.trim().toLowerCase();
  return moments.filter(m => {
    if (league !== 'all') {
      if (league === 'COMBINED' && !m.league.includes('+')) return false;
      if (league !== 'COMBINED' && m.league !== league) return false;
    }
    if (category !== 'all' && m.category.toLowerCase() !== category.toLowerCase()) return false;
    if (q) {
      const hay = `${m.year} ${m.date} ${m.title} ${m.description} ${m.keyPlayers.join(' ')} ${m.groundName || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function filterGrounds(grounds, { country = 'all', typeFilter = 'all', query = '' } = {}) {
  const q = query.trim().toLowerCase();
  return grounds.filter(g => {
    if (country !== 'all' && g.country !== country) return false;
    if (typeFilter !== 'all') {
      const t = g.type.toLowerCase();
      if (typeFilter === 'home' && !t.includes('home')) return false;
      if (typeFilter === 'finals' && !t.includes('final') && !t.includes('wpl')) return false;
      if (typeFilter === 'away' && !t.includes('away')) return false;
      if (typeFilter === 'neutral' && !t.includes('neutral')) return false;
    }
    if (q) {
      const hay = `${g.name} ${g.city} ${g.country} ${g.story} ${g.leagues}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function filterCoaches(coaches, { league = 'all', role = 'all', query = '' } = {}) {
  const q = query.trim().toLocaleLowerCase('en');
  return coaches.filter(coach =>
    (league === 'all' || coach.league.split(/\s*[&+]\s*/).includes(league)) &&
    (role === 'all' || coach.role === role) &&
    `${coach.name} ${coach.league} ${coach.role} ${coach.tenure} ${coach.country} ${coach.background} ${coach.achievements} ${coach.afterRcb}`.toLocaleLowerCase('en').includes(q)
  );
}

export function filterSheetEntries(entries, { section = 'all', query = '' } = {}) {
  const q = query.trim().toLocaleLowerCase('en');
  return entries.filter(entry => (section === 'all' || entry.section === section) &&
    `${entry.section} ${entry.item} ${entry.details}`.toLocaleLowerCase('en').includes(q));
}

export function coachMarkup(coach, source) {
  return `<article class="sheet-coach-card" id="${escapeHtml(coach.id)}">
    <p class="eyebrow">${escapeHtml(coach.league)} · ${escapeHtml(coach.tenure)}</p>
    <h3>${escapeHtml(coach.name)}</h3>
    <p class="sheet-coach-role">${escapeHtml(coach.role)} · ${escapeHtml(coach.country)}</p>
    <details><summary>Background, RCB work &amp; later roles</summary>
      <dl><dt>Background</dt><dd>${escapeHtml(coach.background) || 'Not supplied in the sheet.'}</dd>
      <dt>At RCB / achievements</dt><dd>${escapeHtml(coach.achievements) || 'Not supplied in the sheet.'}</dd>
      <dt>After RCB / status at the source cutoff</dt><dd>${escapeHtml(coach.afterRcb) || 'Not supplied in the sheet.'}</dd></dl>
    </details>
    <a class="sheet-row-source" href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">Coaches sheet · row ${coach.sourceRow} ↗</a>
  </article>`;
}

export function sheetEntriesMarkup(entries, source) {
  const sections = [...new Set(entries.map(entry => entry.section))];
  return sections.map(section => `<section class="sheet-story-group">
    <h3>${escapeHtml(section)}</h3>
    ${entries.filter(entry => entry.section === section).map(entry => `<details class="sheet-story" id="${escapeHtml(entry.id)}">
      <summary>${escapeHtml(entry.item)}</summary><p>${escapeHtml(entry.details)}</p>
      <a class="sheet-row-source" href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">Published sheet · row ${entry.sourceRow} ↗</a>
    </details>`).join('')}
  </section>`).join('');
}

function initNewSheetSections(db) {
  const sheetUrl = key => {
    const sheet = db.sheets.find(item => item.key === key);
    if (!sheet) throw new Error(`Missing source metadata for ${key}. Refresh the workbook import.`);
    return sheet.url;
  };
  document.querySelectorAll('[data-sheet-count]').forEach(element => {
    element.textContent = db.counts[element.dataset.sheetCount];
  });
  document.querySelectorAll('[data-sheet-refresh]').forEach(element => {
    element.textContent = `Published workbook · ${db.sheets.length} tabs · Imported ${new Date(db.fetchedAt).toLocaleString('en-GB', { timeZone: 'UTC' })} UTC`;
  });

  const coachSection = document.querySelector('#sheet-coaches-section');
  if (coachSection) {
    const league = coachSection.querySelector('[data-coach-league]');
    const role = coachSection.querySelector('[data-coach-role]');
    const search = coachSection.querySelector('input[type="search"]');
    const grid = coachSection.querySelector('[data-sheet-results]');
    role.innerHTML += [...new Set(db.coaches.map(coach => coach.role))].sort()
      .map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');
    const render = () => {
      const records = filterCoaches(db.coaches, { league: league.value, role: role.value, query: search.value });
      grid.innerHTML = records.map(coach => coachMarkup(coach, sheetUrl('coaches'))).join('') ||
        '<p class="archive-note">No coaching or support-staff entries match these filters.</p>';
      coachSection.querySelector('[role="status"]').textContent = `${records.length} of ${db.coaches.length} role/tenure entries. A person may appear more than once.`;
    };
    league.addEventListener('change', render);
    role.addEventListener('change', render);
    search.addEventListener('input', render);
    render();
  }

  document.querySelectorAll('[data-sheet-explorer]').forEach(explorer => {
    const key = explorer.dataset.sheetExplorer;
    const entries = db[key];
    const select = explorer.querySelector('select');
    const search = explorer.querySelector('input[type="search"]');
    const results = explorer.querySelector('[data-sheet-results]');
    select.innerHTML += [...new Set(entries.map(entry => entry.section))]
      .map(section => `<option value="${escapeHtml(section)}">${escapeHtml(section)}</option>`).join('');
    const render = () => {
      const visible = filterSheetEntries(entries, { section: select.value, query: search.value });
      results.innerHTML = sheetEntriesMarkup(visible, sheetUrl(key)) ||
        '<p class="archive-note">No entries match these filters. Clear the search or choose another section.</p>';
      explorer.querySelector('[role="status"]').textContent = `${visible.length} of ${entries.length} published entries shown. Open a heading to read its full text and source.`;
    };
    select.addEventListener('change', render);
    search.addEventListener('input', render);
    render();
  });

  const hash = location.hash.slice(1);
  const records = [...db.coaches, ...db.franchise, ...db.rcbCares];
  if (records.some(record => record.id === hash)) {
    const target = document.getElementById(hash);
    const details = target?.matches('details') ? target : target?.querySelector('details');
    if (details) details.open = true;
    target?.scrollIntoView();
  }
}

export async function initSpreadsheetDashboard() {
  let db;
  try {
    db = await loadDatabase();
  } catch (err) {
    console.error('Failed to initialize spreadsheet database:', err);
    const alert = document.createElement('p');
    alert.className = 'archive-feedback';
    alert.setAttribute('role', 'alert');
    alert.textContent = 'The published-sheet database could not be loaded. Reload the page or consult the published workbook; no replacement data is shown.';
    document.querySelector('main').prepend(alert);
    return;
  }

  initNewSheetSections(db);

  // Ensure a shared detail modal exists on every page for deep cross-linking
  let detailDialog = document.querySelector('#db-detail-dialog');
  if (!detailDialog) {
    detailDialog = document.createElement('dialog');
    detailDialog.id = 'db-detail-dialog';
    detailDialog.className = 'modal db-detail-modal';
    detailDialog.setAttribute('aria-labelledby', 'db-modal-title');
    detailDialog.innerHTML = `<button class="modal-close" type="button" aria-label="Close detail view">×</button><div id="db-modal-body"></div>`;
    document.body.append(detailDialog);
    detailDialog.querySelector('.modal-close').addEventListener('click', () => detailDialog.close());
    detailDialog.addEventListener('click', event => {
      if (event.target !== detailDialog) return;
      const box = detailDialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) {
        detailDialog.close();
      }
    });
  }
  const modalBody = detailDialog.querySelector('#db-modal-body');

  function openPlayerDetail(playerOrName) {
    const q = String(playerOrName || '').replace(/\(.*?\)/g, '').trim().toLowerCase();
    const player = db.players.find(p => p.id === q || p.name.toLowerCase() === q) ||
      db.players.find(p => p.name.toLowerCase().includes(q) || q.includes(p.name.toLowerCase()));
    if (!player) return;

    const linkedMoments = db.keyMoments.filter(m =>
      m.keyPlayers.some(kp => kp.toLowerCase().includes(player.name.toLowerCase()))
    );

    modalBody.innerHTML = `
      <div class="db-modal-header">
        <div class="db-modal-visual">
          ${mediaImgMarkup({ localPhoto: player.localPhoto, photoUrl: player.photoUrl, alt: player.name, credit: player.photoCredit, className: 'db-modal-img' })}
        </div>
        <div class="db-modal-summary">
          <div class="db-badge-row">
            <span class="db-pill league-${player.league.toLowerCase()}">${escapeHtml(player.league)}</span>
            <span class="db-pill status-pill">${escapeHtml(player.status)}</span>
            ${player.isStar ? `<span class="db-pill star-pill">★ STAR PLAYER${player.starRank ? ` #${player.starRank}` : ''}</span>` : ''}
          </div>
          <h2 id="db-modal-title">${escapeHtml(player.name)}</h2>
          <p class="db-modal-sub">${escapeHtml(player.role)} · ${escapeHtml(player.country)} · Seasons at RCB: <strong>${escapeHtml(player.seasons)}</strong></p>
          <div class="db-stat-strip">
            <div><strong>${fmtNum(player.matches)}</strong><span>RCB Matches</span></div>
            <div><strong>${fmtNum(player.runs)}</strong><span>RCB Runs</span></div>
            <div><strong>${fmtNum(player.wickets)}</strong><span>RCB Wickets</span></div>
          </div>
          ${player.statusDetail ? `<p class="db-detail-note"><strong>Status / Career Note:</strong> ${escapeHtml(player.statusDetail)}</p>` : ''}
          ${player.whyStar ? `<div class="db-star-callout"><p><strong>Why an RCB Star:</strong> ${escapeHtml(player.whyStar)}</p><p><strong>Signature Moment / Stat:</strong> ${escapeHtml(player.signatureMoment)}</p></div>` : ''}
          ${existingPlayerPhoto(player.name) ? existingPhotoCreditMarkup(existingPlayerPhoto(player.name)) : `<p class="photo-credit">Photo Source / Credit: ${escapeHtml(player.photoCredit)}</p>`}
        </div>
      </div>
      ${linkedMoments.length ? `<div class="db-modal-linked"><p class="eyebrow">LINKED KEY MOMENTS (${linkedMoments.length})</p><div class="db-chip-list">${linkedMoments.map(m => `<button type="button" class="db-link-chip" data-open-moment="${escapeHtml(m.id)}"><strong>${escapeHtml(m.year)} · ${escapeHtml(m.title)}</strong><span>${escapeHtml(m.date)}</span></button>`).join('')}</div></div>` : ''}
    `;
    if (!detailDialog.open) detailDialog.showModal();
  }

  function openGroundDetail(groundIdOrName) {
    const q = String(groundIdOrName || '').trim().toLowerCase();
    const ground = db.grounds.find(g => g.id === q || g.name.toLowerCase() === q || g.name.toLowerCase().includes(q));
    if (!ground) return;
    const linkedMoments = db.keyMoments.filter(m => ground.linkedMomentIds?.includes(m.id) || m.groundId === ground.id);

    modalBody.innerHTML = `
      <div class="db-modal-header">
        <div class="db-modal-visual">
          ${mediaImgMarkup({ localPhoto: ground.localPhoto, photoUrl: ground.photoUrl, alt: ground.name, credit: ground.photoCredit, className: 'db-modal-img' })}
        </div>
        <div class="db-modal-summary">
          <div class="db-badge-row">
            <span class="db-pill star-pill">${escapeHtml(ground.type)}</span>
            <span class="db-pill">${escapeHtml(ground.leagues)}</span>
          </div>
          <h2 id="db-modal-title">${escapeHtml(ground.name)}</h2>
          <p class="db-modal-sub">${escapeHtml(ground.city)}, ${escapeHtml(ground.country)} · Approx. Capacity: <strong>${escapeHtml(ground.capacity)}</strong></p>
          <p class="db-detail-note">${escapeHtml(ground.story)}</p>
          <p class="photo-credit">Photo Source / Credit: ${escapeHtml(ground.photoCredit)}</p>
        </div>
      </div>
      ${linkedMoments.length ? `<div class="db-modal-linked"><p class="eyebrow">KEY MOMENTS AT THIS GROUND (${linkedMoments.length})</p><div class="db-chip-list">${linkedMoments.map(m => `<button type="button" class="db-link-chip" data-open-moment="${escapeHtml(m.id)}"><strong>${escapeHtml(m.year)} · ${escapeHtml(m.title)}</strong><span>${escapeHtml(m.category)}</span></button>`).join('')}</div></div>` : ''}
    `;
    if (!detailDialog.open) detailDialog.showModal();
  }

  function openMomentDetail(momentId) {
    const moment = db.keyMoments.find(m => m.id === momentId);
    if (!moment) return;
    modalBody.innerHTML = `
      <div class="db-modal-header">
        <div class="db-modal-visual">
          ${mediaImgMarkup({ localPhoto: null, photoUrl: moment.photoUrl, alt: moment.title, credit: moment.photoCredit, className: 'db-modal-img' })}
        </div>
        <div class="db-modal-summary">
          <div class="db-badge-row">
            <span class="db-pill league-${moment.league.toLowerCase().replace(/[^a-z0-9]/g, '')}">${escapeHtml(moment.league)}</span>
            <span class="db-pill ${moment.category === 'TITLE' ? 'star-pill' : 'status-pill'}">${escapeHtml(moment.category)}</span>
            <span class="db-pill">${escapeHtml(moment.date)}</span>
          </div>
          <h2 id="db-modal-title">${escapeHtml(moment.title)}</h2>
          <p class="db-detail-note">${escapeHtml(moment.description)}</p>
          ${moment.groundId ? `<p class="db-modal-sub">Venue: <button type="button" class="inline-db-link" data-open-ground="${escapeHtml(moment.groundId)}">🏟️ ${escapeHtml(moment.groundName)} ↗</button></p>` : ''}
          ${moment.keyPlayers.length ? `<div class="db-modal-linked"><p class="eyebrow">KEY PLAYERS IN THIS MOMENT</p><div class="db-chip-list">${moment.keyPlayers.map(kp => `<button type="button" class="db-link-chip" data-open-player="${escapeHtml(kp)}"><strong>👤 ${escapeHtml(kp)}</strong></button>`).join('')}</div></div>` : ''}
          <p class="photo-credit">Photo Source / Credit: ${escapeHtml(moment.photoCredit)}</p>
        </div>
      </div>
    `;
    if (!detailDialog.open) detailDialog.showModal();
  }

  document.addEventListener('click', event => {
    if (event.target.closest('a')) return;
    const pBtn = event.target.closest('[data-open-player]');
    if (pBtn) {
      openPlayerDetail(pBtn.dataset.openPlayer);
      return;
    }
    const gBtn = event.target.closest('[data-open-ground]');
    if (gBtn) {
      openGroundDetail(gBtn.dataset.openGround);
      return;
    }
    const mBtn = event.target.closest('[data-open-moment]');
    if (mBtn) {
      openMomentDetail(mBtn.dataset.openMoment);
    }
  });

  // 1. Homepage Top 5 Icons + Record Counters + Omnibox (index.html)
  const top5Grid = document.querySelector('#top5-icons-grid');
  if (top5Grid) {
    const top5Names = ['Virat Kohli', 'AB de Villiers', 'Chris Gayle', 'Rajat Patidar', 'Smriti Mandhana'];
    const top5 = top5Names.map(name => db.starPlayers.find(s => s.name === name)).filter(Boolean);
    top5Grid.innerHTML = top5.map(star => `
      <article class="db-star-card glass-card" data-open-player="${escapeHtml(star.name)}" tabindex="0" role="button" aria-label="Inspect ${escapeHtml(star.name)}">
        <div class="db-card-media">
          ${mediaImgMarkup({ localPhoto: star.localPhoto, photoUrl: star.photoUrl, alt: star.name, credit: star.photoCredit })}
          <span class="db-rank-tag">${escapeHtml(star.league)} #${star.rank}</span>
          <span class="db-era-tag">${escapeHtml(star.era)}</span>
        </div>
        <div class="db-card-body">
          <h3>${escapeHtml(star.name)}</h3>
          <p class="db-why-star">${escapeHtml(star.whyStar)}</p>
          <div class="db-sig-moment"><strong>Signature:</strong> ${escapeHtml(star.signatureMoment)}</div>
          <div class="db-mini-metrics">
            <span><strong>${fmtNum(star.matches)}</strong> Mat</span>
            <span><strong>${fmtNum(star.runs)}</strong> Runs</span>
            <span><strong>${fmtNum(star.wickets)}</strong> Wkts</span>
          </div>
          ${existingPhotoCreditMarkup(existingPlayerPhoto(star.name))}
        </div>
      </article>
    `).join('');
  }

  const recordCounters = document.querySelector('#record-counters-grid');
  if (recordCounters) {
    const featuredRecords = [
      { value: '9,336+', label: 'Most Career IPL Runs', holder: 'Virat Kohli (2008–2026)', note: 'All for RCB · Passed 9,000 on 27 Apr 2026' },
      { value: '973', label: 'Single-Season IPL Record', holder: 'Virat Kohli (2016)', note: '4 centuries in one IPL campaign' },
      { value: '175*', label: 'Highest T20 Individual Score', holder: 'Chris Gayle (23 Apr 2013)', note: '66 balls · 17 sixes · 30-ball century vs PWI' },
      { value: '139', label: 'All-Time RCB Wickets Record', holder: 'Yuzvendra Chahal (2014–2021)', note: '113 matches for Bengaluru' },
      { value: '263/5', label: 'Iconic RCB Team Total', holder: 'RCB vs Pune Warriors (2013)', note: '11-year IPL record at Chinnaswamy' },
      { value: '229', label: 'Highest IPL Partnership', holder: 'Kohli (109) & ABD (129*)', note: '14 May 2016 vs Gujarat Lions (144-run win)' },
      { value: '1,023', label: 'Most Career WPL Runs (RCB)', holder: 'Smriti Mandhana (2023–2026)', note: 'First RCB batter past 1,000 WPL runs' },
      { value: '2 + 2', label: 'IPL & WPL Crowns', holder: 'IPL (2025, 2026) · WPL (2024, 2026)', note: 'First franchise to hold both titles simultaneously' }
    ];
    recordCounters.innerHTML = featuredRecords.map(rec => `
      <article class="db-counter-card glass-card">
        <strong>${escapeHtml(rec.value)}</strong>
        <h4>${escapeHtml(rec.label)}</h4>
        <p>${escapeHtml(rec.holder)}</p>
        <small>${escapeHtml(rec.note)}</small>
      </article>
    `).join('');
  }

  const omniboxInput = document.querySelector('#db-omnibox-input');
  const omniboxResults = document.querySelector('#db-omnibox-results');
  if (omniboxInput && omniboxResults) {
    function renderOmnibox(query) {
      const q = query.trim().toLowerCase();
      if (!q) {
        omniboxResults.innerHTML = `<p class="archive-note">Search players, grounds, moments, coaching staff, franchise history, or remembrance and RCB Cares entries.</p>`;
        return;
      }
      const pHits = db.players.filter(p => `${p.name} ${p.role} ${p.country} ${p.seasons} ${p.status}`.toLowerCase().includes(q)).slice(0, 6);
      const mHits = db.keyMoments.filter(m => `${m.year} ${m.title} ${m.description} ${m.keyPlayers.join(' ')}`.toLowerCase().includes(q)).slice(0, 4);
      const gHits = db.grounds.filter(g => `${g.name} ${g.city} ${g.country} ${g.story}`.toLowerCase().includes(q)).slice(0, 4);
      const cHits = filterCoaches(db.coaches, { query }).slice(0, 4);
      const fHits = filterSheetEntries(db.franchise, { query }).slice(0, 3);
      const rHits = filterSheetEntries(db.rcbCares, { query }).slice(0, 3);

      if (![pHits, mHits, gHits, cHits, fHits, rHits].some(hits => hits.length)) {
        omniboxResults.innerHTML = `<p class="archive-note">No matching records in the 2008–2026 database for "${escapeHtml(query)}".</p>`;
        return;
      }
      omniboxResults.innerHTML = `
        <div class="omnibox-hit-grid">
          ${pHits.map(p => `<button type="button" class="omnibox-hit" data-open-player="${escapeHtml(p.name)}"><span class="db-pill league-${p.league.toLowerCase()}">${escapeHtml(p.league)} PLAYER</span><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.seasons)} · ${fmtNum(p.matches)} Mat · ${fmtNum(p.runs)} Runs · ${fmtNum(p.wickets)} Wkts · ${escapeHtml(p.status)}</small></button>`).join('')}
          ${mHits.map(m => `<button type="button" class="omnibox-hit" data-open-moment="${escapeHtml(m.id)}"><span class="db-pill star-pill">${escapeHtml(m.year)} MOMENT</span><strong>${escapeHtml(m.title)}</strong><small>${escapeHtml(m.date)} · ${escapeHtml(m.category)}</small></button>`).join('')}
          ${gHits.map(g => `<button type="button" class="omnibox-hit" data-open-ground="${escapeHtml(g.id)}"><span class="db-pill">GROUND</span><strong>${escapeHtml(g.name)}</strong><small>${escapeHtml(g.city)}, ${escapeHtml(g.country)} · ${escapeHtml(g.type)}</small></button>`).join('')}
          ${cHits.map(coach => `<a class="omnibox-hit" href="./seasons.html#${escapeHtml(coach.id)}"><span class="db-pill">COACH / SUPPORT STAFF</span><strong>${escapeHtml(coach.name)}</strong><small>${escapeHtml(coach.league)} · ${escapeHtml(coach.role)} · ${escapeHtml(coach.tenure)}</small></a>`).join('')}
          ${fHits.map(entry => `<a class="omnibox-hit" href="./history.html#${escapeHtml(entry.id)}"><span class="db-pill">${escapeHtml(entry.section)}</span><strong>${escapeHtml(entry.item)}</strong></a>`).join('')}
          ${rHits.map(entry => `<a class="omnibox-hit" href="./cares.html#${escapeHtml(entry.id)}"><span class="db-pill">REMEMBRANCE &amp; RCB CARES</span><strong>${escapeHtml(entry.item)}</strong></a>`).join('')}
        </div>
      `;
    }
    omniboxInput.addEventListener('input', () => renderOmnibox(omniboxInput.value));
    renderOmnibox('');
  }

  // 2. Squad Page: Top 40 Ranked Star Players + Complete 223-Player Database + 21 Squad-Only (squad.html)
  const hofGrid = document.querySelector('#hof-stars-grid');
  const hofTabs = document.querySelector('#hof-stars-tabs');
  if (hofGrid && hofTabs) {
    let hofLeague = 'all';
    function renderHof() {
      const list = db.starPlayers.filter(s => hofLeague === 'all' || s.league === hofLeague);
      hofGrid.innerHTML = list.map(star => `
        <article class="db-star-card glass-card" data-open-player="${escapeHtml(star.name)}" tabindex="0" role="button">
          <div class="db-card-media">
            ${mediaImgMarkup({ localPhoto: star.localPhoto, photoUrl: star.photoUrl, alt: star.name, credit: star.photoCredit })}
            <span class="db-rank-tag">${escapeHtml(star.league)} RANK #${star.rank}</span>
            <span class="db-era-tag">${escapeHtml(star.era)}</span>
          </div>
          <div class="db-card-body">
            <p class="eyebrow">${escapeHtml(star.country)} · ${escapeHtml(star.role || 'RCB Icon')}</p>
            <h3>${escapeHtml(star.name)}</h3>
            <p class="db-why-star">${escapeHtml(star.whyStar)}</p>
            <div class="db-sig-moment"><strong>Signature:</strong> ${escapeHtml(star.signatureMoment)}</div>
            <div class="db-mini-metrics">
              <span><strong>${fmtNum(star.matches)}</strong> Mat</span>
              <span><strong>${fmtNum(star.runs)}</strong> Runs</span>
              <span><strong>${fmtNum(star.wickets)}</strong> Wkts</span>
            </div>
            ${existingPhotoCreditMarkup(existingPlayerPhoto(star.name))}
          </div>
        </article>
      `).join('');
    }
    hofTabs.addEventListener('click', event => {
      const btn = event.target.closest('[data-hof-league]');
      if (!btn) return;
      hofLeague = btn.dataset.hofLeague;
      hofTabs.querySelectorAll('button').forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      renderHof();
    });
    renderHof();
  }

  const dbPlayersGrid = document.querySelector('#db-players-grid');
  if (dbPlayersGrid) {
    const fLeague = document.querySelector('#db-filter-league');
    const fStatus = document.querySelector('#db-filter-status');
    const fRole = document.querySelector('#db-filter-role');
    const fCountry = document.querySelector('#db-filter-country');
    const fSort = document.querySelector('#db-filter-sort');
    const fStarOnly = document.querySelector('#db-filter-star');
    const fSearch = document.querySelector('#db-filter-search');
    const fCount = document.querySelector('#db-players-count');
    const fMoreBtn = document.querySelector('#db-players-more');

    const countries = [...new Set(db.players.map(p => p.country))].sort();
    if (fCountry) {
      fCountry.innerHTML = `<option value="all">All Countries (${countries.length})</option>` +
        countries.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    }

    let showAll223 = false;
    function renderDbPlayers() {
      const matching = filterSheetPlayers(db.players, {
        league: fLeague?.value || 'all',
        statusGroup: fStatus?.value || 'all',
        roleGroup: fRole?.value || 'all',
        country: fCountry?.value || 'all',
        starOnly: Boolean(fStarOnly?.checked),
        query: fSearch?.value || '',
        sortBy: fSort?.value || 'matches'
      });
      const visible = showAll223 || matching.length <= 36 ? matching : matching.slice(0, 36);
      if (fCount) {
        fCount.textContent = `Showing ${visible.length} of ${matching.length} matching RCB players (Total database: 223 players — 179 IPL + 43 WPL + 1 CLT20)`;
      }
      if (fMoreBtn) {
        fMoreBtn.hidden = matching.length <= 36;
        fMoreBtn.textContent = showAll223 ? 'Show top 36 players ↑' : `Show all ${matching.length} matching players ↗`;
      }
      dbPlayersGrid.innerHTML = visible.map(p => `
        <article class="db-player-card glass-card" data-open-player="${escapeHtml(p.name)}" tabindex="0" role="button" aria-label="Open profile for ${escapeHtml(p.name)}">
          <div class="db-card-media">
            ${mediaImgMarkup({ localPhoto: p.localPhoto, photoUrl: p.photoUrl, alt: p.name, credit: p.photoCredit })}
            <span class="db-rank-tag league-${p.league.toLowerCase()}">${escapeHtml(p.league)}${p.isStar ? ' ★' : ''}</span>
            <span class="db-era-tag">${escapeHtml(p.seasons)}</span>
          </div>
          <div class="db-card-body">
            <div class="db-player-meta">
              <span>${escapeHtml(p.country)}</span>
              <span class="db-status-tag ${p.statusGroup.startsWith('Still') ? 'status-active-rcb' : ''}">${escapeHtml(p.status)}</span>
            </div>
            <h3>${escapeHtml(p.name)}</h3>
            <p class="db-player-role">${escapeHtml(p.role)}</p>
            <div class="db-mini-metrics">
              <span><strong>${fmtNum(p.matches)}</strong> Mat</span>
              <span><strong>${fmtNum(p.runs)}</strong> Runs</span>
              <span><strong>${fmtNum(p.wickets)}</strong> Wkts</span>
            </div>
            ${p.statusDetail ? `<small class="db-player-note">${escapeHtml(p.statusDetail)}</small>` : ''}
            ${existingPhotoCreditMarkup(existingPlayerPhoto(p.name))}
          </div>
        </article>
      `).join('');
    }

    [fLeague, fStatus, fRole, fCountry, fSort, fStarOnly].forEach(ctrl => ctrl?.addEventListener('change', () => {
      showAll223 = false;
      renderDbPlayers();
    }));
    fSearch?.addEventListener('input', () => {
      showAll223 = false;
      renderDbPlayers();
    });
    fMoreBtn?.addEventListener('click', () => {
      showAll223 = !showAll223;
      renderDbPlayers();
    });
    renderDbPlayers();
  }

  const squadOnlyBody = document.querySelector('#db-squad-only-body');
  if (squadOnlyBody) {
    squadOnlyBody.innerHTML = db.squadOnly.map(s => `
      <tr>
        <th scope="row">${escapeHtml(s.name)}</th>
        <td><span class="db-pill league-${s.league.toLowerCase()}">${escapeHtml(s.league)}</span></td>
        <td>${escapeHtml(s.country)}</td>
        <td>${escapeHtml(s.role)}</td>
        <td>${escapeHtml(s.seasonsInSquad || '—')}</td>
        <td>${escapeHtml(s.note)}</td>
      </tr>
    `).join('');
  }

  // 3. Seasons Page: 23 Official Records + 23 Seasons (IPL & WPL) + 10 Captains Timeline (seasons.html)
  const recordsGrid = document.querySelector('#sheet-records-grid');
  const recordsFilter = document.querySelector('#sheet-records-filter');
  if (recordsGrid) {
    let recLeague = 'all';
    function renderSheetRecords() {
      const list = db.records.filter(r => recLeague === 'all' || r.league === recLeague);
      recordsGrid.innerHTML = list.map(r => `
        <article class="db-record-card glass-card">
          <div class="db-badge-row">
            <span class="db-pill league-${r.league.toLowerCase()}">${escapeHtml(r.league)} RECORD</span>
            <span class="db-pill">${escapeHtml(r.seasonDate)}</span>
          </div>
          <strong class="db-record-val">${escapeHtml(r.value)}</strong>
          <h3>${escapeHtml(r.record)}</h3>
          <p class="db-record-holder">Holder: <strong>${escapeHtml(r.holder)}</strong></p>
          <p class="db-record-note">${escapeHtml(r.note)}</p>
        </article>
      `).join('');
    }
    recordsFilter?.addEventListener('click', event => {
      const btn = event.target.closest('[data-rec-league]');
      if (!btn) return;
      recLeague = btn.dataset.recLeague;
      recordsFilter.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
      renderSheetRecords();
    });
    renderSheetRecords();
  }

  const sheetSeasonsBody = document.querySelector('#sheet-seasons-body');
  const sheetSeasonsFilter = document.querySelector('#sheet-seasons-filter');
  if (sheetSeasonsBody) {
    let sLeague = 'all';
    function renderSheetSeasons() {
      const list = db.seasons.filter(s => sLeague === 'all' || s.league === sLeague);
      sheetSeasonsBody.innerHTML = list.map(s => `
        <tr class="${s.isChampion ? 'champion-season-row' : ''}">
          <td><span class="db-pill league-${s.league.toLowerCase()}">${escapeHtml(s.league)}</span></td>
          <th scope="row">${s.season}</th>
          <td>${escapeHtml(s.captain)}</td>
          <td>${escapeHtml(s.headCoach)}</td>
          <td><strong class="${s.isChampion ? 'gold-champion-badge' : ''}">${s.isChampion ? '🏆 ' : ''}${escapeHtml(s.finish)}</strong></td>
          <td>${escapeHtml(s.highlight)}</td>
        </tr>
      `).join('');
    }
    sheetSeasonsFilter?.addEventListener('click', event => {
      const btn = event.target.closest('[data-s-league]');
      if (!btn) return;
      sLeague = btn.dataset.sLeague;
      sheetSeasonsFilter.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
      renderSheetSeasons();
    });
    renderSheetSeasons();
  }

  const captainsTimeline = document.querySelector('#sheet-captains-timeline');
  if (captainsTimeline) {
    captainsTimeline.innerHTML = db.captains.map(c => `
      <article class="db-captain-card glass-card" data-open-player="${escapeHtml(c.captain)}" tabindex="0" role="button">
        <div class="db-badge-row">
          <span class="db-pill league-${c.league.toLowerCase()}">${escapeHtml(c.league)} CAPTAIN</span>
          <span class="db-pill star-pill">${escapeHtml(c.seasons)}</span>
        </div>
        <h3>${escapeHtml(c.captain)}</h3>
        <p class="db-captain-country">${escapeHtml(c.country)}</p>
        <p class="db-captain-notes">${escapeHtml(c.notes)}</p>
      </article>
    `).join('');
  }

  // 4. History Page: 4 Logos Sheet Table + 31 Grounds Explorer + 20 All Teams Encyclopedia (history.html)
  const sheetLogosGrid = document.querySelector('#sheet-logos-grid');
  if (sheetLogosGrid) {
    sheetLogosGrid.innerHTML = db.logos.map(l => `
      <article class="db-logo-sheet-card glass-card">
        <div class="db-logo-sheet-img">
          <img src="${escapeHtml(l.localLogo)}" alt="${escapeHtml(l.era)} (${escapeHtml(l.yearsUsed)})" width="114" height="128" loading="lazy">
        </div>
        <div class="db-logo-sheet-copy">
          <span class="eyebrow">${escapeHtml(l.yearsUsed)} · ${escapeHtml(l.teamName)}</span>
          <h3>${escapeHtml(l.era)}</h3>
          <p>${escapeHtml(l.description)}</p>
          <p class="db-logo-change"><strong>Key Change:</strong> ${escapeHtml(l.keyChange)}</p>
          <small>Palette: ${escapeHtml(l.colours)}</small>
        </div>
      </article>
    `).join('');
  }

  const groundsGrid = document.querySelector('#sheet-grounds-grid');
  if (groundsGrid) {
    const gCountry = document.querySelector('#ground-filter-country');
    const gType = document.querySelector('#ground-filter-type');
    const gSearch = document.querySelector('#ground-filter-search');
    const gCount = document.querySelector('#sheet-grounds-count');

    function renderGrounds() {
      const list = filterGrounds(db.grounds, {
        country: gCountry?.value || 'all',
        typeFilter: gType?.value || 'all',
        query: gSearch?.value || ''
      });
      if (gCount) gCount.textContent = `Showing ${list.length} of ${db.grounds.length} grounds RCB have played at`;
      groundsGrid.innerHTML = list.map(g => {
        const linkedMoments = db.keyMoments.filter(m => g.linkedMomentIds?.includes(m.id));
        return `
          <article class="db-ground-card glass-card">
            <div class="db-card-media" data-open-ground="${escapeHtml(g.id)}" role="button" tabindex="0">
              ${mediaImgMarkup({ localPhoto: g.localPhoto, photoUrl: g.photoUrl, alt: g.name, credit: g.photoCredit })}
              <span class="db-rank-tag">${escapeHtml(g.type)}</span>
              <span class="db-era-tag">${escapeHtml(g.leagues)}</span>
            </div>
            <div class="db-card-body">
              <p class="eyebrow">${escapeHtml(g.city)}, ${escapeHtml(g.country)} · Capacity: ${escapeHtml(g.capacity)}</p>
              <h3 data-open-ground="${escapeHtml(g.id)}" style="cursor:pointer">${escapeHtml(g.name)}</h3>
              <p class="db-ground-story">${escapeHtml(g.story)}</p>
              ${linkedMoments.length ? `<div class="db-ground-links"><span class="eyebrow">LINKED KEY MOMENTS (${linkedMoments.length}):</span><div class="db-chip-list">${linkedMoments.map(m => `<button type="button" class="db-link-chip" data-open-moment="${escapeHtml(m.id)}"><strong>${escapeHtml(m.year)} · ${escapeHtml(m.title)}</strong></button>`).join('')}</div></div>` : ''}
              <small class="photo-credit">Photo: ${escapeHtml(g.photoCredit)}</small>
            </div>
          </article>
        `;
      }).join('');
    }
    gCountry?.addEventListener('change', renderGrounds);
    gType?.addEventListener('change', renderGrounds);
    gSearch?.addEventListener('input', renderGrounds);
    renderGrounds();
  }

  const allTeamsGrid = document.querySelector('#sheet-all-teams-grid');
  const allTeamsTabs = document.querySelector('#sheet-all-teams-tabs');
  if (allTeamsGrid) {
    let teamFilter = 'all';
    function renderAllTeams() {
      const list = db.allTeams.filter(t => {
        if (teamFilter === 'ipl-active') return t.league === 'IPL' && !t.status.toLowerCase().includes('defunct');
        if (teamFilter === 'ipl-defunct') return t.league === 'IPL' && t.status.toLowerCase().includes('defunct');
        if (teamFilter === 'wpl') return t.league === 'WPL';
        return true;
      });
      allTeamsGrid.innerHTML = list.map(t => `
        <article class="db-team-card glass-card ${t.isRcb ? 'rcb-highlight-card' : ''}">
          <div class="db-badge-row">
            <span class="db-pill league-${t.league.toLowerCase()}">${escapeHtml(t.league)}</span>
            <span class="db-pill ${t.status.toLowerCase().includes('defunct') ? '' : 'star-pill'}">${escapeHtml(t.status)}</span>
            <span class="db-pill">${escapeHtml(t.seasonsActive)}</span>
          </div>
          <h3>${t.isRcb ? '👑 ' : ''}${escapeHtml(t.team)}</h3>
          <p class="db-team-meta"><strong>City:</strong> ${escapeHtml(t.city)} · <strong>Home:</strong> ${escapeHtml(t.homeGround)}</p>
          <div class="db-team-honours">
            <div><span>Titles</span><strong>${escapeHtml(t.titles)}</strong></div>
            <div><span>Best / Runners-Up</span><strong>${escapeHtml(t.bestFinish)}</strong></div>
          </div>
          <p class="db-team-leaders"><strong>Captain (2026/Final):</strong> ${escapeHtml(t.captain)} · <strong>Head Coach:</strong> ${escapeHtml(t.headCoach)}</p>
          <p class="db-team-owner"><strong>Owner:</strong> ${escapeHtml(t.owner)}</p>
          <p class="db-team-notes">${escapeHtml(t.notes)}</p>
          <details class="db-team-details">
            <summary>Name &amp; Logo Evolution History</summary>
            <p><strong>Name History:</strong> ${escapeHtml(t.nameHistory)}</p>
            <p><strong>Logo History:</strong> ${escapeHtml(t.logoHistory)}</p>
          </details>
        </article>
      `).join('');
    }
    allTeamsTabs?.addEventListener('click', event => {
      const btn = event.target.closest('[data-team-filter]');
      if (!btn) return;
      teamFilter = btn.dataset.teamFilter;
      allTeamsTabs.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
      renderAllTeams();
    });
    renderAllTeams();
  }

  // 5. Moments Page: All 45 Defining Key Moments Timeline (moments.html)
  const sheetMomentsGrid = document.querySelector('#sheet-moments-grid');
  if (sheetMomentsGrid) {
    const mLeague = document.querySelector('#moment-filter-league');
    const mCategory = document.querySelector('#moment-filter-category');
    const mSearch = document.querySelector('#moment-filter-search');
    const mCount = document.querySelector('#sheet-moments-count');

    const categories = [...new Set(db.keyMoments.map(m => m.category))];
    if (mCategory) {
      mCategory.innerHTML = `<option value="all">All Categories (${categories.length})</option>` +
        categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    }

    function renderSheetMoments() {
      const list = filterKeyMoments(db.keyMoments, {
        league: mLeague?.value || 'all',
        category: mCategory?.value || 'all',
        query: mSearch?.value || ''
      });
      if (mCount) mCount.textContent = `Showing ${list.length} of ${db.keyMoments.length} defining moments (2008–2026 across IPL, WPL & CLT20)`;
      sheetMomentsGrid.innerHTML = list.map(m => `
        <article class="db-moment-card glass-card ${m.category === 'TITLE' ? 'title-gold-moment' : ''}">
          <div class="db-card-media" data-open-moment="${escapeHtml(m.id)}" role="button" tabindex="0">
            ${mediaImgMarkup({ localPhoto: null, photoUrl: m.photoUrl, alt: m.title, credit: m.photoCredit })}
            <span class="db-rank-tag ${m.category === 'TITLE' ? 'gold-tag' : ''}">${escapeHtml(m.category)}</span>
            <span class="db-era-tag">${escapeHtml(m.league)} · ${escapeHtml(m.date)}</span>
          </div>
          <div class="db-card-body">
            <h3 data-open-moment="${escapeHtml(m.id)}" style="cursor:pointer">${escapeHtml(m.title)}</h3>
            <p class="db-moment-desc">${escapeHtml(m.description)}</p>
            ${m.groundId ? `<button type="button" class="inline-db-link" data-open-ground="${escapeHtml(m.groundId)}">🏟️ ${escapeHtml(m.groundName)} ↗</button>` : ''}
            ${m.keyPlayers.length ? `<div class="db-chip-list" style="margin-top:10px">${m.keyPlayers.map(kp => `<button type="button" class="db-link-chip" data-open-player="${escapeHtml(kp)}">👤 ${escapeHtml(kp)}</button>`).join('')}</div>` : ''}
            <small class="photo-credit">Photo: ${escapeHtml(m.photoCredit)}</small>
          </div>
        </article>
      `).join('');
    }
    mLeague?.addEventListener('change', renderSheetMoments);
    mCategory?.addEventListener('change', renderSheetMoments);
    mSearch?.addEventListener('input', renderSheetMoments);
    renderSheetMoments();
  }

  let sheetSourcesContainer = document.querySelector('#sheet-sources-list');
  if (!sheetSourcesContainer && document.querySelector('#research-credits')) {
    const section = document.createElement('section');
    section.innerHTML = '<h3 class="credits-heading">Published workbook sources</h3><ul id="sheet-sources-list" class="source-list"></ul>';
    document.querySelector('#research-credits').append(section);
    sheetSourcesContainer = section.querySelector('ul');
  }
  if (sheetSourcesContainer) {
    sheetSourcesContainer.innerHTML = db.sources.map(s => `<li><strong>${escapeHtml(s.topic)}:</strong> <span>${escapeHtml(s.source)}</span></li>`).join('');
  }
  return db;
}
