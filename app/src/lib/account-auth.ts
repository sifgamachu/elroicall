import { fetchJson } from './api.ts';

export const SITE_ORIGIN = 'https://elroicall.com';
export type AuthDestination = '/account/' | '/schedule/';
export type AuthMethods = { email: boolean; phone: boolean };
export type AuthTokens = { access_token: string; refresh_token: string; user: { id: string; email?: string; phone?: string } };
type EmailKind = 'email' | 'signup' | 'magiclink' | 'invite' | 'recovery';
type EmailCredential = { kind: 'hash'; token_hash: string; type: EmailKind } | { kind: 'session'; access_token: string; refresh_token: string };
export class AccountAuthError extends Error {}

export function authReturnUrl(destination: string): string {
  return SITE_ORIGIN + (destination === '/schedule/' ? '/schedule/' : '/account/');
}

// Extract credentials, never navigate to or fetch a pasted URL. Only this project's
// Auth endpoint can redeem them; a legacy localhost fragment is an explicit recovery path.
export function parseEmailCredential(raw: string, supabaseUrl: string): EmailCredential {
  if (raw.length > 16000) throw new AccountAuthError('That link is too long. Copy the sign-in link from your El Roi email.');
  let url: URL;
  try { url = new URL(raw.trim()); } catch { throw new AccountAuthError('Paste the full sign-in link from your El Roi email.'); }
  if (url.username || url.password) throw new AccountAuthError('Use the sign-in link from your El Roi email.');
  const project = url.origin === new URL(supabaseUrl).origin && url.pathname === '/auth/v1/verify';
  const site = url.origin === SITE_ORIGIN && ['/auth/confirm', '/auth/confirm/', '/account', '/account/', '/schedule', '/schedule/', '/'].includes(url.pathname);
  const legacy = ['localhost', '127.0.0.1'].includes(url.hostname) && ['http:', 'https:'].includes(url.protocol);
  if (!project && !site && !legacy) throw new AccountAuthError('Use the sign-in link from your El Roi email.');
  const hash = new URLSearchParams(url.hash.slice(1));
  if (url.searchParams.has('error') || hash.has('error')) throw new AccountAuthError('That sign-in link expired or was already used. Request a new email.');
  if (site || legacy) {
    const access_token = hash.get('access_token');
    const refresh_token = hash.get('refresh_token');
    if (access_token && refresh_token && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(access_token) && /^[A-Za-z0-9._~-]+$/.test(refresh_token)) {
      return { kind: 'session', access_token, refresh_token };
    }
  }
  if (project || site && url.pathname.startsWith('/auth/confirm')) {
    const token_hash = project ? url.searchParams.get('token') : hash.get('token_hash') || url.searchParams.get('token_hash');
    const type = project ? url.searchParams.get('type') : hash.get('type') || url.searchParams.get('type');
    if (token_hash && /^[A-Za-z0-9_-]{16,2048}$/.test(token_hash) && ['email', 'signup', 'magiclink', 'invite', 'recovery'].includes(type || '')) {
      return { kind: 'hash', token_hash, type: type as EmailKind };
    }
  }
  throw new AccountAuthError('This address has no usable sign-in code. Copy the sign-in button’s full link from your email, or request a new email.');
}

function errorFor(status: number, code: unknown): AccountAuthError {
  if (status === 429 || code === 'over_email_send_rate_limit' || code === 'over_sms_send_rate_limit') return new AccountAuthError('Please wait a minute before requesting another code or link.');
  if (code === 'phone_provider_disabled' || code === 'sms_send_failed') return new AccountAuthError('Phone verification is unavailable right now. Choose email to continue.');
  if (code === 'otp_expired' || code === 'otp_disabled') return new AccountAuthError('That code or link expired or was already used. Request a new one.');
  if (code === 'user_not_found' || code === 'signup_disabled') return new AccountAuthError('Phone sign-in needs a number linked to your account. Sign in with email, then add phone sign-in in Preferences.');
  if (code === 'phone_exists') return new AccountAuthError('That phone is already linked to another sign-in account. Use your existing sign-in method.');
  return new AccountAuthError('Verification could not be completed. Check your details and try again.');
}

export function createAccountAuth(config: { supabaseUrl: string; anonKey: string }, client: typeof fetch = fetch) {
  const base = `${config.supabaseUrl}/auth/v1`;
  async function call<T>(path: string, method = 'GET', body?: unknown, accessToken?: string): Promise<T> {
    try {
      const { status, data } = await fetchJson<T & { error_code?: string; code?: string }>(`${base}${path}`, {
        method, headers: { apikey: config.anonKey, 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
        body: body === undefined ? undefined : JSON.stringify(body),
      }, 20000, client);
      if (status < 200 || status >= 300) throw errorFor(status, data.error_code || data.code);
      return data;
    } catch (error) {
      if (error instanceof AccountAuthError) throw error;
      throw new AccountAuthError('We could not confirm the request. Check your email or text messages before trying again.');
    }
  }
  async function confirmed(tokens: AuthTokens, expectedEmail?: string, expectedUser?: string): Promise<AuthTokens> {
    if (!tokens?.access_token || !tokens?.refresh_token) throw new AccountAuthError('Your session could not be confirmed. Request a new link or code.');
    // Validate with Auth, including recovered fragments. Never trust a decoded JWT
    // or a submitted email as proof of identity.
    const user = await call<AuthTokens['user']>('/user', 'GET', undefined, tokens.access_token);
    if (!user?.id || expectedUser && user.id !== expectedUser || expectedEmail && user.email?.toLowerCase() !== expectedEmail.trim().toLowerCase()) {
      throw new AccountAuthError('That verification belongs to a different account. Use the email address and link for the account you want to open.');
    }
    return { access_token: tokens.access_token, refresh_token: tokens.refresh_token, user };
  }
  return {
    async methods(): Promise<AuthMethods> {
      const data = await call<{ external?: { email?: boolean; phone?: boolean } }>('/settings');
      return { email: data.external?.email === true, phone: data.external?.phone === true };
    },
    sendEmail(email: string, destination: AuthDestination) {
      return call(`/otp?redirect_to=${encodeURIComponent(authReturnUrl(destination))}`, 'POST', { email: email.trim(), create_user: true });
    },
    sendPhone(phone: string) {
      // A calling number in portal_accounts is not automatically an Auth identity.
      // Prevent silent creation of a second account for an existing email member.
      return call('/otp', 'POST', { phone, channel: 'sms', create_user: false });
    },
    async verifyCode(method: 'email' | 'sms' | 'phone_change', identity: string, token: string, expectedUser?: string) {
      if (!/^\d{6,10}$/.test(token)) throw new AccountAuthError('Enter the verification code from your message.');
      const tokens = await call<AuthTokens>('/verify', 'POST', { type: method, token, ...(method === 'email' ? { email: identity.trim() } : { phone: identity }) });
      return confirmed(tokens, method === 'email' ? identity : undefined, expectedUser);
    },
    async recoverEmail(raw: string, expectedEmail?: string) {
      const credential = parseEmailCredential(raw, config.supabaseUrl);
      const tokens = credential.kind === 'hash'
        ? await call<AuthTokens>('/verify', 'POST', { token_hash: credential.token_hash, type: credential.type })
        : { ...credential, user: { id: '' } };
      return confirmed(tokens, expectedEmail);
    },
    async linkPhone(accessToken: string, phone: string, expectedUser: string) {
      const user = await call<AuthTokens['user']>('/user', 'PUT', { phone }, accessToken);
      if (user?.id !== expectedUser) throw new AccountAuthError('Your sign-in changed. Refresh before trying again.');
    },
  };
}
