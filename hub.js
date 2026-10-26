import { players } from './data.js';
import { photos } from './media.js';
import { existingPlayerPhoto, existingPlayerPhotoMarkup, existingPhotoCreditMarkup } from './player-media.js';
import { competitions, snapshots, moments, matchSpotlights, comebackStreak, logoHistory, eraChapters, highlightVideos, teamSeasons, seasonWinRate, researchSources, metrics, rankStats, compareStats } from './archive.js';

const escapeHtml = value => String(value).replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const playerById = id => {
  const player = players.find(item => item.id === id);
  if (!player) throw new Error(`Unknown archived player: ${id}`);
  return player;
};
const display = value => value === null ? '—' : String(value);
function transitionIn(element) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  element.animate([{ opacity: 0.35, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], {
    duration: 280, easing: 'cubic-bezier(.2,.7,.2,1)'
  });
}

export function photoMarkup(id, alt, className = '') {
  const playerPhoto = existingPlayerPhoto(id);
  if (playerPhoto) return existingPlayerPhotoMarkup(id, alt, className);
  const photo = photos[id];
  const expectedType = id === 'stadium' ? 'venue' : id === 'logo' ? 'crest' : 'rcb-kit';
  if (photo && photo.photoType !== expectedType) throw new Error(`Photo kit verification is missing: ${id}`);
  return photo ? `<img class="${className}${photo.width < 500 && id !== 'logo' ? ' archive-photo' : ''}" src="${photo.src}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" width="${photo.width}" height="${photo.height}">` : '';
}

export function photoCredit(id) {
  return existingPhotoCreditMarkup(existingPlayerPhoto(id) || photos[id]);
}

export function profileStats(id) {
  const matching = Object.values(snapshots).filter(item => item.records.some(record => record.playerId === id));
  if (!matching.length) return '<p class="archive-note">This player’s highlighted achievement is historical, not a statistic from the featured IPL 2025, WPL 2024, or WPL 2026 snapshots.</p>';
  return matching.map(snapshot => {
    const record = snapshot.records.find(item => item.playerId === id);
    return `<p class="eyebrow archive-snapshot">${snapshot.label} · RCB SEASON TOTALS</p><div class="profile-stat-grid">${Object.entries(metrics).map(([key, label]) => `<div><strong>${display(record[key])}</strong><span>${label}</span></div>`).join('')}</div><p class="archive-note">— = not verified, not zero. Secondary statistical sources:</p>${record.sources.map((source, index) => `<a class="profile-stats-source" href="${source}" target="_blank" rel="noopener noreferrer">Verify ${snapshot.label} · source ${index + 1} ↗</a>`).join(' ')}`;
  }).join('');
}

function avatar(id) {
  const player = playerById(id);
  return `<span class="rank-avatar" aria-hidden="true">${photoMarkup(id, '') || player.number}</span>`;
}

function logoBadgeMarkup(item, large = false) {
  return `<img class="crest-img ${large ? 'crest-img-large' : ''}" src="${item.src}" alt="${escapeHtml(item.name)} (${escapeHtml(item.years)})" width="${item.width}" height="${item.height}" loading="lazy">`;
}

