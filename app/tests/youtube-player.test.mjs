import test from 'node:test';
import assert from 'node:assert/strict';
import { youtubePlayerUrl, youtubeWatchUrl } from '../src/lib/youtube-player.ts';
import { publicYouTubePlayer } from '../../worker/public-youtube-player.mjs';
import worker from '../../worker/index.js';

const id = 'M7lc1UVf-VE';
const endpoint = `https://elroicall.com/app-player/youtube/${id}/`;

test('native playback uses an isolated HTTPS page without passing account credentials', () => {
  assert.equal(youtubePlayerUrl(id, true, 'capacitor://localhost'), endpoint);
  assert.equal(youtubePlayerUrl(id, true, 'https://localhost'), endpoint);
  assert.equal(youtubeWatchUrl(id), `https://www.youtube.com/watch?v=${id}`);
});

test('browser playback retains privacy-enhanced YouTube and sends only the page origin', () => {
  const url = new URL(youtubePlayerUrl(id, false, 'https://elroicall.com/account/?token=private'));
  assert.equal(url.hostname, 'www.youtube-nocookie.com');
  assert.equal(url.searchParams.get('origin'), 'https://elroicall.com');
  assert.equal(url.searchParams.get('playsinline'), '1');
  assert.equal(url.href.includes('private'), false);
  for (const origin of ['capacitor://localhost', 'file:///app', 'not a URL'])
    assert.equal(new URL(youtubePlayerUrl(id, false, origin)).searchParams.has('origin'), false);
});

test('invalid video identifiers cannot inject a player URL or HTML', () => {
  for (const bad of [null, '', '../private', `${id}?token=x`, '<script>x</script>', 'https://evil.test']) {
    assert.throws(() => youtubePlayerUrl(bad, true, 'https://localhost'));
    assert.throws(() => youtubeWatchUrl(bad));
  }
});

test('public wrapper supplies site and app identity without running account scripts', async () => {
  const response = publicYouTubePlayer(new Request(endpoint));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const html = await response.text();
  const source = /src="([^"]+)"/.exec(html)[1].replaceAll('&amp;', '&');
  const url = new URL(source);
  assert.equal(url.hostname, 'www.youtube-nocookie.com');
  assert.equal(url.pathname, `/embed/${id}`);
  assert.equal(url.searchParams.get('origin'), 'https://elroicall.com');
  assert.equal(url.searchParams.get('widget_referrer'), 'https://com.elroicall.app');
  assert.equal(html.includes('<script'), false);
  assert.equal(html.includes('supabase'), false);
  const policy = response.headers.get('content-security-policy');
  assert.ok(policy.includes("default-src 'none'"));
  assert.ok(policy.includes('frame-src https://www.youtube-nocookie.com;'));
  assert.ok(policy.includes('capacitor://localhost'));
  assert.equal(policy.includes('*'), false);
});

test('public player rejects arbitrary paths, extra URL input, and mutations', async () => {
  for (const path of ['/app-player/youtube/invalid/', `/app-player/youtube/${id}/?url=https://evil.test`, '/app-player/private/']) {
    const response = publicYouTubePlayer(new Request(`https://elroicall.com${path}`));
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
  }
  assert.equal(publicYouTubePlayer(new Request('https://elroicall.com/account/')), null);
  assert.equal(publicYouTubePlayer(new Request(endpoint, { method: 'POST' })).status, 405);
  const head = publicYouTubePlayer(new Request(endpoint, { method: 'HEAD' }));
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});

test('framing the player never relaxes protection or cache rules on private account routes', async () => {
  const env = { ASSETS: { fetch: async () => new Response('<html>App</html>') } };
  for (const path of ['/account/', '/auth/confirm', '/dashboard/', '/schedule/']) {
    const response = await worker.fetch(new Request(`https://elroicall.com${path}`), env);
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  }
  const player = await worker.fetch(new Request(endpoint), env);
  assert.equal(player.headers.has('x-frame-options'), false);
  assert.ok(player.headers.get('content-security-policy').includes('frame-ancestors'));
});
