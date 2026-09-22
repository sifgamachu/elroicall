import { test } from 'node:test';
import assert from 'node:assert/strict';
import { watchAccountSession } from '../src/lib/account-session.ts';

const session = (id = 'member-a', access_token = 'synthetic-access') => ({ access_token, user: { id, email: `${id}@example.invalid` } });
function fixture() {
  let resolve, callback, unsubscribed = false;
  const pending = new Promise(done => { resolve = done; });
  const updates = [], errors = [];
  const auth = {
    getSession: () => pending,
    onAuthStateChange: handler => { callback = handler; return { data: { subscription: { unsubscribe: () => { unsubscribed = true; } } } }; },
  };
  return {auth, updates, errors, resolve, emit: (event, value) => callback(event, value), get unsubscribed() { return unsubscribed; }};
}
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

test('returning to the tab does not erase the same members dashboard state', async () => {
  const f = fixture();
  const stop = watchAccountSession(f.auth, (...args) => f.updates.push(args), () => f.errors.push(true));
  f.emit('INITIAL_SESSION', session());
  f.emit('SIGNED_IN', session());
  f.resolve({ data: { session: session() }, error: null });
  await flush();
  assert.equal(f.updates.length, 1);
  assert.equal(f.updates[0][1], true);
  stop();
});
test('token refresh updates credentials without resetting the same accounts data', () => {
  const f = fixture();
  const stop = watchAccountSession(f.auth, (...args) => f.updates.push(args), () => {});
  f.emit('INITIAL_SESSION', session());
  f.emit('TOKEN_REFRESHED', session('member-a', 'renewed-synthetic-access'));
  f.emit('USER_UPDATED', { ...session('member-a', 'renewed-synthetic-access'), user: { ...session().user, phone: '+12025550123' } });
  assert.deepEqual(f.updates.map(item => item[1]), [true, false, false]);
  stop();
});
test('sign-out and account switching clear ownership and cannot be undone by an old session read', async () => {
  const f = fixture();
  const stop = watchAccountSession(f.auth, (...args) => f.updates.push(args), () => {});
  f.emit('SIGNED_IN', session());
  f.emit('SIGNED_OUT', null);
  f.resolve({ data: { session: session() }, error: null });
  await flush();
  assert.equal(f.updates.at(-1)[0], null);
  f.emit('SIGNED_IN', session('member-b'));
  assert.deepEqual(f.updates.map(item => item[1]), [true, true, true]);
  stop();
});
test('a stalled restoration exposes recovery and still accepts a later valid session', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const f = fixture();
  const stop = watchAccountSession(f.auth, (...args) => f.updates.push(args), () => f.errors.push(true), 12000);
  context.mock.timers.tick(12000);
  assert.equal(f.errors.length, 1);
  assert.equal(f.updates.length, 0);
  f.resolve({ data: { session: session() }, error: null });
  await flush();
  assert.equal(f.updates.length, 1);
  stop();
});
test('Auth error results are not mistaken for successful signed-out restoration', async () => {
  const f = fixture();
  const stop = watchAccountSession(f.auth, (...args) => f.updates.push(args), () => f.errors.push(true));
  f.resolve({ data: { session: null }, error: new Error('Session unavailable') });
  await flush();
  assert.equal(f.updates.length, 0);
  assert.equal(f.errors.length, 1);
  stop();
});
test('leaving the page unsubscribes and prevents late state changes', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const f = fixture();
  const stop = watchAccountSession(f.auth, (...args) => f.updates.push(args), () => f.errors.push(true));
  stop();
  f.resolve({ data: { session: session() }, error: null });
  f.emit('SIGNED_IN', session());
  context.mock.timers.tick(12000);
  await flush();
  assert.equal(f.unsubscribed, true);
  assert.deepEqual(f.updates, []);
  assert.deepEqual(f.errors, []);
});
