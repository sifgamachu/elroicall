import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, Check, Link2, LoaderCircle, Mail, MessageSquare } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { accountAuth, acceptAccountSession } from '@/lib/account-auth-client';
import type { AuthDestination, AuthMethods, AuthTokens } from '@/lib/account-auth';
import { normalizePhone } from '@/lib/phone';
import '@/auth.css';

export default function AccountSignIn({ destination = '/account/', initialError = '', embedded = false }: { destination?: AuthDestination; initialError?: string; embedded?: boolean }) {
  const id = useId();
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [methods, setMethods] = useState<AuthMethods | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [entry, setEntry] = useState<'link' | 'code'>('link');
  const [credential, setCredential] = useState('');
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState(initialError);
  const [notice, setNotice] = useState('');
  const pending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    void accountAuth.methods().then(value => { if (mounted.current) setMethods(value); }).catch(() => {});
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  function identity() {
    if (method === 'phone') {
      const value = normalizePhone(phone);
      if (!value) throw new Error('Enter your phone number with its country code.');
      return value;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error('Enter the email address for your account.');
    return email.trim();
  }
  async function run(task: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError(''); setNotice('');
    try { await task(); }
    catch (issue) { if (mounted.current) setError(issue instanceof Error ? issue.message : 'Verification could not be completed. Please try again.'); }
    finally { pending.current = false; if (mounted.current) setBusy(false); }
  }
  async function send() {
    if (cooldown) return;
    await run(async () => {
      const recipient = identity();
      if (method === 'phone' && !methods?.phone) throw new Error('Phone sign-in is unavailable right now. Choose email to continue.');
      setCooldown(60);
      if (method === 'email') await accountAuth.sendEmail(recipient, destination);
      else await accountAuth.sendPhone(recipient);
      if (!mounted.current) return;
      setSent(true); setCredential('');
      setNotice(method === 'email' ? 'Check your inbox and spam folder. Open your sign-in link, or paste it below to finish in this tab.' : 'If this number is linked to your account, a text message is on its way. Enter its code below.');
    });
  }
  async function verify() {
    await run(async () => {
      const recipient = identity();
      const secret = credential.trim();
      let tokens: AuthTokens;
      try {
        tokens = method === 'email' && entry === 'link'
          ? await accountAuth.recoverEmail(secret, recipient)
          : await accountAuth.verifyCode(method === 'email' ? 'email' : 'sms', recipient, secret);
      } finally { if (mounted.current) setCredential(''); }
      if (mounted.current) await acceptAccountSession(tokens);
    });
  }
  function changeMethod(value: string) {
    if (pending.current) return;
    setMethod(value as 'email' | 'phone'); setSent(false); setRecovery(false); setCredential(''); setError(''); setNotice('');
  }
  const verifying = sent || recovery;
  const Form = embedded ? 'div' : 'form';
  return <div className="account-auth">
    <h3>How would you like to verify?</h3>
    <RadioGroup value={method} onValueChange={changeMethod} aria-label="Verification method" className="auth-methods" disabled={busy}>
      <label data-selected={method === 'email'}><RadioGroupItem value="email" /><Mail size={20} /><span><strong>Email</strong><small>Link or email code</small></span></label>
      <label data-selected={method === 'phone'}><RadioGroupItem value="phone" /><MessageSquare size={20} /><span><strong>Phone</strong><small>Code by text</small></span></label>
    </RadioGroup>
    {method === 'phone' && <p className="auth-help" role="status">{methods?.phone ? 'Use a number already linked to your account. To add one, sign in with email and open Preferences.' : methods === null ? 'Checking text-message availability. You can use email now.' : 'Text-message sign-in is not available yet. Choose email to continue.'}</p>}
    <Form className="auth-form" onSubmit={event => { event.preventDefault(); void (verifying ? verify() : send()); }} onKeyDown={event => {
      if (embedded && event.key === 'Enter' && event.target instanceof HTMLInputElement) { event.preventDefault(); event.stopPropagation(); void (verifying ? verify() : send()); }
    }}>
      {method === 'email' ? <label className="auth-field" htmlFor={`${id}-email`}>Email address<input id={`${id}-email`} type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} disabled={busy} readOnly={sent} required placeholder="you@example.com" /></label>
        : <label className="auth-field" htmlFor={`${id}-phone`}>Phone number<input id={`${id}-phone`} type="tel" autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} disabled={busy} readOnly={sent} required placeholder="+1 (202) 555-0123" /><span>Include your country code.</span></label>}
      {verifying && <>
        {method === 'email' && <RadioGroup aria-label="Email verification format" className="auth-entry-method" value={entry} disabled={busy} onValueChange={value => { setEntry(value as 'link' | 'code'); setCredential(''); setError(''); }}><label><RadioGroupItem value="link" />Use my email link</label><label><RadioGroupItem value="code" />I received a code</label></RadioGroup>}
        <label className="auth-field" htmlFor={`${id}-credential`}>{method === 'email' && entry === 'link' ? 'Paste your sign-in link' : 'Verification code'}
          <input id={`${id}-credential`} type={method === 'email' && entry === 'link' ? 'password' : 'text'} inputMode={method === 'email' && entry === 'link' ? 'url' : 'numeric'} autoComplete={method === 'email' && entry === 'link' ? 'off' : 'one-time-code'} spellCheck={false} maxLength={method === 'email' && entry === 'link' ? 16000 : 10} value={credential} onChange={event => setCredential(method === 'email' && entry === 'link' ? event.target.value : event.target.value.replace(/\D/g, ''))} disabled={busy} required placeholder={method === 'email' && entry === 'link' ? 'Paste the full link here' : 'Enter your code'} />
          <span>{method === 'email' && entry === 'link' ? 'Copy the sign-in button’s link from your email. If its page failed to open, you can also copy the full address from that page.' : 'Use the code from your latest verification message.'}</span>
        </label>
      </>}
      <button type={embedded ? 'button' : 'submit'} onClick={embedded ? () => void (verifying ? verify() : send()) : undefined} className="elroi-button elroi-button-primary" disabled={busy || method === 'phone' && !methods?.phone || !verifying && cooldown > 0 || verifying && !credential.trim()}>
        {busy ? <><LoaderCircle size={18} className="animate-spin" />Please wait…</> : verifying ? <><Check size={18} />Verify and continue</> : cooldown ? `Try again in ${cooldown}s` : method === 'email' ? <>Send verification email <ArrowUpRight size={18} /></> : <>Text me a code <MessageSquare size={18} /></>}
      </button>
    </Form>
    {notice && <p role="status" className="auth-notice">{notice}</p>}{error && <p role="alert" className="auth-error">{error}</p>}
    <div className="auth-actions">
      {!verifying && method === 'email' && <button type="button" className="elroi-text-link" disabled={busy} onClick={() => { setRecovery(true); setError(''); }}><Link2 size={16} />Already have an email? Use it here</button>}
      {verifying && <><button type="button" className="elroi-text-link" disabled={busy || cooldown > 0} onClick={() => void send()}>{cooldown ? `Send again in ${cooldown}s` : 'Send a new verification message'}</button><button type="button" className="elroi-text-link" disabled={busy} onClick={() => { setSent(false); setRecovery(false); setCredential(''); setNotice(''); setError(''); }}>Change {method === 'email' ? 'email' : 'phone number'}</button></>}
    </div>
  </div>;
}
