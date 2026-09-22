import type { Session, SupabaseClient } from '@supabase/supabase-js';

// Auth may emit SIGNED_IN again when a tab gains focus. Keep the existing page
// state for that event, and never let an older getSession result undo a sign-out.
export function watchAccountSession(
  auth: Pick<SupabaseClient['auth'], 'getSession' | 'onAuthStateChange'>,
  onSession: (session: Session | null, accountChanged: boolean) => void,
  onError: () => void,
  timeoutMs = 12000,
) {
  let active = true;
  let eventReceived = false;
  let settled = false;
  let previous: Session | null | undefined;
  const timer = setTimeout(() => {
    if (active && !settled) onError();
  }, timeoutMs);
  const accept = (session: Session | null) => {
    if (!active) return;
    settled = true;
    clearTimeout(timer);
    const accountChanged = previous === undefined || previous?.user.id !== session?.user.id;
    if (!accountChanged && previous?.access_token === session?.access_token &&
      JSON.stringify(previous?.user) === JSON.stringify(session?.user)) return;
    previous = session;
    onSession(session, accountChanged);
  };
  const { data: listener } = auth.onAuthStateChange((_event, session) => {
    eventReceived = true;
    accept(session);
  });
  void auth.getSession().then(({ data, error }) => {
    if (!active || eventReceived) return;
    if (error) { clearTimeout(timer); onError(); return; }
    accept(data.session);
  }).catch(() => {
    if (active && !eventReceived) { clearTimeout(timer); onError(); }
  });
  return () => { active = false; clearTimeout(timer); listener.subscription.unsubscribe(); };
}
