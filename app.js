import { players, milestones, questions, filterPlayers, quizVerdict } from './data.js';
import { initHub, photoMarkup, photoCredit, profileStats } from './hub.js';
import { initSeasonArchive, initRosters } from './seasonal.js';
import { initInfographicExperience } from './infographic.js';

const grid = document.querySelector('#player-grid');
const search = document.querySelector('#player-search');
let selectedTeam = 'all';
let expandedPlayers = false;
const morePlayers = document.querySelector('#players-more');

function jersey(player, large = false) {
  return `<div class="jersey-scene ${large ? 'jersey-large' : ''}" aria-hidden="true"><div class="jersey"><img class="jersey-crest" src="./assets/photos/rcb-logo.png" alt="" width="22" height="31"><span class="jersey-brand">BENGALURU</span><span class="jersey-number">${player.number}</span><span class="jersey-bottom">PLAY BOLD</span></div></div>`;
}

function playerVisual(player, large = false) {
  return photoMarkup(player.id, `${player.name} in RCB franchise kit`, 'player-photo') ||
    `${jersey(player, large)}<span class="photo-unavailable">ILLUSTRATION · RCB-KIT PHOTO NOT VERIFIED</span>`;
}

function renderPlayers() {
  const matching = filterPlayers(selectedTeam, search.value).sort((a, b) => Number(Boolean(photoMarkup(b.id, ''))) - Number(Boolean(photoMarkup(a.id, ''))));
  const canExpand = selectedTeam === 'all' && !search.value.trim() && matching.length > 8;
  const visible = canExpand && !expandedPlayers ? matching.slice(0, 8) : matching;
  grid.innerHTML = visible.map(player => `<button class="player-card ${player.accent}" data-player="${player.id}" aria-label="View ${player.name}'s profile"><div class="player-art ${photoMarkup(player.id, '') ? 'has-photo' : ''}"><span class="player-label">${player.label}</span><span class="player-team">${player.team === 'women' ? 'WPL · 2024' : player.team === 'men' ? 'IPL · 2025' : 'RCB ALUMNI'}</span>${playerVisual(player)}<span class="player-open" aria-hidden="true">↗</span></div><div class="player-info"><p>${player.role} <span>${player.country}</span></p><h3>${player.name}</h3><span class="player-social">${player.socialHandle}</span><div class="player-stat"><strong>${player.stat}</strong><span>${player.statLabel}</span></div></div></button>`).join('');
  if (!visible.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No challengers found. Try another name or team.';
    grid.append(empty);
  }
  morePlayers.hidden = !canExpand;
  morePlayers.setAttribute('aria-expanded', String(expandedPlayers));
  morePlayers.textContent = expandedPlayers ? 'Show featured players ↑' : `View all ${matching.length} challengers ↗`;
  document.querySelector('#player-status').textContent = `Showing ${visible.length} of ${matching.length} matching players`;
}

const playerDialog = document.querySelector('#player-dialog');
function openPlayer(id) {
  const player = players.find(item => item.id === id);
  if (!player) throw new Error('Player profile was not found');
  const officialTeam = player.team === 'women' ? 'https://www.wplt20.com/teams/royal-challengers-bengaluru' : 'https://www.iplt20.com/teams/royal-challengers-bengaluru/squad';
  document.querySelector('#profile-content').innerHTML = `<div class="profile-art ${player.accent} ${photoMarkup(id, '') ? 'has-photo' : ''}">${playerVisual(player, true)}</div><p class="eyebrow">${player.label}</p><h2 id="profile-name">${player.name}</h2><p class="profile-role">${player.role} · ${player.country}</p><p>${player.bio}</p><div class="profile-highlight"><strong>${player.stat}</strong><span>${player.statLabel}</span></div>${profileStats(id)}${photoCredit(id)}<p class="archive-note">Historical profile · ${player.team === 'women' ? '2024–2026 WPL archive' : player.team === 'men' ? '2025–2026 IPL archive' : 'RCB icons and alumni archive'}. Verified player photos show solo portraits in RCB kit. Otherwise, the jersey is an illustration, not a player photograph.</p><div class="profile-links"><a class="profile-stats-source" href="${player.socialUrl}" target="_blank" rel="noopener noreferrer">Latest solo photos on ${player.socialHandle} ↗</a> <a class="profile-stats-source" href="${officialTeam}" target="_blank" rel="noopener noreferrer">Official ${player.team === 'women' ? 'WPL' : 'IPL'} team directory ↗</a></div>`;
  playerDialog.showModal();
}

if (grid && search && morePlayers) {
  document.querySelectorAll('[data-team]').forEach(button => button.addEventListener('click', () => {
    selectedTeam = button.dataset.team;
    expandedPlayers = false;
    document.querySelectorAll('[data-team]').forEach(filter => {
      const active = filter === button;
      filter.classList.toggle('active', active);
      filter.setAttribute('aria-pressed', String(active));
    });
    renderPlayers();
  }));
  search.addEventListener('input', () => {
    expandedPlayers = false;
    renderPlayers();
  });
  morePlayers.addEventListener('click', () => {
    expandedPlayers = !expandedPlayers;
    renderPlayers();
  });
  renderPlayers();
  grid.addEventListener('click', event => {
    const card = event.target.closest('[data-player]');
    if (card) openPlayer(card.dataset.player);
  });
}
document.addEventListener('click', event => {
  const quickPlayer = event.target.closest('[data-quick-player]');
  if (quickPlayer && playerDialog) openPlayer(quickPlayer.dataset.quickPlayer);
});

