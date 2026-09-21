import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import Brand from '@/components/Brand';
import { accountAuth, acceptAccountSession } from '@/lib/account-auth-client';
import { confirmationDestination } from '@/lib/account-auth';
import '@/auth.css';

export default function AuthConfirm() {
  const navigate = useNavigate();
  const [link, setLink] = useState(() => window.location.href);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  useEffect(() => {
    // Remove credentials from browser history before any interaction. New email
    // templates put them in the fragment so HTTP requests never contain them.
    window.history.replaceState(window.history.state, '', '/auth/confirm');
  }, []);
  async function confirm() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try {
      await acceptAccountSession(await accountAuth.recoverEmail(link));
      const destination = confirmationDestination(link); setLink(''); navigate(destination, { replace: true });
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Your email could not be verified. Request a new link.'); }
    finally { pending.current = false; setBusy(false); }
  }
  return <div className="elroi-site"><main className="auth-confirm account-auth" id="main-content"><Brand/><h1>Confirm your sign-in.</h1><p>Continue to verify your email and return to El Roi.</p><button type="button" className="elroi-button elroi-button-primary" disabled={busy} onClick={() => void confirm()}>{busy ? <LoaderCircle size={19} className="animate-spin"/> : <ShieldCheck size={19}/>} {busy ? 'Verifying…' : 'Verify and continue'}</button>{error && <p className="auth-error" role="alert">{error}</p>}<Link className="elroi-text-link" to="/account/">Use another email or request a new link</Link></main></div>;
}
