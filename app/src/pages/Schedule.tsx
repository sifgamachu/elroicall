import { useEffect, useMemo, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ArrowLeft, ArrowRight, CalendarClock, Check, Headphones, LoaderCircle, Pause, Phone, Play } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import ProductShell from '@/components/ProductShell';
import AccountSignIn from '@/components/AccountSignIn';
import MemberControls from '@/components/MemberControls';
import { supabase } from '@/lib/supabase';
import { watchAccountSession } from '@/lib/account-session';
import { getPortalMember, type PortalMember } from '@/lib/portal';
import { PHONE_TEL } from '@/lib/phone';
import { ApiError, fetchJson, SUPABASE_URL } from '@/lib/api';
import { CONTENT_TYPES, JOURNEYS, VOICES, WEEKDAYS, journeyName, localDate, planLabel, schedulingRequest, validatePlan, type CallPlan, type CallPlanInput } from '@/lib/scheduled-calls';
import { formatMoment, type Capabilities, type MemberPreferences } from '@/lib/dashboard';
import { clearScheduleDraft, readScheduleDraft, writeScheduleDraft, type ScheduleChoices } from '@/lib/schedule-draft';
import '@/dashboard.css';
import '@/account-flow.css';

const steps = ['Content & voice', 'Date & time', 'Your number', 'Review & confirm'];
const zoneNow = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const contentName = (id: string) => CONTENT_TYPES.find(type => type.id === id)?.name || 'Scripture call';
const voiceName = (id: string) => VOICES.find(voice => voice.id === id)?.name || 'Choose a voice';
function initialChoices(search: string): ScheduleChoices {
  const query = new URLSearchParams(search);
  const journey = JOURNEYS.find(item => item.id === query.get('journey'));
  return { content_type: journey ? 'bible_study' : CONTENT_TYPES.some(item => item.id === query.get('content')) ? query.get('content')! : '', topic: (query.get('topic') || journey?.topic || '').slice(0,160), voice: '', local_time: '', timezone: zoneNow(), recurrence: journey ? 'weekly' : 'once', weekdays: journey ? [0,1,2,3,4,5,6] : [], start_date: localDate(new Date(),zoneNow()), duration_minutes: journey?.duration || 10, journey_slug: journey?.id || null };
}
function withJourney(choices: ScheduleChoices, requestId: string, consent: boolean): CallPlanInput {
  const { journey_slug, ...rest } = choices;
  return { ...rest, topic: rest.topic.trim(), weekdays: rest.recurrence === 'once' ? [] : rest.weekdays, request_id: requestId, consent, ...(journey_slug ? {journey_slug,journey_total:7} : {}) } as CallPlanInput;
}
function clearDraft() { try { clearScheduleDraft(window.localStorage); } catch { /* Storage may be unavailable. */ } }

