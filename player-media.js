import { players } from './data.js';
import { photos } from './media.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const normalize = value => String(value ?? '').toLocaleLowerCase('en').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
let references = new Map();

function featuredPlayer(identity) {
  const key = normalize(identity);
  return players.find(player => player.id === key || normalize(player.name) === key);
}

export function existingPlayerPhoto(identity) {
  const player = featuredPlayer(identity);
  const photo = player ? photos[player.id] : null;
  if (!photo) return null;
  if (photo.photoType !== 'rcb-kit') throw new Error(`RCB-kit photo verification is missing for ${player.name}.`);
  return photo;
}

export function registerPlayerPhotoReferences(records) {
  const next = new Map();
  for (const record of records) {
    const player = featuredPlayer(record.name);
    if (!player || !record.photoUrl) continue;
    const url = new URL(record.photoUrl);
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error(`Unsupported photo reference URL for ${record.name}.`);
    next.set(player.id, { url: url.href, credit: record.photoCredit });
  }
  references = next;
}

export function playerPhotoReferenceMarkup(identity) {
  const player = featuredPlayer(identity);
  const reference = player ? references.get(player.id) : null;
  if (!reference || existingPlayerPhoto(identity)) return '';
  return `<div class="player-photo-reference"><a href="${escapeHtml(reference.url)}" target="_blank" rel="noopener noreferrer" aria-label="View ${escapeHtml(player.name)} photo at its source">View photo at source ↗</a><small>Source credit: ${escapeHtml(reference.credit || 'Not supplied')}. Reference only; reuse permission not verified.</small></div>`;
}

export function existingPhotoCreditMarkup(photo) {
  if (!photo) return '';
  if (photo.license === 'User-supplied local asset') {
    return `<p class="photo-credit">Photo: user-provided RCB-kit image · <a href="${escapeHtml(photo.src)}" target="_blank" rel="noopener noreferrer">View supplied image</a>. Photographer, capture date and reuse license were not supplied.</p>`;
  }
  return `<p class="photo-credit">Photo: ${escapeHtml(photo.author)} · <a href="${escapeHtml(photo.source)}" target="_blank" rel="noopener noreferrer">Source</a> · <a href="${escapeHtml(photo.licenseUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(photo.license)}</a> · ${photo.width} × ${photo.height}px. ${escapeHtml(photo.changes)}</p>`;
}

export function existingPlayerPhotoMarkup(identity, alt, className = '') {
  const photo = existingPlayerPhoto(identity);
  if (!photo) return '';
  return `<img class="${escapeHtml(className)}${photo.width < 500 ? ' archive-photo' : ''}" src="${escapeHtml(photo.src)}" alt="${escapeHtml(alt)}" width="${photo.width}" height="${photo.height}" loading="lazy" decoding="async" data-shared-player-photo>`;
}
