import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCRIPTURE_MOMENTS, SEVEN_DAY_PATH, getMoment, dailyMoment, searchMoments, parseProgress, updateProgress, nextPathMoment, passageUrl, speechChunks } from '../src/lib/scripture-library.ts';

test('every public reading has a unique route, complete content and a primary passage link', () => {
  assert.equal(new Set(SCRIPTURE_MOMENTS.map(m => m.id)).size, 10);
  for (const moment of SCRIPTURE_MOMENTS) {
    assert.match(moment.id, /^[a-z]+$/);
    for (const key of ['title', 'passage', 'verse', 'quote', 'story', 'reflection', 'question', 'action', 'prayer', 'fact']) assert.ok(moment[key].trim().length > 0, `${moment.id}: ${key}`);
    const source = new URL(passageUrl(moment));
    assert.equal(source.origin, 'https://www.biblegateway.com');
    assert.equal(source.searchParams.get('search'), moment.passage);
    assert.equal(source.searchParams.get('version'), 'KJV');
    assert.ok(moment.quiz.answer >= 0 && moment.quiz.answer < moment.quiz.options.length);
    assert.equal(new Set(moment.quiz.options).size, moment.quiz.options.length);
    assert.ok(moment.quiz.explanation.length > 25);
  }
  assert.equal(getMoment('not-a-reading'), undefined);
});
test('daily selection stays stable within a local day and handles invalid dates safely', () => {
  assert.equal(dailyMoment(new Date(2026, 8, 21, 0, 1)).id, dailyMoment(new Date(2026, 8, 21, 23, 59)).id);
  assert.notEqual(dailyMoment(new Date(2026, 8, 21)).id, dailyMoment(new Date(2026, 8, 22)).id);
  assert.ok(dailyMoment(new Date('invalid')).id);
  assert.ok(dailyMoment(new Date(1960, 0, 1)).id);
});
test('search combines terms, themes and bookmarks without substituting unrelated results', () => {
  assert.deepEqual(searchMoments('  RUTH  ').map(m => m.id), ['ruth']);
  assert.deepEqual(searchMoments('Genesis', 'All', ['hagar', 'job']).map(m => m.id), ['hagar']);
  assert.equal(searchMoments('nonsense').length, 0);
  assert.equal(searchMoments('', 'All', []).length, 0);
  assert.deepEqual(searchMoments('Moses', 'Starting again'), []);
});
test('browser progress rejects corrupt data, unsupported schemas and unrecognized IDs', () => {
  for (const raw of [null, '{', 'null', '[]', '{"version":2,"saved":["ruth"]}']) assert.deepEqual(parseProgress(raw), { version: 1, saved: [], completed: [] });
  assert.deepEqual(parseProgress(JSON.stringify({ version: 1, saved: ['ruth', 'ruth', 1, null, 'unknown'], completed: ['hagar', 'hagar'], privateText: 'must not persist' })), { version: 1, saved: ['ruth'], completed: ['hagar'] });
});
test('completion can be undone and the seven-day path advances only from explicit progress', () => {
  assert.equal(new Set(SEVEN_DAY_PATH).size, 7);
  assert.ok(SEVEN_DAY_PATH.every(id => getMoment(id)));
  const empty = parseProgress(null);
  assert.equal(nextPathMoment(empty.completed).id, 'hagar');
  const done = updateProgress(empty, 'completed', 'hagar');
  assert.equal(nextPathMoment(done.completed).id, 'elijah');
  assert.deepEqual(updateProgress(done, 'completed', 'hagar'), empty);
  assert.equal(nextPathMoment(SEVEN_DAY_PATH), undefined);
  assert.deepEqual(updateProgress(empty, 'saved', 'unknown'), empty);
  assert.deepEqual(empty.completed, []);
});
test('speech segments preserve the complete reading in order without oversized normal chunks', () => {
  const text = SCRIPTURE_MOMENTS.map(m => `${m.quote} ${m.story} ${m.reflection}`).join(' ');
  const chunks = speechChunks(text);
  assert.equal(chunks.join(' '), text.replace(/\s+/g, ' ').trim());
  assert.ok(chunks.every(chunk => chunk.length < 180));
  assert.deepEqual(speechChunks('  '), []);
});
