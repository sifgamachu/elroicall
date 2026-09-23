import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import EmailLinkSignIn from './EmailLinkSignIn';
import { supabase } from '@/lib/supabase';
import { authReturnUrl, type AuthDestination, type AuthMode } from '@/lib/account-auth';
import { passwordError, passwordIssue } from '@/lib/account-flow';
import '@/auth.css';
import '@/account-flow.css';

type Props = { destination?: AuthDestination; initialError?: string; embedded?: boolean; initialMode?: AuthMode; mode?: AuthMode; onModeChange?: (mode: AuthMode) => void };

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
  const [error, setError] = useState(initialError);
  const [sent, setSent] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  function changeMode(next: AuthMode) {
    if (pending.current) return;
    setLocalMode(next); onModeChange?.(next); setPassword(''); setConfirmation(''); setSent(false); setError('');
  }
  async function submit() {
    if (pending.current) return;
    const address = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) { setError('Enter a valid email address.'); return; }
    const invalid = mode === 'signup' ? passwordIssue(password, confirmation) : !password ? 'Enter your website password.' : '';
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
        // Do not infer whether an address is registered from an obfuscated signup response.
        if (mounted.current && !result.data.session) setSent(true);
      }
    } catch (issue) {
      if (mounted.current) setError(passwordError(issue && typeof issue === 'object' ? issue : null));
    } finally {
      pending.current = false;
      if (mounted.current) { setPassword(''); setConfirmation(''); setBusy(false); }
    }
  }
  function openAlternative() { setPassword(''); setConfirmation(''); setAlternative(true); setError(''); }
  if (alternative) return <div className="account-auth">
    <button type="button" className="elroi-text-link" onClick={() => setAlternative(false)}><ArrowLeft size={16}/>Back to password sign-in</button>
    <p className="auth-help">Use a one-time email link, or a text code if you already linked a sign-in number. To stop using email links on future visits, open Preferences → Website password after signing in.</p>
    <EmailLinkSignIn destination={destination} embedded={embedded} initialError={initialError} mode={mode} onModeChange={changeMode}/>
  </div>;
  if (sent) return <div className="account-auth" role="status">
    <Mail size={26}/><h3>Confirm your email once.</h3>
    <p className="auth-help">Check your inbox for the confirmation email for <strong>{email.trim()}</strong>. Once confirmed, regular visits use your email and password—no inbox trip each time.</p>
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
    <p className="auth-help">{mode === 'signin' ? 'Use your email and website password. Your calling PIN is separate.' : 'Choose a website password and confirm your email once. Add a phone number only when you are ready to receive calls.'}</p>
    <Form className="auth-form" onSubmit={event => { event.preventDefault(); void submit(); }} onKeyDown={event => {
      if (embedded && event.key === 'Enter' && event.target instanceof HTMLInputElement) { event.preventDefault(); event.stopPropagation(); void submit(); }
    }}>
      <label className="auth-field" htmlFor={`${id}-email`}>Email address<input id={`${id}-email`} type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} disabled={busy} required placeholder="you@example.com"/></label>
      <label className="auth-field" htmlFor={`${id}-password`}>Website password
        <span className="flow-password-input"><input id={`${id}-password`} type={visible ? 'text' : 'password'} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={event => setPassword(event.target.value)} minLength={mode === 'signup' ? 12 : undefined} maxLength={128} required disabled={busy}/><button type="button" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} disabled={busy} onClick={() => setVisible(value => !value)}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span>
      </label>
      {mode === 'signup' && <label className="auth-field" htmlFor={`${id}-confirm`}>Confirm website password<input id={`${id}-confirm`} type="password" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} minLength={12} maxLength={128} required disabled={busy}/><span>At least 12 characters. Do not use your six-digit calling PIN.</span></label>}
      {error && <p role="alert" className="auth-error">{error}</p>}
      <button type={embedded ? 'button' : 'submit'} onClick={embedded ? () => void submit() : undefined} className="elroi-button elroi-button-primary" disabled={busy}>{busy ? <><LoaderCircle size={18} className="animate-spin"/>Please wait…</> : <><LockKeyhole size={18}/>{mode === 'signin' ? 'Sign in' : 'Create account'}</>}</button>
    </Form>
    <div className="auth-actions"><button type="button" disabled={busy} className="elroi-text-link" onClick={openAlternative}><Mail size={16}/>Use email instead</button>{mode === 'signin' && <button type="button" disabled={busy} className="elroi-text-link" onClick={openAlternative}>Forgot or never set a password?</button>}</div>
    <p className="auth-help">Your browser keeps an active session so you do not have to sign in for every visit. Sign out on shared devices.</p>
  </div>;
}
