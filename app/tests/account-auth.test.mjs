import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authReturnUrl, createAccountAuth, parseEmailCredential } from '../src/lib/account-auth.ts';

const config = { supabaseUrl: 'https://example.supabase.co', anonKey: 'public-key' };
const hash = '0123456789abcdef'.repeat(4);
const emailLink = `${config.supabaseUrl}/auth/v1/verify?token=${hash}&type=magiclink&redirect_to=http://localhost:3000`;
const tokens = { access_token: 'header.payload.signature', refresh_token: 'refresh-value', user: { id: 'member-a', email: 'member@example.invalid' } };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

test('every email return URL stays on production and rejects arbitrary destinations', () => {
  assert.equal(authReturnUrl('/schedule/'), 'https://elroicall.com/schedule/');
  for (const destination of ['/account/', 'http://localhost:3000', 'https://attacker.example', '//attacker.example']) assert.equal(authReturnUrl(destination), 'https://elroicall.com/account/');
});
test('email links and legacy failed redirects yield credentials without navigating', () => {
  assert.deepEqual(parseEmailCredential(emailLink, config.supabaseUrl), { kind: 'hash', token_hash: hash, type: 'magiclink' });
  assert.deepEqual(parseEmailCredential(`https://elroicall.com/auth/confirm#token_hash=${hash}&type=email`, config.supabaseUrl), { kind: 'hash', token_hash: hash, type: 'email' });
  assert.deepEqual(parseEmailCredential(`http://localhost:3000/#access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`, config.supabaseUrl), { kind: 'session', access_token: tokens.access_token, refresh_token: tokens.refresh_token });
});
test('recovery rejects unrelated projects, deceptive hosts, unsafe schemes and non-sign-in links', () => {
  const invalid = [
    emailLink.replace('example.supabase.co', 'other.supabase.co'),
    emailLink.replace('example.supabase.co', 'example.supabase.co.attacker.invalid'),
    emailLink.replace('https://', 'https://user:password@'),
    emailLink.replace('type=magiclink', 'type=email_change'),
    emailLink.replace('/auth/v1/verify', '/redirect'),
    'javascript:alert(1)', 'http://localhost:3000',
    `https://attacker.invalid/#access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`,
    `http://localhost:3000#error=access_denied&error_description=${hash}`,
  ];
  for (const link of invalid) assert.throws(() => parseEmailCredential(link, config.supabaseUrl));
});
test('email recovery posts to the fixed Auth service and checks the actual user', async () => {
  const calls = [];
  const auth = createAccountAuth(config, async (url, init) => {
    calls.push({ url, init });
    if (url.endsWith('/verify')) return json(tokens);
    if (url.endsWith('/user')) return json(tokens.user);
    throw Error('Unexpected request');
  });
  assert.equal((await auth.recoverEmail(emailLink, 'Member@example.invalid')).user.id, 'member-a');
  assert.deepEqual(JSON.parse(calls[0].init.body), { token_hash: hash, type: 'magiclink' });
  assert.equal(calls.length, 2);
  assert.equal(calls.every(call => call.url.startsWith(config.supabaseUrl + '/auth/v1/')), true);
  assert.equal(calls[1].init.headers.Authorization, `Bearer ${tokens.access_token}`);
});
test('recovered fragments must pass Auth validation and match the entered email', async () => {
  const link = `http://localhost:3000/#access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`;
  const accepted = createAccountAuth(config, async url => { assert.ok(url.endsWith('/user')); return json(tokens.user); });
  assert.equal((await accepted.recoverEmail(link, tokens.user.email)).user.id, 'member-a');
  await assert.rejects(accepted.recoverEmail(link, 'different@example.invalid'), /different account/);
  const rejected = createAccountAuth(config, async () => json({ error_code: 'bad_jwt' }, 401));
  await assert.rejects(rejected.recoverEmail(link, tokens.user.email), /Verification could not be completed/);
});
test('phone login never silently creates a second account; linking updates the current user', async () => {
  const calls = [];
  const auth = createAccountAuth(config, async (url, init) => { calls.push({ url, init }); return json(url.endsWith('/user') ? tokens.user : {}); });
  await auth.sendPhone('+12025550123');
  assert.deepEqual(JSON.parse(calls[0].init.body), { phone: '+12025550123', channel: 'sms', create_user: false });
  await auth.linkPhone('current-access-token', '+12025550123', 'member-a');
  assert.equal(calls[1].init.method, 'PUT');
  assert.equal(calls[1].init.headers.Authorization, 'Bearer current-access-token');
  assert.deepEqual(JSON.parse(calls[1].init.body), { phone: '+12025550123' });
});
test('email and text codes redeem via their proper verification type and reject account-switching on phone linking', async () => {
  const bodies = [];
  const auth = createAccountAuth(config, async (url, init) => { if (url.endsWith('/verify')) { bodies.push(JSON.parse(init.body)); return json(tokens); } return json(tokens.user); });
  await auth.verifyCode('email', tokens.user.email, '123456');
  await auth.verifyCode('sms', '+12025550123', '123456');
  await auth.verifyCode('phone_change', '+12025550123', '123456', 'member-a');
  assert.deepEqual(bodies.map(body => body.type), ['email', 'sms', 'phone_change']);
  await assert.rejects(auth.verifyCode('phone_change', '+12025550123', '123456', 'other-member'), /different account/);
  await assert.rejects(auth.verifyCode('sms', '+12025550123', 'nonsense'), /verification code/);
});
test('email sends request the canonical destination and provider failures cannot appear as successful sends', async () => {
  const auth = createAccountAuth(config, async (url, init) => {
    assert.equal(new URL(url).searchParams.get('redirect_to'), 'https://elroicall.com/account/');
    assert.deepEqual(JSON.parse(init.body), { email: 'member@example.invalid', create_user: true });
    return json({ error_code: 'over_email_send_rate_limit' }, 429);
  });
  await assert.rejects(auth.sendEmail(' member@example.invalid ', '/account/'), /wait a minute/);
  const phone = createAccountAuth(config, async () => json({ error_code: 'phone_provider_disabled' }, 400));
  await assert.rejects(phone.sendPhone('+12025550123'), /Choose email/);
});
test('method availability comes from Auth settings, not outbound calling readiness', async () => {
  const auth = createAccountAuth(config, async () => json({ external: { email: true, phone: false } }));
  assert.deepEqual(await auth.methods(), { email: true, phone: false });
});
