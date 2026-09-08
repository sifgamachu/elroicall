import { useEffect, useMemo, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { CalendarClock, Check, Clock3, Headphones, LoaderCircle, Pause, Phone, Play, Volume2 } from 'lucide-react';
import { Link } from 'react-router';
import ProductShell from '@/components/ProductShell';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { getPortalMember, type PortalMember } from '@/lib/portal';
import { PHONE_TEL } from '@/lib/phone';
import { ApiError } from '@/lib/api';
import { CONTENT_TYPES, VOICES, WEEKDAYS, localDate, planLabel, schedulingRequest, validatePlan, type CallPlan, type CallPlanInput } from '@/lib/scheduled-calls';

const detectedZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const contentName = (id: string) => CONTENT_TYPES.find(type => type.id === id)?.name ?? id;

export default function Schedule() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [member, setMember] = useState<PortalMember | null>(null);
  const [ready, setReady] = useState<boolean | null>(null);
  const [contentType, setContentType] = useState('');
  const [topic, setTopic] = useState('');
  const [voice, setVoice] = useState('');
  const [time, setTime] = useState('');
  const [timezone, setTimezone] = useState(detectedZone);
  const [recurrence, setRecurrence] = useState<'once' | 'weekly'>('weekly');
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(() => localDate(new Date(), detectedZone()));
  const [duration, setDuration] = useState('10');
  const [consent, setConsent] = useState(false);
  const [email, setEmail] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [plans, setPlans] = useState<CallPlan[]>([]);
  const [plansError, setPlansError] = useState(false);
  const [previewVoice, setPreviewVoice] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const previewSequence = useRef(0);
  const saving = useRef(false);
  const request = useRef<{ fingerprint: string; id: string } | null>(null);
  const zones = useMemo(() => Array.from(new Set([detectedZone(), 'UTC', ...Intl.supportedValuesOf('timeZone')])).sort(), []);

  useEffect(() => {
    let active = true;
    const playback = previewSequence;
    const currentAudio = audio;
    void schedulingRequest<{ ready: boolean }>('/capabilities').then(data => { if (active) setReady(data.ready === true); }).catch(() => { if (active) setReady(false); });
    void supabase.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setAuthLoading(false); } }).catch(() => { if (active) { setAuthLoading(false); setError('Please sign in to manage scheduled calls.'); } });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => { if (active) { setSession(next); setMember(null); setPlans([]); } });
    return () => { active = false; subscription.subscription.unsubscribe(); playback.current++; currentAudio.current?.pause(); };
  }, []);

  useEffect(() => {
    if (!session) return;
    let active = true;
    void getPortalMember(session).then(data => { if (active) setMember(data); }).catch(() => { if (active) setError('We could not load your verified number. Open your room to check it, then return here.'); });
    void schedulingRequest<{ plans: CallPlan[] }>('/plans', session).then(data => { if (active) { setPlans(data.plans); setPlansError(false); } }).catch(() => { if (active) setPlansError(true); });
    return () => { active = false; };
  }, [session, ready]);

  async function refreshPlans() {
    try { const data = await schedulingRequest<{ plans: CallPlan[] }>('/plans', session); setPlans(data.plans); setPlansError(false); }
    catch { setPlansError(true); }
  }
  async function signIn() {
    if (!email.trim() || emailBusy) return;
    setEmailBusy(true); setError('');
    try {
      const { error: issue } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/schedule/` } });
      if (issue) throw issue;
      setNotice('Check your email for your sign-in link. Keep this tab open to preserve your choices.');
    } catch { setError('We could not send your sign-in link. Check your email and try again.'); }
    finally { setEmailBusy(false); }
  }
  async function preview(id: string) {
    audio.current?.pause();
    const sequence = ++previewSequence.current;
    if (previewVoice === id && !previewLoading) { setPreviewVoice(''); return; }
    setPreviewVoice(id); setPreviewLoading(true); setError('');
    try {
      const data = await schedulingRequest<{ url: string }>(`/voice-preview/${id}`, session);
      if (sequence !== previewSequence.current) return;
      const player = new Audio(data.url); audio.current = player;
      player.onended = () => { if (sequence === previewSequence.current) setPreviewVoice(''); };
      player.onerror = () => { if (sequence === previewSequence.current) { setPreviewVoice(''); setError('This sample could not play. Please try again.'); } };
      await player.play();
    } catch { if (sequence === previewSequence.current) { setPreviewVoice(''); setError('This voice sample is unavailable just now. Try again.'); } }
    finally { if (sequence === previewSequence.current) setPreviewLoading(false); }
  }
  async function save() {
    if (saving.current || !session || !ready) return;
    setError(''); setNotice('');
    const choices = { content_type: contentType, topic: topic.trim(), voice, local_time: time, timezone, recurrence, weekdays: recurrence === 'once' ? [] : [...weekdays].sort(), start_date: startDate, duration_minutes: Number(duration), consent };
    const fingerprint = JSON.stringify(choices);
    if (request.current?.fingerprint !== fingerprint) request.current = { fingerprint, id: crypto.randomUUID() };
    const payload = { ...choices, request_id: request.current.id } as CallPlanInput;
    const validation = validatePlan(payload);
    if (validation) { setError(validation); return; }
    if (!member?.phone_verified) { setError('Verify your phone in your room before scheduling a call.'); return; }
    saving.current = true; setBusy(true);
    try {
      const data = await schedulingRequest<{ plan: CallPlan }>('/plans', session, payload);
      if (!data.plan?.id || !data.plan.next_run_at) throw new Error('Unconfirmed schedule');
      setPlans(previous => [data.plan, ...previous.filter(plan => plan.id !== data.plan.id)]);
      setNotice(`Scheduled. Your next ${contentName(data.plan.content_type).toLowerCase()} call is ${new Intl.DateTimeFormat(undefined, { timeZone: data.plan.timezone, dateStyle: 'full', timeStyle: 'short' }).format(new Date(data.plan.next_run_at))} (${data.plan.timezone.replaceAll('_', ' ')}).`);
      request.current = null; setConsent(false);
    } catch (issue) {
      setError(issue instanceof ApiError && issue.status === 400 ? issue.message : issue instanceof ApiError && issue.status === 409 ? 'This schedule conflicts with an existing call or needs a later time. Check your saved calls below.' : 'We could not confirm the schedule. Check your saved calls before trying again.');
      void refreshPlans();
    } finally { saving.current = false; setBusy(false); }
  }
  async function pause(plan: CallPlan) {
    if (saving.current || !session) return;
    saving.current = true; setBusy(true); setError('');
    try {
      await schedulingRequest(`/plans/${plan.id}/pause`, session, {});
      setPlans(previous => previous.map(item => item.id === plan.id ? { ...item, active: false, next_run_at: null } : item));
      setNotice('Future calls for this schedule are paused. You can still call El Roi anytime.');
    } catch { setError('We could not confirm the pause. Refresh your saved calls and try again.'); }
    finally { saving.current = false; setBusy(false); }
  }
  function reuse(plan: CallPlan) {
    setContentType(plan.content_type); setTopic(plan.topic); setVoice(plan.voice); setTime(plan.local_time.slice(0,5)); setTimezone(plan.timezone); setRecurrence(plan.recurrence); setWeekdays(plan.weekdays); setStartDate(localDate(new Date(), plan.timezone)); setDuration(String(plan.duration_minutes)); setConsent(false); setNotice('These choices are ready to schedule again. Review the date and confirm below.');
    document.getElementById('schedule-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  return <ProductShell eyebrow="ON YOUR SCHEDULE" title="Make room for Scripture." description="Choose what you want to hear and when. We call you at the time you choose. You can also call El Roi anytime.">
    <div className="elroi-schedule-layout">
      <form id="schedule-form" className="elroi-schedule-form" onSubmit={event => { event.preventDefault(); void save(); }}>
        <fieldset className="elroi-schedule-card" disabled={busy}><legend><span>1</span> What is this call for?</legend>
          <RadioGroup value={contentType} onValueChange={setContentType} className="elroi-content-options" aria-label="Call content">
            {CONTENT_TYPES.map(type => <label className="elroi-choice" data-selected={contentType === type.id} key={type.id}><RadioGroupItem value={type.id} /><span><strong>{type.name}</strong><span>{type.description}</span></span></label>)}
          </RadioGroup>
          <label className="elroi-field" htmlFor="lesson-topic">Topic or Bible passage<input id="lesson-topic" value={topic} onChange={event => setTopic(event.target.value)} maxLength={160} placeholder="For example: the life of Jesus, prayer, or Psalm 23" required /></label>
          <p className="elroi-small">Tell us what you want to learn. Each call follows the format you choose.</p>
        </fieldset>
        <fieldset className="elroi-schedule-card" disabled={busy}><legend><span>2</span> Choose your voice</legend><p className="elroi-schedule-help">The same El Roi Guide, in the voice you prefer. All voices are AI generated.</p>
          <RadioGroup value={voice} onValueChange={setVoice} className="elroi-voice-options" aria-label="Narration voice">
            {VOICES.map(option => <div key={option.id} className="elroi-voice-option" data-selected={voice === option.id}><label><RadioGroupItem value={option.id} /><Volume2 size={20} /><strong>{option.name}</strong></label><button type="button" disabled={!ready || !session || busy} onClick={() => void preview(option.id)} aria-label={`${previewVoice === option.id ? 'Stop' : 'Preview'} ${option.name}`} aria-pressed={previewVoice === option.id}>{previewVoice === option.id ? previewLoading ? <LoaderCircle size={16} className="animate-spin" /> : <Pause size={16} /> : <Play size={16} />}<span>{previewVoice === option.id ? previewLoading ? 'Loading' : 'Stop' : 'Listen'}</span></button></div>)}
          </RadioGroup><p className="elroi-small">{ready ? session ? 'Listen to the same short sample in each voice.' : 'Sign in below to listen to voice samples.' : 'Voice samples will be available when scheduled calls open.'}</p>
        </fieldset>
        <fieldset className="elroi-schedule-card" disabled={busy}><legend><span>3</span> When should we call?</legend>
          <RadioGroup value={recurrence} onValueChange={value => setRecurrence(value as 'once' | 'weekly')} className="elroi-recurrence" aria-label="Repeat"><label><RadioGroupItem value="weekly" />Repeat on chosen days</label><label><RadioGroupItem value="once" />Just once</label></RadioGroup>
          {recurrence === 'weekly' && <div className="elroi-days" role="group" aria-label="Days to call">{WEEKDAYS.map((day, index) => <label key={day} data-selected={weekdays.includes(index)}><Checkbox checked={weekdays.includes(index)} onCheckedChange={checked => setWeekdays(previous => checked ? [...previous, index].sort() : previous.filter(item => item !== index))} aria-label={day} /><span>{day.slice(0,3)}</span></label>)}</div>}
          <div className="elroi-schedule-fields"><label className="elroi-field" htmlFor="call-date">{recurrence === 'once' ? 'Call date' : 'Start on or after'}<input id="call-date" type="date" required value={startDate} min={localDate(new Date(), timezone)} onChange={event => setStartDate(event.target.value)} /></label><label className="elroi-field" htmlFor="call-time">Call time<input id="call-time" type="time" required value={time} onChange={event => setTime(event.target.value)} /></label></div>
          <div className="elroi-schedule-fields"><div className="elroi-field"><label htmlFor="call-zone">Time zone</label><Select value={timezone} onValueChange={setTimezone}><SelectTrigger id="call-zone"><SelectValue /></SelectTrigger><SelectContent className="max-h-80" position="popper">{zones.map(zone => <SelectItem key={zone} value={zone}>{zone.replaceAll('_',' ')}</SelectItem>)}</SelectContent></Select></div><div className="elroi-field"><label htmlFor="call-length">Approximate length</label><Select value={duration} onValueChange={setDuration}><SelectTrigger id="call-length"><SelectValue /></SelectTrigger><SelectContent>{['5','10','15'].map(minutes => <SelectItem key={minutes} value={minutes}>{minutes} minutes</SelectItem>)}</SelectContent></Select></div></div>
          <p className="elroi-small">Choose a time at least 20 minutes away so we can prepare your audio. Recurring calls follow this time zone when clocks change. If your time is skipped by daylight saving, that day's call is skipped.</p>
        </fieldset>
        <fieldset className="elroi-schedule-card" disabled={busy}><legend><span>4</span> Your number. Your permission.</legend>
          {authLoading ? <p role="status">Checking your sign-in…</p> : !session ? <div><p className="elroi-schedule-help">Sign in to use your verified phone number and manage your calls.</p><label className="elroi-field" htmlFor="schedule-email">Email<input id="schedule-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" /></label><button type="button" className="elroi-button elroi-button-dark" onClick={() => void signIn()} disabled={emailBusy || !email.trim()}>{emailBusy ? 'Sending…' : 'Email me a sign-in link'}</button></div> : !member ? <p>Loading your calling details… <Link to="/account/" className="elroi-text-link">Open your room</Link></p> : member.phone_verified ? <p className="elroi-verified"><Check size={18} />Calls go to your verified number ending in {member.phone?.slice(-4)}.</p> : <p>Verify your phone number before scheduling. <Link to="/account/#calling-preferences" className="elroi-text-link">Verify in your room</Link></p>}
          <label className="elroi-schedule-consent"><Checkbox checked={consent} onCheckedChange={checked => setConsent(checked === true)} /><span>I want El Roi Call to place AI-narrated calls to my verified number for the content, days, and time I chose. I can pause future calls or press 9 during a scheduled call to stop this schedule. Consent is not a condition of purchase. Carrier charges may apply.</span></label>
          {ready === false && <p className="elroi-availability" role="status">Scheduled calls are being connected. You can explore your choices here; no call is booked yet. <a href={PHONE_TEL}>Call El Roi anytime.</a></p>}
          {error && <p className="elroi-status-error" role="alert">{error}</p>}{notice && <p className="elroi-schedule-notice" role="status">{notice}</p>}
          <button type="submit" disabled={busy || !ready || !session || !member?.phone_verified || !consent} className="elroi-button elroi-button-primary elroi-schedule-save"><CalendarClock size={19} />{busy ? 'Saving…' : ready === null ? 'Checking availability…' : 'Confirm my schedule'}</button>
        </fieldset>
      </form>
      <aside className="elroi-schedule-summary"><span className="elroi-icon-tile"><Headphones size={24} /></span><p className="elroi-kicker">YOUR CALL</p><h2>{contentType ? contentName(contentType) : 'A moment to grow.'}</h2><p>{topic || 'Your chosen topic or passage will guide the call.'}</p><dl><div><dt>Voice</dt><dd>{VOICES.find(item => item.id === voice)?.name || 'Choose a voice'}</dd></div><div><dt>Time</dt><dd>{time || 'Choose a time'}</dd></div><div><dt>Days</dt><dd>{recurrence === 'once' ? `Once · ${startDate}` : weekdays.length ? planLabel({ recurrence, weekdays, start_date: startDate }) : 'Choose your days'}</dd></div><div><dt>Length</dt><dd>About {duration} minutes</dd></div></dl><p className="elroi-small"><Clock3 size={14} />{timezone.replaceAll('_',' ')}</p><div className="elroi-schedule-anytime"><Phone size={20} /><strong>Something on your heart now?</strong><p>You can always start your own conversation.</p><a href={PHONE_TEL} className="elroi-text-link">Call El Roi anytime</a></div></aside>
    </div>
    {session && <section className="elroi-saved-plans"><div className="elroi-saved-heading"><div><p className="elroi-kicker">YOU'RE IN CONTROL</p><h2>Your scheduled calls</h2></div><button type="button" className="elroi-text-link" onClick={() => void refreshPlans()}>Refresh</button></div>{plansError ? <p role="alert">We could not load your schedules. Refresh to try again.</p> : !plans.length ? <p>No scheduled calls yet. Your call-anytime service is always separate.</p> : <div className="elroi-plans-grid">{plans.map(plan => <article key={plan.id} className="elroi-plan-card"><div><span className="elroi-kicker">{plan.active && plan.next_run_at ? 'SCHEDULED' : plan.active ? 'FINISHED' : 'PAUSED'}</span><h3>{contentName(plan.content_type)}</h3><p>{plan.topic}</p></div><p>{plan.local_time.slice(0,5)} · {plan.timezone.replaceAll('_',' ')}<br />{planLabel(plan)} · {plan.voice} · about {plan.duration_minutes} min</p>{plan.next_run_at && <p>Next: {new Intl.DateTimeFormat(undefined, { timeZone: plan.timezone, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(plan.next_run_at))}</p>}{plan.last_status && <p className="elroi-small">Last call: {plan.last_status.replaceAll('_',' ')}</p>}{Boolean(plan.references?.length) && <p className="elroi-small">Scripture references: {plan.references?.join('; ')}</p>}<button type="button" disabled={busy} className="elroi-text-link" onClick={() => plan.active && plan.next_run_at ? void pause(plan) : reuse(plan)}>{plan.active && plan.next_run_at ? <><Pause size={15} />Pause future calls</> : 'Schedule again'}</button></article>)}</div>}</section>}
  </ProductShell>;
}
