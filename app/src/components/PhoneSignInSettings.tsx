import { useEffect, useId, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { MessageSquare, ShieldCheck } from 'lucide-react';
import { accountAuth, acceptAccountSession } from '@/lib/account-auth-client';
import { normalizePhone } from '@/lib/phone';
import '@/auth.css';

export default function PhoneSignInSettings({ session }: { session: Session }) {
  const id = useId();
  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState(session.user.phone ? `+${session.user.phone.replace(/^\+/, '')}` : '');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const pending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    void accountAuth.methods().then(methods => { if (mounted.current) setReady(methods.phone); }).catch(() => {});
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => { if (!cooldown) return; const timer = setTimeout(() => setCooldown(value => Math.max(0, value - 1)), 1000); return () => clearTimeout(timer); }, [cooldown]);
  async function submit() {
    const normalized = normalizePhone(phone);
    if (pending.current || !normalized || !ready || !sent && cooldown) return;
    pending.current = true; setBusy(true); setError(''); setNotice('');
    try {
      if (sent) {
        const tokens = await accountAuth.verifyCode('phone_change', normalized, code, session.user.id);
        if (!mounted.current) return;
        await acceptAccountSession(tokens);
        setCode(''); setSent(false); setNotice('Phone sign-in is linked to this account. Next time, you can choose email or phone.');
      } else {
        setCooldown(60);
        await accountAuth.linkPhone(session.access_token, normalized, session.user.id);
        if (mounted.current) { setSent(true); setNotice('Enter the code sent by text to link this number to your existing account.'); }
      }
    } catch (issue) { if (mounted.current) setError(issue instanceof Error ? issue.message : 'Phone sign-in could not be updated.'); }
    finally { pending.current = false; if (mounted.current) setBusy(false); }
  }
  return <section className="dash-card account-auth" aria-labelledby={`${id}-heading`}>
    <div className="dash-card-heading"><span className="elroi-icon-tile"><ShieldCheck size={22} /></span><div><h2 id={`${id}-heading`}>Your sign-in methods</h2><p>Two ways into the same account.</p></div></div>
    <p className="auth-help">Email: {session.user.email || 'Not linked'}</p>
    {session.user.phone && session.user.phone_confirmed_at && <p className="auth-notice">Phone sign-in linked: +{session.user.phone.replace(/^\+/, '')}</p>}
    {!ready && <p className="auth-help" role="status">Text-message verification is not available yet. Your email sign-in remains available.</p>}
    <p className="auth-help">Add a phone here to sign in with text-message codes. This keeps your existing account and history. Your number for receiving El Roi calls is managed separately below.</p>
    <form className="auth-form" onSubmit={event => { event.preventDefault(); void submit(); }}>
      <label className="auth-field" htmlFor={`${id}-phone`}>Phone for sign-in<input id={`${id}-phone`} type="tel" autoComplete="tel" value={phone} disabled={busy || !ready} readOnly={sent} onChange={event => setPhone(event.target.value)} required placeholder="+1 (202) 555-0123" /></label>
      {sent && <label className="auth-field" htmlFor={`${id}-code`}>Code from your text<input id={`${id}-code`} inputMode="numeric" autoComplete="one-time-code" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0,10))} disabled={busy} pattern="[0-9]{6,10}" required /></label>}
      <button type="submit" className="elroi-button elroi-button-primary" disabled={busy || !ready || !normalizePhone(phone) || !sent && cooldown > 0 || sent && !/^\d{6,10}$/.test(code)}><MessageSquare size={17} />{busy ? 'Please wait…' : sent ? 'Verify and link phone' : cooldown ? `Try again in ${cooldown}s` : 'Text a verification code'}</button>
      {sent && <button type="button" className="elroi-text-link" disabled={busy} onClick={() => { setSent(false); setCode(''); setNotice(''); }}>Change number or request a new code</button>}
    </form>
    {notice && <p role="status" className="auth-notice">{notice}</p>}{error && <p role="alert" className="auth-error">{error}</p>}
  </section>;
}
