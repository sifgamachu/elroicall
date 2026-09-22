import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { AUTUMN_READINGS } from '../src/lib/autumn-readings.ts';
import { READING_ARTWORK, artworkForDay, READING_SCENES, sceneSource } from '../src/lib/reading-artwork.ts';
import { activeSeason, SEASONAL_CAMPAIGN } from '../src/lib/seasonal-experience.ts';

test('every day has artwork referenced to a chapter actually assigned on that day', () => {
  assert.equal(READING_ARTWORK.length, 84);
  for (const reading of AUTUMN_READINGS) {
    const art = artworkForDay(reading.day);
    assert.ok(art && art.title && READING_SCENES[art.scene], `Missing art for day ${reading.day}`);
    const matched = reading.passage.split('; ').some(passage => {
      const [, book, start, end] = passage.match(/^(.+) (\d+)(?:-(\d+))?$/);
      return art.book === book && art.chapter >= Number(start) && art.chapter <= Number(end || start);
    });
    assert.ok(matched, `${art.reference} is not in day ${reading.day}: ${reading.passage}`);
    for (const size of ['small', 'large']) assert.ok(existsSync(new URL(`../public${sceneSource(art.scene, size)}`, import.meta.url)), art.scene);
  }
  for (const day of [0, -1, 85, 1.5, NaN]) assert.equal(artworkForDay(day), undefined);
});

test('the seasonal campaign expires at midnight New York time without depending on reader progress', () => {
  assert.equal(activeSeason(new Date('2026-09-22T03:59:59Z')), null);
  assert.equal(activeSeason(new Date('2026-09-22T04:00:00Z'))?.id, 'autumn-2026');
  assert.equal(activeSeason(new Date('2027-01-01T04:59:59Z'))?.id, 'autumn-2026');
  assert.equal(activeSeason(new Date('2027-01-01T05:00:00Z')), null);
  assert.equal(activeSeason(new Date('2027-10-01T12:00:00Z')), null);
  assert.equal(activeSeason(new Date('invalid')), null);
  assert.equal(activeSeason(new Date('2026-10-01T12:00:00Z'), {...SEASONAL_CAMPAIGN, enabled:false}), null);
  assert.equal(artworkForDay(84).scene, 'new-creation');
});
