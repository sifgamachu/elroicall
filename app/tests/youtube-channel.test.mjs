import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHANNEL_MESSAGES, channelMessage, messageConversationDraft, messageScheduleUrl } from '../src/lib/youtube-channel.ts';
import { readingForDay } from '../src/lib/autumn-readings.ts';

test('YouTube routing admits only the curated messages', () => {
  for (const slug of [undefined, 'toString', '__proto__', 'https://example.com', '../account', 'night-prayer/other']) assert.equal(channelMessage(slug), undefined);
  assert.equal(new Set(CHANNEL_MESSAGES.map(message => message.id)).size, CHANNEL_MESSAGES.length);
  for (const message of CHANNEL_MESSAGES) {
    assert.match(message.id, /^[\w-]{11}$/);
    assert.equal(channelMessage(message.slug), message);
  }
});

test('conversation handoff preserves existing words, includes Scripture, and refuses silent truncation', () => {
  const message = CHANNEL_MESSAGES[0];
  const earlier = 'My earlier conversation draft.';
  const reflection = 'A personal reflection that must stay out of the URL.';
  const draft = messageConversationDraft(message, reflection, earlier);
  assert.ok(draft.startsWith(earlier));
  assert.ok(draft.includes(message.passage));
  assert.ok(draft.endsWith(reflection));
  assert.equal(messageConversationDraft(message, '', draft), draft);
  assert.equal(messageConversationDraft(message, reflection, 'x'.repeat(2000)), null);
  const url = new URL(messageScheduleUrl(message), 'https://elroicall.com');
  assert.equal(url.pathname, '/schedule/');
  assert.equal(url.searchParams.get('content'), 'bible_study');
  assert.ok(!url.href.includes(encodeURIComponent(reflection)));
  for (const item of CHANNEL_MESSAGES) {
    const topic = new URL(messageScheduleUrl(item), 'https://elroicall.com').searchParams.get('topic');
    assert.ok(topic.length <= 160);
    assert.ok(topic.includes(item.passage));
  }
});

test('every related video is grounded in a chapter assigned on that reading day', () => {
  for (const message of CHANNEL_MESSAGES) {
    const [, book, chapter] = message.passage.match(/^(.+) (\d+):\d+$/);
    for (const day of message.readingDays) {
      const passage = readingForDay(String(day)).passage;
      assert.ok(passage.split('; ').some(part => {
        const [, assignedBook, first, last] = part.match(/^(.+) (\d+)(?:-(\d+))?$/);
        return assignedBook.replace(/^Psalms$/, 'Psalm') === book && Number(chapter) >= Number(first) && Number(chapter) <= Number(last || first);
      }), `${message.passage} must occur on day ${day}`);
    }
  }
});