export default function Schedule() {
  const location = useLocation();
  const entrySearch = useRef(location.search);
  const fromPlan = new URLSearchParams(location.search).get('from');
  const [choices, setChoices] = useState<ScheduleChoices>(() => initialChoices(location.search));
  const [step, setStep] = useState(0);
  const [session, setSession] = useState<Session|null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [draftReady, setDraftReady] = useState(false);
  const [member, setMember] = useState<PortalMember|null>(null);
  const [memberError, setMemberError] = useState('');
  const [caps, setCaps] = useState<Capabilities|null>(null);
  const [availabilityError, setAvailabilityError] = useState(false);
  const [phoneReady, setPhoneReady] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [success, setSuccess] = useState<CallPlan|null>(null);
  const [previewVoice, setPreviewVoice] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const accountId = useRef<string|null>(null);
  const initialised = useRef(false);
  const dirty = useRef(false);
  const defaultsApplied = useRef('');
  const requestId = useRef(crypto.randomUUID());
  const saving = useRef(false);
  const audio = useRef<HTMLAudioElement|null>(null);
  const previewSequence = useRef(0);
  const mounted = useRef(true);
  const heading = useRef<HTMLHeadingElement|null>(null);
  const zones = useMemo(() => Array.from(new Set([zoneNow(),'UTC',...Intl.supportedValuesOf('timeZone')])).sort(),[]);

  useEffect(() => {
    mounted.current = true;
    const playback = previewSequence; const sound = audio;
    void fetchJson<{ready:boolean}>(`${SUPABASE_URL}/functions/v1/phone-scheduling/capabilities`,{},12000).then(result=>{if(mounted.current)setPhoneReady(result.status===200&&result.data.ready===true);}).catch(()=>{});
    void schedulingRequest<Capabilities>('/capabilities').then(value => { if(mounted.current) setCaps(value); }).catch(() => { if(mounted.current) setAvailabilityError(true); });
    const stop = watchAccountSession(supabase.auth,(next,accountChanged) => {
      const owner = next?.user.id || null;
      const switched = initialised.current && accountId.current !== owner;
      const leavingAccount = switched && accountId.current !== null;
      if(leavingAccount) { clearDraft(); setChoices(initialChoices(entrySearch.current)); setStep(0); setSuccess(null); dirty.current=false; defaultsApplied.current=''; requestId.current=crypto.randomUUID(); }
      if(!initialised.current || switched) {
        try {
          const restored = readScheduleDraft(window.localStorage,owner);
          if(restored && !new URLSearchParams(entrySearch.current).has('from') && !leavingAccount) {
            setChoices(restored.choices); setStep(restored.step); requestId.current=restored.requestId; dirty.current=true;
            setNotice('Your choices are restored. Nothing is booked until you review and confirm.');
          }
        } catch { /* Booking still works without browser storage. */ }
        initialised.current=true; setDraftReady(true); setConsent(false);
      }
      if(accountChanged || switched) { previewSequence.current++; audio.current?.pause(); setPreviewVoice(''); setPreviewLoading(false); setMember(null); setMemberError(''); setConsent(false); }
      accountId.current=owner; setSession(next); setAuthLoading(false);
    },() => { setAuthLoading(false); setError('We could not restore your sign-in. Try signing in again. Your choices are still here.'); });
    return () => { mounted.current=false; stop(); playback.current++; sound.current?.pause(); };
  },[]);

  useEffect(() => {
    if(!draftReady || success || !dirty.current) return;
    try { writeScheduleDraft(window.localStorage,{owner:session?.user.id || null,savedAt:Date.now(),choices,requestId:requestId.current,step}); } catch { /* Storage is optional. */ }
  },[choices,step,session?.user.id,draftReady,success]);

  useEffect(() => {
    if(!session) return;
    let active=true; const owner=session.user.id;
    void getPortalMember(session).then(value=>{if(active && accountId.current===owner){setMember(value);setMemberError('');}}).catch(()=>{if(active)setMemberError('Your calling number could not be loaded. Try again below.');});
    if(fromPlan && defaultsApplied.current!==fromPlan) {
      void schedulingRequest<{plans:CallPlan[]}>('/plans',session).then(({plans})=>{
        if(!active || accountId.current!==owner || defaultsApplied.current===fromPlan || dirty.current) return;
        defaultsApplied.current=fromPlan; const plan=plans.find(item=>item.id===fromPlan);
        if(!plan){setError('That schedule was not found in this account. Start a new schedule below.');return;}
        dirty.current=true; requestId.current=crypto.randomUUID(); setConsent(false);
        setChoices({content_type:plan.content_type,topic:plan.topic,voice:plan.voice,local_time:plan.local_time.slice(0,5),timezone:plan.timezone,recurrence:plan.recurrence,weekdays:plan.weekdays,start_date:localDate(new Date(),plan.timezone),duration_minutes:plan.duration_minutes,journey_slug:plan.journey_slug||null});
        setStep(0); setNotice('These choices create a new schedule. They do not edit or restart the original plan. Review the date before confirming.');
      }).catch(()=>{if(active)setError('We could not copy that schedule. Return to Scheduled calls and try again.');});
    } else if(!fromPlan && defaultsApplied.current!==owner) {
      void schedulingRequest<{preferences:MemberPreferences}>('/preferences',session).then(({preferences:p})=>{
        if(!active || accountId.current!==owner || dirty.current) return;
        defaultsApplied.current=owner;
        setChoices(current=>({...current,voice:current.voice||p.default_voice||'',content_type:current.content_type||p.default_content_type||'',timezone:p.timezone||current.timezone,start_date:localDate(new Date(),p.timezone||current.timezone),duration_minutes:current.journey_slug?current.duration_minutes:p.duration_minutes}));
      }).catch(()=>{});
    }
    return ()=>{active=false;};
  },[session,fromPlan]);
  useEffect(()=>{heading.current?.focus();},[step]);

  function change(patch: Partial<ScheduleChoices>) {
    if(saving.current)return;
    dirty.current=true; requestId.current=crypto.randomUUID(); setChoices(previous=>({...previous,...patch})); setConsent(false); setError(''); setNotice('');
  }
  function chooseJourney(slug:string) {
    const journey=JOURNEYS.find(item=>item.id===slug); if(!journey)return;
    change({journey_slug:journey.id,content_type:'bible_study',topic:journey.topic,recurrence:'weekly',weekdays:[0,1,2,3,4,5,6],duration_minutes:journey.duration});
  }
  function continueStep() {
    setError(''); dirty.current=true;
    if(step===0) {
      if(!CONTENT_TYPES.some(item=>item.id===choices.content_type) || !choices.topic.trim()) {setError('Choose a call format and enter a topic or Bible passage.');return;}
      if(!VOICES.some(item=>item.id===choices.voice)){setError('Choose the voice you would like to hear.');return;}
    }
    if(step===1) {
      // Validate the proposal only; permission is collected separately and never inferred at save.
      const issue=validatePlan(withJourney(choices,requestId.current,true));
      if(issue){setError(issue);return;}
    }
    if(step===2 && (!session || !member?.phone_verified)){setError('Sign in and verify your calling number before continuing.');return;}
    setStep(value=>Math.min(3,value+1));
  }
  async function refreshMember() {
    if(!session)return;
    const owner=session.user.id; setMemberError('');
    try {const value=await getPortalMember(session);if(mounted.current && accountId.current===owner){setMember(value);setConsent(false);}}
    catch {if(mounted.current && accountId.current===owner)setMemberError('We could not refresh your number. Please try again.');}
  }
  async function preview(id:string) {
    audio.current?.pause(); const sequence=++previewSequence.current;
    if(previewVoice===id && !previewLoading){setPreviewVoice('');return;}
    setPreviewVoice(id);setPreviewLoading(true);setError('');
    try {
      const result=await schedulingRequest<{url:string}>(`/voice-preview/${id}`,session);
      if(sequence!==previewSequence.current || !mounted.current)return;
      const player=new Audio(result.url);audio.current=player;
      player.onended=()=>{if(sequence===previewSequence.current&&mounted.current)setPreviewVoice('');};
      player.onerror=()=>{if(sequence===previewSequence.current){setPreviewVoice('');setError('That sample could not play. Try again.');}};
      await player.play();
    } catch {if(sequence===previewSequence.current && mounted.current){setPreviewVoice('');setError('This sample is unavailable right now.');}}
    finally {if(sequence===previewSequence.current && mounted.current)setPreviewLoading(false);}
  }
  function complete(plan:CallPlan,owner:string) {
    if(!mounted.current || accountId.current!==owner)return;
    setSuccess(plan);setConsent(false);setError('');setNotice('');clearDraft();
  }
  async function save() {
    if(saving.current || success || !session || !caps?.ready)return;
    if(!member?.phone_verified){setError('Verify your calling number first.');setStep(2);return;}
    const payload=withJourney(choices,requestId.current,consent);
    const issue=validatePlan(payload);if(issue){setError(issue);return;}
    const owner=session.user.id; saving.current=true;setBusy(true);setError('');
    try {
      const result=await schedulingRequest<{plan:CallPlan}>('/plans',session,payload);
      if(!result.plan?.id || !result.plan.next_run_at)throw Error('Unconfirmed schedule');
      complete(result.plan,owner);
    } catch(issue) {
      if(!mounted.current || accountId.current!==owner)return;
      setError(issue instanceof ApiError && issue.status===400 ? issue.message : issue instanceof ApiError && issue.status===409 ? 'This time conflicts with an existing call or is too soon. Review your date and time, or check Scheduled calls.' : 'The booking is not yet confirmed. Checking your saved schedules; retrying these unchanged choices uses the same request ID.');
      // Resolve an uncertain response without creating another plan or changing its request ID.
      try {const result=await schedulingRequest<{plans:CallPlan[]}>('/plans',session);const saved=result.plans.find(plan=>plan.request_id===payload.request_id);if(saved?.id && saved.next_run_at)complete(saved,owner);} catch { /* Keep the unconfirmed state and original request ID. */ }
    } finally {saving.current=false;if(mounted.current)setBusy(false);}
  }
  if(success)return <ProductShell eyebrow="BOOKING CONFIRMED" title="Your call is scheduled." description="These details were confirmed by the scheduling service.">
    <section className="dash-card flow-confirmation" role="status"><span className="elroi-icon-tile"><Check size={28}/></span><h2>{journeyName(success.journey_slug)||contentName(success.content_type)}</h2><p>{success.topic}</p><dl className="flow-review"><div><dt>Next call</dt><dd>{formatMoment(success.next_run_at!,success.timezone)}</dd></div><div><dt>Time zone</dt><dd>{success.timezone.replaceAll('_',' ')}</dd></div><div><dt>Calling</dt><dd>Verified number ending in {success.phone_last4}</dd></div><div><dt>Voice & length</dt><dd>{voiceName(success.voice)} · about {success.duration_minutes} minutes</dd></div><div><dt>Repeats</dt><dd>{success.journey_slug?'Daily, ending after call seven':planLabel(success)}</dd></div></dl><p className="dash-help">Manage or pause this plan in Scheduled calls. Call history will show what happened after each call.</p><Link to="/account/?view=schedules" className="elroi-button elroi-button-primary">View my scheduled calls <ArrowRight size={17}/></Link><Link to="/account/" className="elroi-text-link">Back to overview</Link></section>
  </ProductShell>;
  return <ProductShell eyebrow="SCHEDULE A CALL" title="A call that fits your life." description="Choose your content, pick a time, verify your number, then review everything before booking.">
    {phoneReady&&<details className="flow-details elroi-phone-booking"><summary>Prefer to schedule over the phone?</summary><p>Tell the guide your topic, voice, and calling time. Review the details and confirm on a brief callback. Allow at least 40 minutes before the first call.</p><a href={PHONE_TEL} className="elroi-text-link">Arrange a call by phone <Phone size={16}/></a></details>}
    <div className="flow-planner-top"><Link to="/account/?view=schedules" className="elroi-text-link"><ArrowLeft size={16}/>Your scheduled calls</Link><span>Step {step+1} of {steps.length}</span></div>
    <nav className="flow-steps" aria-label="Booking progress">{steps.map((label,index)=><button type="button" key={label} disabled={busy || index>step} aria-current={index===step?'step':undefined} onClick={()=>{setStep(index);setError('');}}><span>{index<step?<Check size={15}/>:index+1}</span>{label}</button>)}</nav>
    <div className="elroi-schedule-layout">
      <div id="schedule-form" className="elroi-schedule-form">
        <h2 ref={heading} tabIndex={-1} className="flow-step-title">{steps[step]}</h2>
        {notice&&<p className="elroi-schedule-notice" role="status">{notice}</p>}
        {step===0&&<>
          <fieldset className="elroi-schedule-card" disabled={busy}><legend>What would you like to hear?</legend><p className="elroi-schedule-help">Choose a custom call, or a guided journey below.</p><div className="elroi-content-options">{CONTENT_TYPES.map(type=><label className="elroi-choice" data-selected={!choices.journey_slug&&choices.content_type===type.id} key={type.id}><input type="radio" name="call-format" checked={!choices.journey_slug&&choices.content_type===type.id} onChange={()=>change({content_type:type.id,journey_slug:null,recurrence:'once',weekdays:[]})}/><span><strong>{type.name}</strong><span>{type.description}</span></span></label>)}</div><details className="flow-details" open={Boolean(choices.journey_slug)}><summary>Or choose a seven-call journey</summary><div className="elroi-journey-options">{JOURNEYS.map(journey=><button type="button" key={journey.id} data-selected={choices.journey_slug===journey.id} onClick={()=>chooseJourney(journey.id)}><strong>{journey.name}</strong><small>{journey.description}</small></button>)}</div></details><label className="elroi-field" htmlFor="lesson-topic">Topic or Bible passage<input id="lesson-topic" value={choices.topic} onChange={event=>change({topic:event.target.value})} maxLength={160} placeholder="For example: Psalm 23, prayer, or the life of Jesus" required/></label></fieldset>
          <fieldset className="elroi-schedule-card" disabled={busy}><legend>Choose your voice</legend><p className="elroi-schedule-help">All voices are AI generated. You can change your choice for any new schedule.</p><div className="elroi-voice-options">{VOICES.map(voice=><div key={voice.id} className="elroi-voice-option" data-selected={choices.voice===voice.id}><label><input type="radio" name="call-voice" checked={choices.voice===voice.id} onChange={()=>change({voice:voice.id})}/><strong>{voice.name}</strong></label><button type="button" disabled={!caps?.voice_ready || !session} onClick={()=>void preview(voice.id)} aria-label={`${previewVoice===voice.id?'Stop':'Preview'} ${voice.name}`}>{previewVoice===voice.id?previewLoading?<LoaderCircle size={16} className="animate-spin"/>:<Pause size={16}/>:<Play size={16}/>}Listen</button></div>)}</div><p className="elroi-small">{!session?'Sign in at the number step to unlock voice samples; you can return here before confirming.':caps?.voice_ready?'Listen to a sample before choosing.':'Voice samples are currently unavailable.'}</p></fieldset>
        </>}
        {step===1&&<fieldset className="elroi-schedule-card" disabled={busy}><legend>When should we call?</legend>{choices.journey_slug?<p className="elroi-schedule-help">Seven daily calls at your chosen time. The journey ends automatically after call seven.</p>:<><div className="elroi-recurrence"><label><input type="radio" name="recurrence" checked={choices.recurrence==='once'} onChange={()=>change({recurrence:'once',weekdays:[]})}/>Just once</label><label><input type="radio" name="recurrence" checked={choices.recurrence==='weekly'} onChange={()=>change({recurrence:'weekly'})}/>Repeat on chosen days</label></div>{choices.recurrence==='weekly'&&<div className="elroi-days" role="group" aria-label="Days to call">{WEEKDAYS.map((day,index)=><label key={day} data-selected={choices.weekdays.includes(index)}><input type="checkbox" checked={choices.weekdays.includes(index)} onChange={event=>change({weekdays:event.target.checked?[...choices.weekdays,index].sort():choices.weekdays.filter(value=>value!==index)})}/>{day.slice(0,3)}</label>)}</div>}</>}<div className="elroi-schedule-fields"><label className="elroi-field" htmlFor="call-date">{choices.recurrence==='once'?'Call date':'Start on or after'}<input id="call-date" type="date" min={localDate(new Date(),choices.timezone)} required value={choices.start_date} onChange={event=>change({start_date:event.target.value})}/></label><label className="elroi-field" htmlFor="call-time">Local call time<input id="call-time" type="time" value={choices.local_time} onChange={event=>change({local_time:event.target.value})} required/></label></div><div className="elroi-schedule-fields"><label className="elroi-field" htmlFor="call-zone">Time zone<select id="call-zone" value={choices.timezone} onChange={event=>change({timezone:event.target.value})}>{zones.map(zone=><option key={zone} value={zone}>{zone.replaceAll('_',' ')}</option>)}</select></label><label className="elroi-field" htmlFor="call-length">Approximate length<select id="call-length" value={choices.duration_minutes} onChange={event=>change({duration_minutes:Number(event.target.value)})}>{[5,10,15].map(value=><option key={value} value={value}>{value} minutes</option>)}</select></label></div><p className="elroi-small">Allow at least 20 minutes to prepare your call. Recurring calls follow this time zone when clocks change. A local time skipped by daylight saving is skipped for that day.</p></fieldset>}
        {step===2&&<section className="elroi-schedule-card"><h3>Your account and calling number</h3><p className="elroi-schedule-help">Signing in opens your account. Verifying your phone proves that the calling number is yours. You give permission for scheduled calls at the final review.</p>{authLoading?<p role="status">Checking your sign-in…</p>:!session?<AccountSignIn destination="/schedule/" initialMode="signin"/>:member?<><p className="elroi-verified"><Check size={18}/>Signed in{session.user.email?` as ${session.user.email}`:''}.</p><MemberControls key={`${session.user.id}-${member.phone}-${member.phone_verified}`} session={session} member={member} onRefresh={refreshMember}/></>:<p role="status">{memberError||'Loading your calling number…'}</p>}{session&&<button type="button" className="elroi-text-link" onClick={()=>void refreshMember()}>Refresh calling number</button>}<p className="elroi-small">Your six-digit calling PIN is managed in Preferences. It is not your website password or the temporary verification code.</p></section>}
        {step===3&&<section className="elroi-schedule-card"><h3>Review your call</h3><p className="elroi-schedule-help">Nothing has been booked yet. Confirm only when these choices are right.</p><dl className="flow-review"><div><dt>Content</dt><dd>{journeyName(choices.journey_slug)||contentName(choices.content_type)}<br/>{choices.topic}<button type="button" onClick={()=>setStep(0)} className="elroi-text-link" disabled={busy}>Edit content & voice</button></dd></div><div><dt>Voice & length</dt><dd>{voiceName(choices.voice)} · about {choices.duration_minutes} minutes</dd></div><div><dt>When</dt><dd>{choices.local_time} · {choices.journey_slug?'Every day, seven calls':planLabel(choices)}<br/>{choices.timezone.replaceAll('_',' ')}{choices.recurrence==='weekly'&&<><br/>Starting on or after {choices.start_date}</>}<button type="button" onClick={()=>setStep(1)} className="elroi-text-link" disabled={busy}>Edit date & time</button></dd></div><div><dt>Calling</dt><dd>{member?.phone_verified?`Verified number ending in ${member.phone?.slice(-4)}`:'Your number still needs verification'}<button type="button" onClick={()=>setStep(2)} className="elroi-text-link" disabled={busy}>Check calling number</button></dd></div></dl><label className="elroi-schedule-consent"><input type="checkbox" checked={consent} disabled={busy} onChange={event=>setConsent(event.target.checked)}/><span>I want El Roi Call to place AI-narrated calls to my verified number for the content, days, and time shown above. I can pause future calls or press 9 during a scheduled call to stop this schedule. Consent is not a condition of purchase. Carrier charges may apply.</span></label>{(!caps?.ready || availabilityError)&&<p className="elroi-availability" role="status">{caps===null&&!availabilityError?'Checking scheduling availability…':'Scheduling is unavailable right now. Your choices are saved, but no call is booked.'}</p>}</section>}
        {error&&<p className="elroi-status-error" role="alert">{error}</p>}
        <div className="flow-step-actions">{step>0&&<button type="button" className="elroi-button elroi-button-secondary" disabled={busy} onClick={()=>{setStep(value=>value-1);setError('');}}><ArrowLeft size={16}/>Back</button>}{step<3?<button type="button" className="elroi-button elroi-button-primary" disabled={busy||authLoading} onClick={continueStep}>Continue <ArrowRight size={16}/></button>:<button type="button" className="elroi-button elroi-button-primary" disabled={busy||!caps?.ready||!session||!member?.phone_verified||!consent} onClick={()=>void save()}><CalendarClock size={18}/>{busy?'Confirming…':'Confirm my schedule'}</button>}</div>
        <p className="elroi-small">Draft choices are kept on this browser for up to 30 minutes. Permission is never preselected. A draft is not a booking.</p>
      </div>
      <aside className="elroi-schedule-summary"><span className="elroi-icon-tile"><Headphones size={24}/></span><p className="elroi-kicker">NOT BOOKED YET</p><h2>{journeyName(choices.journey_slug)||contentName(choices.content_type)}</h2><p>{choices.topic||'Your topic will guide the call.'}</p><dl><div><dt>Voice</dt><dd>{voiceName(choices.voice)}</dd></div><div><dt>Time</dt><dd>{choices.local_time||'Choose a time'}</dd></div><div><dt>Time zone</dt><dd>{choices.timezone.replaceAll('_',' ')}</dd></div><div><dt>Length</dt><dd>About {choices.duration_minutes} minutes</dd></div></dl><div className="elroi-schedule-anytime"><Phone size={20}/><strong>Need a conversation now?</strong><p>Calling El Roi yourself is separate from this scheduled call.</p><a href={PHONE_TEL} className="elroi-text-link">Call now</a></div><Link to="/account/?view=schedules" className="elroi-text-link">Manage existing calls</Link></aside>
    </div>
  </ProductShell>;
}
