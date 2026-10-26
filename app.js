import { players, milestones, seasons, questions, filterPlayers, quizVerdict } from './data.js';

const grid = document.querySelector('#player-grid');
const search = document.querySelector('#player-search');
let selectedTeam = 'all';

function jersey(player, large = false) {
  return `<div class="jersey-scene ${large ? 'jersey-large' : ''}" aria-hidden="true"><div class="jersey"><span class="jersey-brand">BENGALURU</span><span class="jersey-number">${player.number}</span><span class="jersey-bottom">PLAY BOLD</span></div></div>`;
}

function renderPlayers() {
  const visible = filterPlayers(selectedTeam, search.value);
  grid.innerHTML = visible.map(player => `<button class="player-card ${player.accent}" data-player="${player.id}" aria-label="View ${player.name}'s profile"><div class="player-art"><span class="player-label">${player.label}</span><span class="player-team">${player.team === 'women' ? 'WPL · 2024' : player.team === 'men' ? 'IPL · 2025' : 'RCB LEGEND'}</span>${jersey(player)}<span class="player-open" aria-hidden="true">↗</span></div><div class="player-info"><p>${player.role} <span>${player.country}</span></p><h3>${player.name}</h3><div class="player-stat"><strong>${player.stat}</strong><span>${player.statLabel}</span></div></div></button>`).join('');
  if (!visible.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No challengers found. Try another name or team.';
    grid.append(empty);
  }
  document.querySelector('#player-status').textContent = `${visible.length} players shown`;
}

document.querySelectorAll('[data-team]').forEach(button => button.addEventListener('click', () => {
  selectedTeam = button.dataset.team;
  document.querySelectorAll('[data-team]').forEach(filter => {
    const active = filter === button;
    filter.classList.toggle('active', active);
    filter.setAttribute('aria-pressed', String(active));
  });
  renderPlayers();
}));
search.addEventListener('input', renderPlayers);
renderPlayers();

const playerDialog = document.querySelector('#player-dialog');
grid.addEventListener('click', event => {
  const card = event.target.closest('[data-player]');
  if (!card) return;
  const player = players.find(item => item.id === card.dataset.player);
  if (!player) throw new Error('Player profile was not found');
  document.querySelector('#profile-content').innerHTML = `<div class="profile-art ${player.accent}">${jersey(player, true)}</div><p class="eyebrow">${player.label}</p><h2 id="profile-name">${player.name}</h2><p class="profile-role">${player.role} · ${player.country}</p><p>${player.bio}</p><div class="profile-highlight"><strong>${player.stat}</strong><span>${player.statLabel}</span></div><p class="archive-note">Historical profile · ${player.team === 'women' ? '2024 WPL archive' : player.team === 'men' ? '2025 IPL archive' : 'RCB legends archive'}</p>`;
  playerDialog.showModal();
});

document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.modal-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
});
document.querySelector('#sources-button').addEventListener('click', () => document.querySelector('#sources-dialog').showModal());

const years = document.querySelector('#timeline-years');
years.innerHTML = milestones.map(milestone => `<button data-year="${milestone.year}" aria-pressed="false">${milestone.year}<span aria-hidden="true">↗</span></button>`).join('');
function showMilestone(year) {
  const milestone = milestones.find(item => item.year === year);
  if (!milestone) throw new Error('Timeline milestone was not found');
  years.querySelectorAll('button').forEach(button => {
    const active = button.dataset.year === year;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('#timeline-story').innerHTML = `<span class="timeline-watermark" aria-hidden="true">${milestone.year}</span><p class="eyebrow">${milestone.tag}</p><h3>${milestone.title}</h3><p>${milestone.text}</p><div class="timeline-detail"><span>${milestone.detail}</span><span>${milestone.number} / 06</span></div>`;
}
years.addEventListener('click', event => {
  const button = event.target.closest('[data-year]');
  if (button) showMilestone(button.dataset.year);
});
showMilestone('2025');

const seasonSelect = document.querySelector('#season-select');
seasonSelect.innerHTML = [...seasons].reverse().map(season => `<option value="${season.year}">${season.year}</option>`).join('');
function showSeason() {
  const season = seasons.find(item => item.year === Number(seasonSelect.value));
  if (!season) throw new Error('Season was not found');
  document.querySelector('#season-result').innerHTML = `<span class="season-year">${season.year}</span><h3>${season.finish}</h3><p>${season.stage}</p>`;
}
seasonSelect.addEventListener('change', showSeason);
showSeason();

let questionIndex = 0;
let score = 0;
let answered = false;
const quiz = document.querySelector('#quiz-panel');
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
const sections = [...document.querySelectorAll('#home, #squad, #legacy, #clubhouse')];
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    nav.querySelectorAll('a').forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
  }
}, { rootMargin: '-15% 0px -55% 0px' });
sections.forEach(section => observer.observe(section));
