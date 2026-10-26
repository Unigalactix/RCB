import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { photos } from '../media.js';
import { photoMarkup, photoCredit } from '../hub.js';
import { existingPlayerPhoto, existingPlayerPhotoMarkup, existingPhotoCreditMarkup, registerPlayerPhotoReferences, playerPhotoReferenceMarkup } from '../player-media.js';

test('featured IDs, sheet slugs and exact player names reuse the same existing photos', () => {
  for (const [id, slug, name] of [
    ['virat', 'virat-kohli', 'Virat Kohli'],
    ['green', 'cameron-green', 'Cameron Green'],
    ['dravid', 'rahul-dravid', 'Rahul Dravid']
  ]) {
    for (const identity of [id, slug, name, name.toUpperCase()]) {
      assert.equal(existingPlayerPhoto(identity), photos[id]);
      assert.match(existingPlayerPhotoMarkup(identity, name), /data-shared-player-photo/);
      assert.ok(photoMarkup(identity, name).includes(`src="${photos[id].src}"`));
    }
  }
  for (const name of ['Smriti Mandhana', 'Rahul', 'Kohli', 'unknown', 'stadium']) {
    assert.equal(existingPlayerPhoto(name), null);
  }
  assert.equal(existingPlayerPhotoMarkup('Smriti Mandhana', 'Smriti'), '');
});

test('photo references do not become displayable photos and retain publisher credits', () => {
  registerPlayerPhotoReferences([{ name: 'Smriti Mandhana', photoUrl: 'https://example.com/smriti.jpg', photoCredit: 'Publisher & photographer' }]);
  const reference = playerPhotoReferenceMarkup('smriti');
  assert.match(reference, /View photo at source/);
  assert.match(reference, /Publisher &amp; photographer/);
  assert.match(reference, /reuse permission not verified/);
  assert.match(reference, /rel="noopener noreferrer"/);
  assert.doesNotMatch(reference, /<img/);
  assert.equal(photoMarkup('smriti', 'Smriti'), '');
  assert.equal(playerPhotoReferenceMarkup('virat'), '');
  assert.throws(() => registerPlayerPhotoReferences([{ name: 'Smriti Mandhana', photoUrl: 'javascript:alert(1)' }]), /Unsupported photo reference/);
  assert.equal(playerPhotoReferenceMarkup('smriti'), reference);
  registerPlayerPhotoReferences([]);
  assert.equal(playerPhotoReferenceMarkup('smriti'), '');
});

test('all featured sheet references match without changing the imported source of truth', async () => {
  const db = JSON.parse(await readFile(new URL('../assets/data/database.json', import.meta.url), 'utf8'));
  const original = JSON.stringify(db);
  registerPlayerPhotoReferences(db.players);
  for (const id of ['smriti', 'perry', 'rajat', 'bell', 'salt', 'krunal', 'richa']) {
    assert.match(playerPhotoReferenceMarkup(id), /View photo at source/);
  }
  assert.equal(JSON.stringify(db), original);
  registerPlayerPhotoReferences([]);
});

test('credits describe the displayed asset instead of an unrelated spreadsheet or Commons photo', () => {
  assert.match(photoCredit('virat'), /user-provided/);
  assert.doesNotMatch(photoCredit('virat'), /2015|2026|Bollywood|commons.wikimedia/);
  assert.match(photoCredit('Cameron Green'), /Agashe Foundation/);
  assert.match(photoCredit('Cameron Green'), /solo portrait/);
  assert.match(existingPhotoCreditMarkup(existingPlayerPhoto('Rahul Dravid')), /Chubby Chandru/);
  assert.match(photoCredit('Rahul Dravid'), /CC BY 2.0/);
  assert.match(existingPlayerPhotoMarkup('virat', '" onerror="bad()'), /&quot; onerror=&quot;bad/);
});
