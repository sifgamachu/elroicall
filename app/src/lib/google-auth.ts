import { fetchJson } from './api.ts';
import { authReturnUrl, type AuthDestination } from './account-auth.ts';

export type GoogleAuthConfig = { supabaseUrl: string; anonKey: string };
export type GoogleOAuthRequest = { provider: 'google'; options: { redirectTo: string; scopes: string; queryParams: { prompt: string }; skipBrowserRedirect: true } };
type OAuthClient = { signInWithOAuth: (request: GoogleOAuthRequest) => Promise<{ data: { url: string | null }; error: unknown }> };
export const GOOGLE_ATTEMPT_KEY = 'elroi:google-signin:v1';
const ATTEMPT_LIFETIME = 10 * 60 * 1000;
export class GoogleAuthUnavailable extends Error {
  constructor() { super('Google sign-in is not available yet. Use your email and ElroiCall password, or an email link.'); }
}
export function googleAuthError(): string {
  // Never display provider error_description, tokens, or untrusted redirect URLs.
  return 'Google sign-in could not start. Please try again or use your email and ElroiCall password.';
}
export async function googleProviderEnabled(config: GoogleAuthConfig, client: typeof fetch = fetch): Promise<boolean> {
  const result = await fetchJson<{ external?: { google?: boolean } }>(`${config.supabaseUrl}/auth/v1/settings`, {
    headers: { apikey: config.anonKey }, cache: 'no-store',
  }, 10000, client);
  if (result.status !== 200) throw new Error(googleAuthError());
  return result.data?.external?.google === true;
}
export async function googleSignInUrl(auth: OAuthClient, config: GoogleAuthConfig, destination: AuthDestination, client: typeof fetch = fetch): Promise<string> {
  // Check the real provider, not a build-time flag. Saving credentials in Supabase
  // activates the button on its next check without another frontend deployment.
  if (!await googleProviderEnabled(config, client)) throw new GoogleAuthUnavailable();
  const redirectTo = authReturnUrl(destination);
  const result = await auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, scopes: 'openid email profile', queryParams: { prompt: 'select_account' }, skipBrowserRedirect: true },
  });
  if (result.error || !result.data?.url) throw new Error(googleAuthError());
  let url: URL;
  try { url = new URL(result.data.url); } catch { throw new Error(googleAuthError()); }
  if (url.origin !== new URL(config.supabaseUrl).origin || url.protocol !== 'https:' || url.username || url.password || url.hash || url.pathname !== '/auth/v1/authorize' || url.searchParams.get('provider') !== 'google' || url.searchParams.get('redirect_to') !== redirectTo) {
    throw new Error(googleAuthError());
  }
  // The existing Supabase client processes the returning session. Account linking
  // and identity verification remain server-owned; never match accounts in the UI.
  return url.href;
}
export function rememberGoogleAttempt(storage: Pick<Storage, 'setItem'>, now = Date.now()): void {
  try { storage.setItem(GOOGLE_ATTEMPT_KEY, String(now)); } catch { /* Sign-in does not require optional browser metadata. */ }
}
export function googleReturnError(rawUrl: string, storage: Pick<Storage, 'getItem'>, now = Date.now()): string {
  try {
    const stored = storage.getItem(GOOGLE_ATTEMPT_KEY);
    if (!stored) return '';
    const started = Number(stored);
    if (!Number.isFinite(started) || started > now || now - started > ATTEMPT_LIFETIME) return '';
    const url = new URL(rawUrl);
    if (!url.searchParams.has('error') && !new URLSearchParams(url.hash.slice(1)).has('error')) return '';
    return 'Google sign-in was canceled or could not finish. Try Google again, or sign in with your email and ElroiCall password.';
  } catch { return ''; }
}
