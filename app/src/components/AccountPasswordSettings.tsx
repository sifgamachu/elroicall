import { useEffect, useId, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Check, LockKeyhole } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { passwordIssue, passwordError } from '@/lib/account-flow';

export default function AccountPasswordSettings({ session }: { session: Session }) {
  const id = useId();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const pending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  async function save() {
    if (pending.current) return;
    const invalid = passwordIssue(password, confirmation);
    if (invalid) { setError(invalid); return; }
    pending.current = true; setBusy(true); setError(''); setNotice('');
    try {
      const current = await supabase.auth.getUser();
      if (current.error || current.data.user?.id !== session.user.id) throw new Error('Session changed');
      const result = await supabase.auth.updateUser({ password });
      if (result.error) throw result.error;
      if (result.data.user?.id !== session.user.id) throw new Error('Session changed');
      if (mounted.current) setNotice('Website password saved. Next time, sign in with your email and this password. Your calling PIN is unchanged.');
    } catch (issue) {
      if (mounted.current) setError(passwordError(issue && typeof issue === 'object' ? issue : null));
    } finally {
      pending.current = false;
      if (mounted.current) { setPassword(''); setConfirmation(''); setBusy(false); }
    }
  }
  return <section className="dash-card" id="website-password" aria-labelledby={`${id}-heading`}>
    <div className="dash-card-heading"><span className="elroi-icon-tile"><LockKeyhole size={22}/></span><div><h2 id={`${id}-heading`}>Website password</h2><p>Sign in here without opening your email each time.</p></div></div>
    {session.user.email ? <form className="dash-form-stack" onSubmit={event => { event.preventDefault(); void save(); }}>
      <p className="dash-help">Create or change the password for {session.user.email}. This password opens your dashboard. Your six-digit PIN identifies you during a phone call.</p>
      <label className="dash-field" htmlFor={`${id}-password`}>New website password<input id={`${id}-password`} type="password" autoComplete="new-password" minLength={12} maxLength={128} required disabled={busy} value={password} onChange={event => setPassword(event.target.value)}/></label>
      <label className="dash-field" htmlFor={`${id}-confirmation`}>Confirm new password<input id={`${id}-confirmation`} type="password" autoComplete="new-password" minLength={12} maxLength={128} required disabled={busy} value={confirmation} onChange={event => setConfirmation(event.target.value)}/></label>
      <p className="dash-help">Use at least 12 characters. Do not reuse your calling PIN or another website’s password.</p>
      <button type="submit" className="elroi-button elroi-button-primary" disabled={busy}>{busy ? 'Saving…' : 'Save website password'}</button>
      {notice && <p className="dash-banner" role="status"><Check size={16}/>{notice}</p>}{error && <p className="dash-error" role="alert">{error}</p>}
    </form> : <p className="dash-help">This account uses phone sign-in. Continue using the linked number; do not create a second account just to add a password.</p>}
  </section>;
}