export function initHub(openPlayer) {
  const logoGrid = document.querySelector('#logo-era-grid');
  const logoDetail = document.querySelector('#logo-era-detail');
  if (logoGrid && logoDetail) {
    logoGrid.innerHTML = logoHistory.map(item => `<button class="logo-era-card ${item.isCurrent ? 'current-crest' : ''}" data-logo-era="${item.id}" aria-pressed="false"><div class="logo-era-visual">${logoBadgeMarkup(item)}</div><span class="logo-era-years">${item.years}</span><strong>${item.name}</strong><small>${item.bannerText}</small></button>`).join('');
    function showLogoEra(id) {
      const item = logoHistory.find(entry => entry.id === id);
      if (!item) throw new Error(`Unknown logo era: ${id}`);
      logoGrid.querySelectorAll('button').forEach(button => {
        const active = button.dataset.logoEra === id;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      logoDetail.innerHTML = `<div class="logo-detail-crest">${logoBadgeMarkup(item, true)}</div><div class="logo-detail-copy"><p class="eyebrow">${item.years} · ${item.bannerText}</p><h3>${item.name}</h3><p>${item.summary}</p><div class="logo-meta-grid"><div><span>Kit identity</span><strong>${item.kitNote}</strong></div><div><span>Captains in this crest</span><strong>${item.captains}</strong></div></div><p class="logo-milestones"><strong>Defining milestones:</strong> ${item.milestones}</p><div class="logo-swatches" aria-label="Era color palette">${item.palette.map(hex => `<span class="logo-swatch" style="background:${hex}" title="${hex}"><code>${hex}</code></span>`).join('')}</div></div>`;
      transitionIn(logoDetail);
    }
    logoGrid.addEventListener('click', event => {
      const button = event.target.closest('[data-logo-era]');
      if (button) showLogoEra(button.dataset.logoEra);
    });
    showLogoEra('logo-2024-2026');
  }

  const eraTabs = document.querySelector('#era-tabs');
  const eraDetail = document.querySelector('#era-detail');
  if (eraTabs && eraDetail) {
    eraTabs.innerHTML = eraChapters.map(chapter => `<button class="era-tab" data-era="${chapter.id}" aria-pressed="false"><span>${chapter.era}</span><strong>${chapter.title}</strong></button>`).join('');
    function showEra(id) {
      const chapter = eraChapters.find(item => item.id === id);
      if (!chapter) throw new Error(`Unknown historical era: ${id}`);
      eraTabs.querySelectorAll('button').forEach(button => {
        const active = button.dataset.era === id;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      eraDetail.innerHTML = `<p class="eyebrow">${chapter.era}</p><h4>${chapter.title}</h4><p class="era-subtitle">${chapter.subtitle}</p><ul class="era-list">${chapter.highlights.map(line => `<li>${escapeHtml(line)}</li>`).join('')}</ul>`;
      transitionIn(eraDetail);
    }
    eraTabs.addEventListener('click', event => {
      const button = event.target.closest('[data-era]');
      if (button) showEra(button.dataset.era);
    });
    showEra('era-6');
  }
  document.querySelectorAll('[data-hero-view]').forEach(button => button.addEventListener('click', () => {
    const trophy = button.dataset.heroView === 'trophy';
    document.querySelector('#hero-colours').hidden = trophy;
    document.querySelector('#hero-trophy').hidden = !trophy;
    document.querySelectorAll('[data-hero-view]').forEach(control => {
      const active = control === button;
      control.classList.toggle('active', active);
      control.setAttribute('aria-pressed', String(active));
    });
    transitionIn(document.querySelector(trophy ? '#hero-trophy' : '#hero-colours'));
  }));
  if (document.querySelector('#matchday-photo') && document.querySelector('#matchday-content')) {
    function showMatch(id) {
      const match = matchSpotlights.find(item => item.id === id);
      if (!match) throw new Error(`Unknown archived match: ${id}`);
      document.querySelectorAll('[data-match]').forEach(button => {
        const active = button.dataset.match === id;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      document.querySelector('#matchday-photo').innerHTML = `${photoMarkup(match.photo, match.photoAlt)}<figcaption>${match.photoContext}${photoCredit(match.photo)}</figcaption>`;
      document.querySelector('#matchday-content').innerHTML = `<p class="eyebrow light">${match.date}</p><h3>${match.title}</h3><p class="matchday-description">${match.description}</p><div class="matchday-board"><div class="matchday-board-top"><span><img class="inline-crest" src="./assets/photos/rcb-logo.png" alt="" width="16" height="22">${match.label}</span><span>COMPLETED</span></div><div class="matchday-scores"><div><span class="score-badge">RCB</span><strong>${match.rcbScore}</strong><small>${match.overs[0]}</small></div><span class="versus" aria-label="versus">VS</span><div><span class="score-badge opponent">${match.opponent}</span><strong>${match.opponentScore}</strong><small>${match.overs[1]}</small></div></div><p class="matchday-result">${match.result}</p></div><a class="button button-gold" href="${match.source}" target="_blank" rel="noopener noreferrer">Read the official match report ↗</a>`;
      transitionIn(document.querySelector('#matchday-content'));
    }
    document.querySelectorAll('[data-match]').forEach(button => button.addEventListener('click', () => showMatch(button.dataset.match)));
    showMatch('ipl-2026-final');
  }

  const comebackSteps = document.querySelector('#comeback-steps');
  const comebackDetail = document.querySelector('#comeback-detail');
  if (comebackSteps && comebackDetail) {
    comebackSteps.innerHTML = comebackStreak.map(item => `<button class="comeback-step" data-comeback="${item.id}" aria-pressed="false"><span class="comeback-step-num">WIN ${item.step} / 06</span><strong>vs ${item.opponent}</strong><small>${item.date} · ${item.venue}</small><span class="comeback-step-score">${item.rcbScore}</span></button>`).join('');
    function showComeback(id) {
      const match = comebackStreak.find(item => item.id === id);
      if (!match) throw new Error(`Unknown comeback match: ${id}`);
      comebackSteps.querySelectorAll('button').forEach(button => {
        const active = button.dataset.comeback === id;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      comebackDetail.innerHTML = `<div class="comeback-detail-main"><p class="eyebrow light">STREAK MATCH ${match.step} OF 06 · ${match.date} · ${match.venue.toUpperCase()}</p><h4>${match.result}</h4><p>${match.summary}</p><p class="comeback-heroes"><strong>Key heroes:</strong> ${match.keyPerformers}</p></div><div class="comeback-detail-score"><div class="comeback-score-box"><span>RCB</span><strong>${match.rcbScore}</strong></div><div class="comeback-score-box opponent"><span>${match.opponentFull}</span><strong>${match.oppScore}</strong></div><p class="comeback-potm">POTM / Star: ${match.potm}</p><a class="text-link" href="${match.source}" target="_blank" rel="noopener noreferrer">Official IPL archive / highlights ↗</a></div>`;
      transitionIn(comebackDetail);
    }
    comebackSteps.addEventListener('click', event => {
      const button = event.target.closest('[data-comeback]');
      if (button) showComeback(button.dataset.comeback);
    });
    showComeback('csk-may-18');
  }

  const leagueDetail = document.querySelector('#league-detail');
  if (leagueDetail) {
    function showLeague(id) {
      const league = competitions[id];
      if (!league) throw new Error(`Unknown competition: ${id}`);
      document.querySelectorAll('[data-league]').forEach(button => {
        const active = button.dataset.league === id;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      leagueDetail.innerHTML = `<div><p class="eyebrow">${league.label}</p><h3>${league.title}</h3><p>${league.description}</p><a class="text-link" href="${league.source}" target="_blank" rel="noopener noreferrer">Explore the competition source ↗</a></div><div class="league-highlights">${league.highlights.map(highlight => `<div><strong>${highlight.value}</strong><span>${highlight.label}</span></div>`).join('')}</div>`;
      transitionIn(leagueDetail);
    }
    document.querySelectorAll('[data-league]').forEach(button => button.addEventListener('click', () => showLeague(button.dataset.league)));
    showLeague('ipl');
  }

  const seasonLeague = document.querySelector('#season-league');
  const seasonSelect = document.querySelector('#season-select');
  const seasonChart = document.querySelector('#season-chart');
  if (seasonLeague && seasonSelect && seasonChart) {
    seasonChart.innerHTML = teamSeasons.map(record => `<button class="season-bar" data-record-year="${record.year}" aria-pressed="false" aria-label="${record.year}: ${record.won} wins in ${record.played} matches, ${seasonWinRate(record)} percent win rate"><span class="season-bar-track"><span style="height:${seasonWinRate(record)}%"></span></span><strong>${String(record.year).slice(2)}</strong></button>`).join('');
    document.querySelector('#season-table-body').innerHTML = teamSeasons.map(record => `<tr><th scope="row">${record.year}</th><td>${record.captain}</td><td>${record.played}</td><td>${record.won}</td><td>${record.lost}</td><td>${record.nrTied}</td><td>${record.leaguePosition}</td><td>${record.finalResult}</td><td>${record.highlight}</td></tr>`).join('');
    seasonChart.addEventListener('click', event => {
      const button = event.target.closest('[data-record-year]');
      if (!button) return;
      seasonSelect.value = button.dataset.recordYear;
      showSeason();
    });
    function showSeason() {
      const competition = competitions[seasonLeague.value];
      const season = competition.seasons.find(item => item.year === Number(seasonSelect.value));
      if (!season) throw new Error('Archived season was not found');
      document.querySelector('#season-result').innerHTML = `<span class="season-year">${season.year}</span><h3>${season.finish}</h3><p>${season.stage}</p>`;
      document.querySelector('#season-source').href = season.source || competition.seasonSource;
      const record = teamSeasons.find(item => item.year === season.year);
      document.querySelector('#ipl-record-panel').hidden = seasonLeague.value !== 'ipl';
      if (seasonLeague.value === 'ipl') {
        seasonChart.querySelectorAll('button').forEach(button => {
          const active = Number(button.dataset.recordYear) === season.year;
          button.classList.toggle('active', active);
          button.setAttribute('aria-pressed', String(active));
        });
        document.querySelector('#team-season-summary').innerHTML = `<div class="team-season-metrics"><div><strong>${record.year}</strong><span>${record.era} · ${record.captain}</span></div><div><strong>${record.won}<small>W – ${record.lost}L (${record.nrTied})</small></strong><span>${record.played} matches played</span></div><div><strong>${seasonWinRate(record)}<small>%</small></strong><span>Win rate · completed games</span></div><div><strong>#${record.leaguePosition} → ${record.finalResult}</strong><span>League rank &amp; final finish</span></div></div><p class="season-headline"><strong>${record.highlight}</strong></p><p>${record.story}</p>`;
      }
    }
    function setSeasons() {
      seasonSelect.innerHTML = [...competitions[seasonLeague.value].seasons].reverse().map(season => `<option value="${season.year}">${season.year}</option>`).join('');
      showSeason();
    }
    seasonLeague.addEventListener('change', setSeasons);
    seasonSelect.addEventListener('change', showSeason);
    setSeasons();
  }

  const statsSeason = document.querySelector('#stats-season');
  const statsMetric = document.querySelector('#stats-metric');
  const compareA = document.querySelector('#compare-a');
  const compareB = document.querySelector('#compare-b');
  if (statsSeason && statsMetric && compareA && compareB) {
    function renderLeaderboard() {
      const snapshot = snapshots[statsSeason.value];
      const ranked = rankStats(statsSeason.value, statsMetric.value);
      const maximum = Math.max(0, ...ranked.map(record => record[statsMetric.value] ?? 0));
      document.querySelector('#leaderboard-caption').textContent = `${snapshot.label} · Featured RCB players · Ranked by ${metrics[statsMetric.value].toLowerCase()}`;
      document.querySelector('#stats-source').href = snapshot.source;
      document.querySelector('#leaderboard-body').innerHTML = ranked.map((record, index) => {
        const player = playerById(record.playerId);
        const value = record[statsMetric.value];
        const width = value === null || maximum === 0 ? 0 : value / maximum * 100;
        return `<tr><td>${index + 1}</td><td><button class="rank-player" data-profile="${player.id}">${avatar(player.id)}<span>${player.name}<small>${player.role}</small><span class="rank-meter" aria-hidden="true"><span style="width:${width}%"></span></span></span></button></td>${['matches', 'runs', 'wickets', 'strikeRate'].map(key => `<td class="${key === statsMetric.value ? 'rank-active' : ''}">${display(record[key])}</td>`).join('')}</tr>`;
      }).join('');
    }
    document.querySelector('#leaderboard-body').addEventListener('click', event => {
      const button = event.target.closest('[data-profile]');
      if (button) openPlayer(button.dataset.profile);
    });
    function renderComparison() {
      const result = document.querySelector('#comparison-result');
      if (compareA.value === compareB.value) {
        result.innerHTML = '<p class="compare-warning" role="status">Choose two different players for a head-to-head comparison.</p>';
        return;
      }
      const comparison = compareStats(statsSeason.value, compareA.value, compareB.value);
      result.innerHTML = `<div class="comparison-summary">${[comparison.a, comparison.b].map(record => {
        const player = playerById(record.playerId);
        return `<div class="compare-person">${avatar(player.id)}<strong>${player.name}</strong><small>${snapshots[statsSeason.value].label} · ${player.role}</small></div>`;
      }).join('')}</div>${comparison.rows.map(row => `<div class="compare-row"><div class="compare-value">${display(row.a)}<div class="compare-bar" aria-hidden="true"><span style="width:${row.leftWidth}%"></span></div></div><span>${row.label}</span><div class="compare-value right">${display(row.b)}<div class="compare-bar" aria-hidden="true"><span style="width:${row.rightWidth}%"></span></div></div></div>`).join('')}<p class="compare-note">Same competition, same season. Bar lengths are relative to these two players only. More is not always better: role and opportunity matter.</p>`;
    }
    function setComparisonPlayers() {
      const options = snapshots[statsSeason.value].records.map(record => {
        const player = playerById(record.playerId);
        return `<option value="${player.id}">${player.name}</option>`;
      }).join('');
      compareA.innerHTML = options;
      compareB.innerHTML = options;
      compareB.selectedIndex = 1;
      renderComparison();
    }
    statsSeason.addEventListener('change', () => {
      renderLeaderboard();
      setComparisonPlayers();
    });
    statsMetric.addEventListener('change', renderLeaderboard);
    compareA.addEventListener('change', renderComparison);
    compareB.addEventListener('change', renderComparison);
    renderLeaderboard();
    setComparisonPlayers();
  }

  let momentLeague = 'all';
  let momentIndex = 0;
  const momentDialog = document.querySelector('#moment-dialog');
  const momentsGrid = document.querySelector('#moments-grid');
  if (momentDialog && momentsGrid) {
    const filteredMoments = () => moments.filter(moment => momentLeague === 'all' || moment.league === momentLeague);
    function renderMoments() {
      const visible = filteredMoments();
      momentsGrid.innerHTML = visible.map(moment => `<button class="moment-card" data-moment="${moment.id}" aria-label="Explore ${moment.title}"><div class="moment-image">${photoMarkup(moment.photo, moment.photoAlt)}<span>${moment.league.toUpperCase()} · ${moment.date}</span><i aria-hidden="true">↗</i></div><div class="moment-copy"><p class="eyebrow">${moment.tag}</p><h3>${moment.title}</h3><p>${moment.summary}</p></div></button>`).join('');
      document.querySelector('#moments-status').textContent = `${visible.length} moments shown`;
    }
    function showMoment() {
      const visible = filteredMoments();
      const moment = visible[momentIndex];
      if (!moment) throw new Error('Historical moment was not found');
      document.querySelector('#moment-content').innerHTML = `${photoMarkup(moment.photo, moment.photoAlt, 'moment-photo')}<p class="eyebrow">${moment.league.toUpperCase()} · ${moment.date}</p><h2 id="moment-title">${moment.title}</h2><p>${moment.story}</p><div class="moment-fact">${moment.fact}</div><p class="archive-note">${moment.photoContext}</p>${photoCredit(moment.photo)}<a class="button button-red" href="${moment.source}" target="_blank" rel="noopener noreferrer">${moment.linkLabel} ↗</a>`;
      document.querySelector('#moment-counter').textContent = `${momentIndex + 1} / ${visible.length}`;
      document.querySelector('#moment-prev').disabled = momentIndex === 0;
      document.querySelector('#moment-next').disabled = momentIndex === visible.length - 1;
    }
    document.querySelectorAll('[data-moment-league]').forEach(button => button.addEventListener('click', () => {
      momentLeague = button.dataset.momentLeague;
      document.querySelectorAll('[data-moment-league]').forEach(filter => {
        const active = filter === button;
        filter.classList.toggle('active', active);
        filter.setAttribute('aria-pressed', String(active));
      });
      renderMoments();
    }));
    momentsGrid.addEventListener('click', event => {
      const card = event.target.closest('[data-moment]');
      if (!card) return;
      momentIndex = filteredMoments().findIndex(moment => moment.id === card.dataset.moment);
      showMoment();
      momentDialog.showModal();
    });
    function moveMoment(direction) {
      const next = momentIndex + direction;
      if (next < 0 || next >= filteredMoments().length) return;
      momentIndex = next;
      showMoment();
    }
    document.querySelector('#moment-prev').addEventListener('click', () => moveMoment(-1));
    document.querySelector('#moment-next').addEventListener('click', () => moveMoment(1));
    momentDialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        moveMoment(event.key === 'ArrowLeft' ? -1 : 1);
      }
    });
    renderMoments();
  }

  const highlightGrid = document.querySelector('#highlight-grid');
  if (highlightGrid) {
    highlightGrid.innerHTML = highlightVideos.map((video, index) => `<a class="highlight-card" href="${video.source}" target="_blank" rel="noopener noreferrer"><div class="highlight-art"><span>${String(index + 1).padStart(2, '0')}</span><i aria-hidden="true">▶</i><small>${video.league.toUpperCase()} · ${video.year}</small></div><div class="highlight-copy"><p class="eyebrow">${video.category}</p><h4>${video.title}</h4><p>${video.description}</p><span>Watch on ${video.league === 'wpl' ? 'WPLT20' : 'IPLT20'} ↗</span></div></a>`).join('');
    function scrollHighlights(direction) {
      const card = highlightGrid.querySelector('.highlight-card');
      highlightGrid.scrollBy({ left: direction * (card.getBoundingClientRect().width + 20), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
    document.querySelector('#watch-prev').addEventListener('click', () => scrollHighlights(-1));
    document.querySelector('#watch-next').addEventListener('click', () => scrollHighlights(1));
  }

  if (document.querySelector('#research-credits')) {
    document.querySelector('#research-credits').innerHTML = `<h3 class="credits-heading">Research &amp; statistical snapshots</h3><ul class="source-list">${researchSources.map(source => `<li><a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.title}</a><small> · ${source.scope}</small></li>`).join('')}</ul>`;
  }
  if (document.querySelector('#photo-credits')) {
    document.querySelector('#photo-credits').innerHTML = Object.entries(photos).map(([id, photo]) => `<div class="credit-entry"><strong>${id === 'stadium' ? 'M. Chinnaswamy Stadium' : id === 'logo' ? 'Royal Challengers Bengaluru Crest (2024–2026)' : playerById(id).name}</strong>${existingPhotoCreditMarkup(photo)}</div>`).join('');
  }
}
