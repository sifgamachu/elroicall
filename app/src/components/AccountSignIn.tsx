import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import EmailLinkSignIn from './EmailLinkSignIn';
import { supabase, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { SUPABASE_URL } from '@/lib/api';
import { authReturnUrl, type AuthDestination, type AuthMode } from '@/lib/account-auth';
import { passwordError, passwordIssue } from '@/lib/account-flow';
import { GoogleAuthUnavailable, googleAuthError, googleProviderEnabled, googleSignInUrl, googleReturnError, rememberGoogleAttempt } from '@/lib/google-auth';
import '@/auth.css';
import '@/account-flow.css';
import '@/google-auth.css';

type Props = { destination?: AuthDestination; initialError?: string; embedded?: boolean; initialMode?: AuthMode; mode?: AuthMode; onModeChange?: (mode: AuthMode) => void };
const googleConfig = { supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
function returnError(fallback: string): string {
  try { return googleReturnError(window.location.href, window.sessionStorage) || fallback; } catch { return fallback; }
}
function GoogleMark() {
  return <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path fill="#4285F4" d="M43.61 24.46c0-1.36-.12-2.66-.35-3.92H24v7.41h11c-.48 2.38-1.83 4.39-3.85 5.75v4.77h6.18c3.62-3.34 6.28-8.27 6.28-14.01z"/><path fill="#34A853" d="M24 44c5.4 0 9.94-1.79 13.25-4.87l-6.18-4.77c-1.79 1.2-4.08 1.93-7.07 1.93-5.3 0-9.79-3.59-11.4-8.42H6.22v4.92A20 20 0 0 0 24 44z"/><path fill="#FBBC05" d="M12.6 27.87A12 12 0 0 1 12 24c0-1.34.23-2.64.6-3.87v-4.92H6.22A20 20 0 0 0 4 24c0 3.23.77 6.28 2.22 8.79l6.38-4.92z"/><path fill="#EA4335" d="M24 11.71c2.94 0 5.56 1.01 7.64 3l5.73-5.73C33.93 5.77 29.4 4 24 4A20 20 0 0 0 6.22 15.21l6.38 4.92C14.21 15.3 18.7 11.71 24 11.71z"/></svg>;
}
export default function AccountSignIn({ destination = '/account/', initialError = '', embedded = false, initialMode = 'signup', mode: controlledMode, onModeChange }: Props) {
  const id = useId();
  const [localMode, setLocalMode] = useState<AuthMode>(initialMode);
  const mode = controlledMode ?? localMode;
  const [alternative, setAlternative] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(() => returnError(initialError));
  const [sent, setSent] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState<boolean|null>(null);
  const [checkingGoogle, setCheckingGoogle] = useState(true);
  const [openingGoogle, setOpeningGoogle] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(true);
  const redirectTimer = useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(() => {
    mounted.current = true;
    let active = true;
    const timer = redirectTimer;
    void googleProviderEnabled(googleConfig).then(enabled => { if (active) setGoogleEnabled(enabled); }).catch(() => { if (active) setGoogleEnabled(null); }).finally(() => { if (active) setCheckingGoogle(false); });
    const returnFromGoogle = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      pending.current = false; setBusy(false); setOpeningGoogle(false);
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
    window.addEventListener('pageshow', returnFromGoogle);
    return () => { active = false; mounted.current = false; if (timer.current) clearTimeout(timer.current); window.removeEventListener('pageshow', returnFromGoogle); };
  }, []);
  async function checkGoogle() {
    if (checkingGoogle || pending.current) return;
    setCheckingGoogle(true);
    try { const enabled = await googleProviderEnabled(googleConfig); if (mounted.current) setGoogleEnabled(enabled); }
    catch { if (mounted.current) setGoogleEnabled(null); }
    finally { if (mounted.current) setCheckingGoogle(false); }
  }
  async function signInGoogle() {
    if (pending.current || googleEnabled !== true) return;
    pending.current = true; setBusy(true); setOpeningGoogle(true); setError(''); setPassword(''); setConfirmation('');
    try {
      const url = await googleSignInUrl(supabase.auth, googleConfig, destination);
      if (!mounted.current) return;
      try { rememberGoogleAttempt(window.sessionStorage); } catch { /* Optional metadata only. */ }
      // Full-tab navigation works without popup permissions and leaves planner drafts intact.
      window.location.assign(url);
      redirectTimer.current = setTimeout(() => {
        if (!mounted.current) return;
        pending.current = false; setBusy(false); setOpeningGoogle(false); setError('Google did not open. Try again, or use email below.');
      }, 12000);
    } catch (issue) {
      pending.current = false;
      if (mounted.current) { setBusy(false); setOpeningGoogle(false); setError(issue instanceof GoogleAuthUnavailable ? issue.message : googleAuthError()); if (issue instanceof GoogleAuthUnavailable) setGoogleEnabled(false); }
    }
  }
  function changeMode(next: AuthMode) {
    if (pending.current) return;
    setLocalMode(next); onModeChange?.(next); setPassword(''); setConfirmation(''); setSent(false); setError('');
  }
  async function submit() {
    if (pending.current) return;
    const address = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) { setError('Enter a valid email address.'); return; }
    const invalid = mode === 'signup' ? passwordIssue(password, confirmation) : !password ? 'Enter your ElroiCall password.' : '';
    if (invalid) { setError(invalid); return; }
    pending.current = true; setBusy(true); setError('');
    try {
      if (mode === 'signin') {
        const result = await supabase.auth.signInWithPassword({ email: address, password });
        if (result.error) throw result.error;
        if (!result.data.session) throw new Error('Session unavailable');
      } else {
        const result = await supabase.auth.signUp({ email: address, password, options: { emailRedirectTo: authReturnUrl(destination) } });
        if (result.error) throw result.error;
        if (mounted.current && !result.data.session) setSent(true);
      }
    } catch (issue) {
      if (mounted.current) setError(passwordError(issue && typeof issue === 'object' ? issue : null));
    } finally {
      pending.current = false;
      if (mounted.current) { setPassword(''); setConfirmation(''); setBusy(false); }
    }
  }
  function openAlternative() { if (pending.current) return; setPassword(''); setConfirmation(''); setAlternative(true); setError(''); }
  if (alternative) return <div className="account-auth">
    <button type="button" className="elroi-text-link" onClick={() => setAlternative(false)}><ArrowLeft size={16}/>Back to sign-in options</button>
    <p className="auth-help">Use a one-time email link, or a text code if you already linked a sign-in number. You can set an ElroiCall password later in Preferences.</p>
    <EmailLinkSignIn destination={destination} embedded={embedded} initialError={initialError} mode={mode} onModeChange={changeMode}/>
  </div>;
  if (sent) return <div className="account-auth" role="status">
    <Mail size={26}/><h3>Confirm your email once.</h3>
    <p className="auth-help">Check your inbox for the confirmation email for <strong>{email.trim()}</strong>. Once confirmed, regular visits use your email and ElroiCall password.</p>
    <p className="auth-help">Already registered? Sign in to your existing account rather than creating another one.</p>
    <button type="button" className="elroi-button elroi-button-primary" onClick={() => changeMode('signin')}>Go to sign-in <ArrowUpRight size={17}/></button>
    <button type="button" className="elroi-text-link" onClick={openAlternative}>Need another verification email?</button>
  </div>;
  const Form = embedded ? 'div' : 'form';
  return <div className="account-auth">
    <div className="auth-mode" role="group" aria-label="Account access">
      <button type="button" aria-pressed={mode === 'signin'} disabled={busy} onClick={() => changeMode('signin')}>Sign in</button>
      <button type="button" aria-pressed={mode === 'signup'} disabled={busy} onClick={() => changeMode('signup')}>Create account</button>
    </div>
    <h3>{mode === 'signin' ? 'Welcome back.' : 'Create your account.'}</h3>
    <div className="auth-google">
      <button type="button" className="auth-google-button" disabled={busy || checkingGoogle || googleEnabled !== true} onClick={() => void signInGoogle()} aria-describedby={`${id}-google-help`}><GoogleMark/><span>{openingGoogle ? 'Opening Google…' : 'Continue with Google'}</span></button>
      <p className="auth-help" id={`${id}-google-help`}>{checkingGoogle ? 'Checking Google sign-in availability…' : googleEnabled === false ? 'Google sign-in is being connected. Use email below for now.' : googleEnabled === null ? 'We could not check Google sign-in. Use email below or check again.' : 'Choose your Google account. No ElroiCall password needed. New here? Continuing creates an account.'}</p>
      {!checkingGoogle && googleEnabled !== true && <button type="button" className="elroi-text-link" disabled={busy} onClick={() => void checkGoogle()}>Check Google availability again</button>}
      {googleEnabled && <p className="auth-help">Already an ElroiCall member? Choose the Google account with the same email address to keep your schedules and notes together.</p>}
    </div>
    <div className="auth-google-divider">Or use email</div>
    <p className="auth-help">{mode === 'signin' ? 'Use your email and ElroiCall password—not your Google password or calling PIN.' : 'For email signup, choose an ElroiCall password and confirm your email once. Add your phone number when you are ready to receive calls.'}</p>
    {error && <p role="alert" className="auth-error">{error}</p>}
    <Form className="auth-form" onSubmit={event => { event.preventDefault(); void submit(); }} onKeyDown={event => {
      if (embedded && event.key === 'Enter' && event.target instanceof HTMLInputElement) { event.preventDefault(); event.stopPropagation(); void submit(); }
    }}>
      <label className="auth-field" htmlFor={`${id}-email`}>Email address<input id={`${id}-email`} type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} disabled={busy} required placeholder="you@example.com"/></label>
      <label className="auth-field" htmlFor={`${id}-password`}>ElroiCall password
        <span className="flow-password-input"><input id={`${id}-password`} type={visible ? 'text' : 'password'} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={event => setPassword(event.target.value)} minLength={mode === 'signup' ? 12 : undefined} maxLength={128} required disabled={busy}/><button type="button" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} disabled={busy} onClick={() => setVisible(value => !value)}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span>
      </label>
      {mode === 'signup' && <label className="auth-field" htmlFor={`${id}-confirm`}>Confirm ElroiCall password<input id={`${id}-confirm`} type="password" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} minLength={12} maxLength={128} required disabled={busy}/><span>At least 12 characters. Do not use your six-digit calling PIN.</span></label>}
      <button type={embedded ? 'button' : 'submit'} onClick={embedded ? () => void submit() : undefined} className="elroi-button elroi-button-primary" disabled={busy}>{busy && !openingGoogle ? <><LoaderCircle size={18} className="animate-spin"/>Please wait…</> : <><LockKeyhole size={18}/>{mode === 'signin' ? 'Sign in with email' : 'Create account with email'}</>}</button>
    </Form>
    <div className="auth-actions"><button type="button" disabled={busy} className="elroi-text-link" onClick={openAlternative}><Mail size={16}/>Use an email link instead</button>{mode === 'signin' && <button type="button" disabled={busy} className="elroi-text-link" onClick={openAlternative}>Forgot or never set a password?</button>}</div>
    <p className="auth-help">Your browser keeps an active session so you do not have to sign in for every visit. Sign out on shared devices.</p>
  </div>;
}