document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.modal-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
});
document.querySelector('#sources-button')?.addEventListener('click', () => document.querySelector('#sources-dialog')?.showModal());
initHub(openPlayer);
initSeasonArchive();
initRosters();
initInfographicExperience();

const years = document.querySelector('#timeline-years');
if (years) {
  years.innerHTML = milestones.map(milestone => `<button data-year="${milestone.year}" aria-pressed="false">${milestone.year}<span aria-hidden="true">↗</span></button>`).join('');
  function showMilestone(year) {
    const milestone = milestones.find(item => item.year === year);
    if (!milestone) throw new Error('Timeline milestone was not found');
    years.querySelectorAll('button').forEach(button => {
      const active = button.dataset.year === year;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelector('#timeline-story').innerHTML = `<span class="timeline-watermark" aria-hidden="true">${milestone.year}</span><p class="eyebrow">${milestone.tag}</p><h3>${milestone.title}</h3><p>${milestone.text}</p><div class="timeline-detail"><span>${milestone.detail}</span><span>${String(milestones.indexOf(milestone) + 1).padStart(2, '0')} / ${String(milestones.length).padStart(2, '0')}</span></div>`;
  }
  years.addEventListener('click', event => {
    const button = event.target.closest('[data-year]');
    if (button) showMilestone(button.dataset.year);
  });
  showMilestone('2026');
}

let questionIndex = 0;
let score = 0;
let answered = false;
const quiz = document.querySelector('#quiz-panel');
if (quiz) {
  function renderQuestion() {
    answered = false;
    const question = questions[questionIndex];
    quiz.innerHTML = `<div class="quiz-top"><span>THE CHALLENGER CHECK</span><span>${String(questionIndex + 1).padStart(2, '0')} / 05</span></div><div class="quiz-progress"><span style="width:${questionIndex / questions.length * 100}%"></span></div><h3 tabindex="-1" id="quiz-question">${question.question}</h3><div class="quiz-options">${question.options.map((option, index) => `<button data-answer="${index}"><span>${String.fromCharCode(65 + index)}</span>${option}</button>`).join('')}</div><p class="quiz-feedback" role="status"></p><button class="quiz-next" hidden>Next question <span aria-hidden="true">→</span></button>`;
  }
  quiz.addEventListener('click', event => {
    const answer = event.target.closest('[data-answer]');
    if (answer && !answered) {
      answered = true;
      const question = questions[questionIndex];
      const correct = Number(answer.dataset.answer) === question.answer;
      if (correct) score++;
      quiz.querySelectorAll('[data-answer]').forEach(button => {
        button.disabled = true;
        if (Number(button.dataset.answer) === question.answer) button.classList.add('correct');
        else if (button === answer) button.classList.add('incorrect');
      });
      quiz.querySelector('.quiz-feedback').textContent = `${correct ? 'Exactly right.' : 'Not quite.'} ${question.explanation}`;
      const next = quiz.querySelector('.quiz-next');
      next.hidden = false;
      if (questionIndex === questions.length - 1) next.innerHTML = 'See my result <span aria-hidden="true">→</span>';
    }
    if (event.target.closest('.quiz-next')) {
      questionIndex++;
      if (questionIndex < questions.length) {
        renderQuestion();
        quiz.querySelector('#quiz-question').focus();
      } else {
        quiz.innerHTML = `<p class="eyebrow">THE CHALLENGER CHECK · COMPLETE</p><div class="quiz-result-score">${score}<span>/5</span></div><h3 tabindex="-1" id="quiz-result">${quizVerdict(score)}</h3><p>Whatever the score, there's always room for one more Challenger.</p><button class="button button-red" id="quiz-restart">Play again <span aria-hidden="true">↗</span></button>`;
        quiz.querySelector('#quiz-result').focus();
      }
    }
    if (event.target.closest('#quiz-restart')) {
      questionIndex = 0;
      score = 0;
      renderQuestion();
      quiz.querySelector('#quiz-question').focus();
    }
  });
  renderQuestion();
}

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu() {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');
  nav.classList.remove('open');
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav.classList.toggle('open', open);
});
nav.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    toggle.focus();
  }
});
const sections = [...document.querySelectorAll('#champions, #competitions, #squad, #season-stats, #moments')];
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    nav.querySelectorAll('a').forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
  }
}, { rootMargin: '-15% 0px -55% 0px' });
sections.forEach(section => observer.observe(section));

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-revealed');
      revealObserver.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  document.querySelectorAll('.section-heading, .league-tabs, .comparison, .timeline-layout, .official-gallery').forEach(element => {
    if (element.getBoundingClientRect().top < innerHeight) return;
    element.classList.add('reveal-ready');
    revealObserver.observe(element);
  });
  document.addEventListener('focusin', event => {
    event.target.closest('.reveal-ready')?.classList.add('is-revealed');
  });
}
