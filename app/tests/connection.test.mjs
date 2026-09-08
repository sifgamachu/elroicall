import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import { ApiError, fetchJson, postJson, requestJson } from '../src/lib/api.ts';
import { normalizePhone } from '../src/lib/phone.ts';

afterEach(() => mock.restoreAll());

test('US and Canadian display formats produce a consistent caller identifier', () => {
  for (const value of ['202-555-0123', '(202) 555-0123', '1 202 555 0123', '+1 (202) 555-0123']) {
    assert.equal(normalizePhone(value), '+12025550123');
  }
});

test('international numbers require an explicit country code and preserve it', () => {
  assert.equal(normalizePhone('+44 20 7946 0958'), '+442079460958');
  assert.equal(normalizePhone('+251 911 234 567'), '+251911234567');
  assert.equal(normalizePhone('442079460958'), null);
});

test('short, malformed, overlong, and invalid NANP numbers cannot be claimed', () => {
  for (const value of ['', 'abc', '+', '123', '1234567890', '+1202555012', '+12021550123', '+02025550123', '2025550123 ext 5', '+4420794609581234', '++442079460958']) {
    assert.equal(normalizePhone(value), null, value);
  }
});

test('a JSON write sends one request with its original payload', async () => {
  const fetch = mock.method(globalThis, 'fetch', async (_url, init) => {
    assert.equal(init.method, 'POST');
    assert.equal(init.headers['Content-Type'], 'application/json');
    assert.deepEqual(JSON.parse(init.body), { burden: 'Synthetic test' });
    return Response.json({ ok: true });
  });
  assert.deepEqual(await postJson('https://example.test/reflect', { burden: 'Synthetic test' }), { ok: true });
  assert.equal(fetch.mock.callCount(), 1);
});

test('HTTP failures preserve status and service error without retrying writes', async () => {
  const fetch = mock.method(globalThis, 'fetch', async () => Response.json({ error: 'already_used' }, { status: 409 }));
  await assert.rejects(postJson('https://example.test/claim', {}), (error) => error instanceof ApiError && error.status === 409 && error.message === 'already_used');
  assert.equal(fetch.mock.callCount(), 1);
});

test('a malformed success body is a failure rather than an empty success', async () => {
  mock.method(globalThis, 'fetch', async () => new Response('<html>unavailable</html>', { status: 200 }));
  await assert.rejects(requestJson('https://example.test/reflect'), /invalid_response/);
});

test('an HTML error response still reports its HTTP status', async () => {
  mock.method(globalThis, 'fetch', async () => new Response('<html>unavailable</html>', { status: 503 }));
  await assert.rejects(requestJson('https://example.test/reflect'), (error) => error.status === 503);
});

test('a stalled connection is aborted by the request deadline', async () => {
  mock.method(globalThis, 'fetch', (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  }));
  await assert.rejects(fetchJson('https://example.test/slow', undefined, 10), { name: 'TimeoutError' });
});

test('the deadline covers a stalled JSON body after headers arrive', async () => {
  mock.method(globalThis, 'fetch', async (_url, { signal }) => ({
    ok: true,
    status: 200,
    json: () => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true })),
  }));
  await assert.rejects(fetchJson('https://example.test/slow-body', undefined, 10), { name: 'TimeoutError' });
});

test('leaving the page can cancel an in-flight request', async () => {
  const controller = new AbortController();
  mock.method(globalThis, 'fetch', (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  }));
  const request = requestJson('https://example.test/reflect', { signal: controller.signal });
  controller.abort();
  await assert.rejects(request, { name: 'AbortError' });
});

test('network failures remain failures and are not automatically repeated', async () => {
  const fetch = mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(postJson('https://example.test/claim', {}), /Failed to fetch/);
  assert.equal(fetch.mock.callCount(), 1);
});
